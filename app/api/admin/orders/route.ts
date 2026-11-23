import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEMO_ORDERS, resetDemoOrders } from "@/lib/orders-tracker";
import { releaseStockForOrder, releaseCouponsForOrder } from "@/lib/stock-reservation";
import { isPaymentMockAllowed } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

/** Marca interna nas anotações: pedido arquivado some da lista, mas o histórico financeiro permanece. */
const ARCHIVED_MARK = "[ARQUIVADO]";
/** Só pedidos que nunca foram pagos (ou já cancelados) podem ser apagados de vez. */
const DELETABLE_STATUSES = ["pending", "awaiting_payment", "cancelled"];

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    if (req.nextUrl.searchParams.get("reset") === "1" || req.nextUrl.searchParams.get("reset") === "true") {
      resetDemoOrders();
      return NextResponse.json({ success: true, message: "Demo orders reset.", orders: Object.values(DEMO_ORDERS) });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        orders: Object.values(DEMO_ORDERS),
      });
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Aviso ao buscar pedidos no Supabase:", error.message);
      // Em produção nunca mostra pedidos de demonstração no lugar dos reais
      if (!isPaymentMockAllowed()) {
        return NextResponse.json({ success: false, error: "Não foi possível carregar os pedidos agora.", orders: [] }, { status: 500 });
      }
    }
    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        orders: isPaymentMockAllowed() ? Object.values(DEMO_ORDERS) : [],
      });
    }

    const showArchived = req.nextUrl.searchParams.get("arquivados") === "1";
    return NextResponse.json({
      success: true,
      orders: showArchived ? data : data.filter((o: any) => !String(o.notes || "").includes(ARCHIVED_MARK)),
    });
  } catch (err: any) {
    console.error("Erro interno ao buscar pedidos:", err);
    if (!isPaymentMockAllowed()) {
      return NextResponse.json({ success: false, error: "Não foi possível carregar os pedidos agora.", orders: [] }, { status: 500 });
    }
    return NextResponse.json({ success: true, orders: Object.values(DEMO_ORDERS) });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json();
    const { id, status, delivery_type } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID e status do pedido são obrigatórios." },
        { status: 400 }
      );
    }

    // Sincroniza também no repositório DEMO em memória para testes e fallback local
    let matchedDemo: any = null;
    for (const [key, demo] of Object.entries(DEMO_ORDERS)) {
      if (demo.id === id || demo.reference_code === id || key === id) {
        demo.status = status;
        if (status === "ready_for_pickup") {
          demo.delivery_type = "pickup_store";
          demo.tracking_number = null;
        } else if (status === "shipped") {
          demo.delivery_type = "shipping";
        }
        demo.updated_at = new Date().toISOString();
        matchedDemo = demo;
      }
    }

    if (!isSupabaseConfigured()) {
      try {
        revalidatePath("/rastreio");
        revalidatePath("/rastrear-pedido");
      } catch {}
      return NextResponse.json({
        success: true,
        order: matchedDemo || { id, status },
      });
    }

    const adminSupabase = createAdminClient();

    // Busca pedido anterior para verificar mudança de status e itens
    const { data: currentOrder } = await adminSupabase
      .from("orders")
      .select("id, status, reference_code, notes, items:order_items(*)")
      .eq("id", id)
      .single();

    // Cancelamento: devolve ao estoque somente o que foi reservado para este pedido (idempotente)
    if (status === "cancelled" && currentOrder && currentOrder.status !== "cancelled" && currentOrder.reference_code) {
      try {
        await releaseStockForOrder(adminSupabase, currentOrder.reference_code);
        await releaseCouponsForOrder(adminSupabase, currentOrder);
      } catch (invErr) {
        console.warn("Aviso ao estornar estoque no cancelamento:", invErr);
      }
    }

    let dbStatus = status;
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status === "ready_for_pickup") {
      updatePayload.shipping_address = {
        delivery_type: "pickup",
        store: "Óticas Ventara - Rua Princesa Isabel, 221 - Araçatuba/SP",
      };
      updatePayload.tracking_number = null;
      // Garante marcação clara de retirada nas anotações internas
      const existingNotes = currentOrder?.notes || "";
      if (!existingNotes.includes("[RETIRADA NA LOJA]")) {
        updatePayload.notes = `${existingNotes} [RETIRADA NA LOJA]`.trim();
      }
      dbStatus = "ready_for_pickup";
    } else if (status === "shipped") {
      updatePayload.shipping_address = {
        delivery_type: "shipping",
      };
      dbStatus = "shipped";

      // Limpa qualquer anotação de retirada antiga se o pedido foi despachado
      if (currentOrder?.notes?.includes("[RETIRADA NA LOJA]")) {
        updatePayload.notes = currentOrder.notes.replace("[RETIRADA NA LOJA]", "[ENVIO DESPACHADO]").trim();
      }
    }

    updatePayload.status = dbStatus;

    let { data, error } = await adminSupabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select(`*, items:order_items(*)`)
      .single();

    // Se a coluna tracking_number ainda não existir no banco, remove do payload e tenta novamente
    if (error && error.message.includes("tracking_number")) {
      delete updatePayload.tracking_number;
      const retryResult = await adminSupabase
        .from("orders")
        .update(updatePayload)
        .eq("id", id)
        .select(`*, items:order_items(*)`)
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    // Se o banco ainda estiver com constraint antiga sem 'ready_for_pickup', faz fallback seguro
    if (error && dbStatus === "ready_for_pickup" && error.message.includes("orders_status_check")) {
      updatePayload.status = "shipped";
      const fallbackResult = await adminSupabase
        .from("orders")
        .update(updatePayload)
        .eq("id", id)
        .select(`*, items:order_items(*)`)
        .single();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.warn("Aviso ao persistir atualização no banco, mantendo local:", error.message);
      // Se estiver em ambiente sem banco live ou teste, retorna o status atualizado
      const matchedDemo = Object.values(DEMO_ORDERS).find(
        (d: any) => d.id === id || d.reference_code === id
      );
      if (matchedDemo && isPaymentMockAllowed()) {
        return NextResponse.json({ success: true, order: matchedDemo });
      }
      // Antes devolvia "sucesso" mesmo sem gravar: o admin achava que o status tinha mudado
      if (!isPaymentMockAllowed()) {
        return NextResponse.json({ error: `Não foi possível atualizar o pedido: ${error.message}` }, { status: 500 });
      }
    }

    try {
      revalidatePath("/rastreio");
      revalidatePath("/rastrear-pedido");
    } catch {}

    return NextResponse.json({
      success: true,
      order: data || { id, status },
    });
  } catch (err: any) {
    console.error("Erro interno ao atualizar pedido:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar pedido." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_cpf,
      customer_phone,
      customer_email,
      delivery_type,
      shipping_address,
      items,
      total_in_cents,
      payment_method,
      status,
      notes,
    } = body;

    if (!customer_name || !customer_phone) {
      return NextResponse.json(
        { error: "Nome e Telefone do cliente são obrigatórios para registrar o pedido." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Gera código de referência exclusivo
    const reference_code = `VEN-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalEmail =
      customer_email ||
      `${customer_phone.replace(/\D/g, "") || "cliente"}@cliente.oticasventara.com.br`;

    const finalShippingAddress =
      delivery_type === "pickup"
        ? {
            delivery_type: "pickup",
            store: "Óticas Ventara - Loja Física Araçatuba",
            address: "Rua Princesa Isabel, 221 - São Joaquim, Araçatuba/SP",
          }
        : {
            delivery_type: "shipping",
            ...(shipping_address || {}),
          };

    // Calcula subtotal e total
    const computedSubtotal = Array.isArray(items) && items.length > 0
      ? items.reduce(
          (acc: number, item: any) =>
            acc + (Number(item.unit_price_in_cents) || 0) * (Number(item.quantity) || 1),
          0
        )
      : Number(total_in_cents) || 0;

    const finalTotal = Number(total_in_cents) || computedSubtotal;

    // Normaliza status para respeitar o banco
    const dbStatus = status === "ready_for_pickup" ? "shipped" : (status || "paid");

    const orderPayload = {
      reference_code,
      customer_name,
      customer_email: finalEmail,
      customer_phone,
      customer_document: customer_cpf || null,
      shipping_address: finalShippingAddress,
      subtotal_in_cents: computedSubtotal,
      shipping_fee_in_cents: 0,
      discount_in_cents: 0,
      total_in_cents: finalTotal,
      status: dbStatus,
      payment_method: payment_method || "in_store",
      notes: delivery_type === "pickup" ? `[RETIRADA NA LOJA] ${notes || ""}`.trim() : (notes || null),
    };

    let { data: createdOrder, error: orderError } = await adminSupabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    // Código de referência repetido (únicos): tenta de novo com outro código
    for (let i = 0; i < 3 && orderError?.code === "23505"; i++) {
      orderPayload.reference_code = `VEN-${Math.floor(100000 + Math.random() * 900000)}`;
      ({ data: createdOrder, error: orderError } = await adminSupabase.from("orders").insert(orderPayload).select().single());
    }

    if (orderError && !isPaymentMockAllowed()) {
      // Em produção nunca finge que gravou: o pedido simplesmente não existiria no banco
      console.error("Erro ao persistir pedido:", orderError.message);
      return NextResponse.json({ error: `Não foi possível registrar o pedido: ${orderError.message}` }, { status: 500 });
    }

    if (orderError) {
      console.warn("Aviso ao persistir pedido no Supabase:", orderError.message);
      // Retorna objeto em memória como fallback funcional
      const fallbackOrder = {
        id: `local-${Date.now()}`,
        ...orderPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: items || [],
      };
      return NextResponse.json({
        success: true,
        order: fallbackOrder,
        message: "Pedido registrado com sucesso!",
      });
    }

    // Insere itens do pedido se fornecidos
    if (createdOrder?.id && Array.isArray(items) && items.length > 0) {
      const itemsPayload = items.map((item: any) => ({
        order_id: createdOrder.id,
        product_name: item.product_name || "Armação / Lente Ótica",
        sku: item.sku || `VENT-${Math.floor(1000 + Math.random() * 9000)}`,
        quantity: Number(item.quantity) || 1,
        unit_price_in_cents: Number(item.unit_price_in_cents) || 0,
        total_price_in_cents:
          (Number(item.quantity) || 1) * (Number(item.unit_price_in_cents) || 0),
      }));

      const { data: createdItems } = await adminSupabase
        .from("order_items")
        .insert(itemsPayload)
        .select();

      return NextResponse.json({
        success: true,
        order: {
          ...createdOrder,
          items: createdItems || itemsPayload,
        },
        message: "Pedido registrado com sucesso!",
      });
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
      message: "Pedido registrado com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro interno ao criar pedido:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao cadastrar pedido." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const searchParams = req.nextUrl.searchParams;
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // Ignora erro de JSON vazio
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID do pedido é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    // Pedido que nunca foi gravado (criado só em memória): não há o que apagar no banco
    if (String(id).startsWith("local-")) {
      return NextResponse.json({ success: true, message: "Pedido excluído com sucesso.", id });
    }

    const adminSupabase = createAdminClient();

    const { data: toDelete } = await adminSupabase
      .from("orders")
      .select("id, reference_code, status, notes")
      .eq("id", id)
      .maybeSingle();

    // Pedido pago/em produção/enviado/entregue/reembolsado: arquiva (histórico financeiro não se apaga)
    if (toDelete && !DELETABLE_STATUSES.includes(toDelete.status)) {
      const notes = String(toDelete.notes || "");
      if (!notes.includes(ARCHIVED_MARK)) {
        const { error: archiveError } = await adminSupabase
          .from("orders")
          .update({ notes: `${notes} ${ARCHIVED_MARK}`.trim(), updated_at: new Date().toISOString() })
          .eq("id", id);
        if (archiveError) {
          return NextResponse.json({ error: `Erro ao arquivar pedido: ${archiveError.message}` }, { status: 400 });
        }
      }
      return NextResponse.json({
        success: true,
        archived: true,
        message: "Pedido arquivado com sucesso. O histórico financeiro foi preservado.",
        id,
      });
    }

    // 0. Pedido em aberto reserva estoque/cupom: devolve antes de apagar (senão a peça ficaria presa)
    try {
      if (toDelete && ["pending", "awaiting_payment"].includes(toDelete.status)) {
        await releaseStockForOrder(adminSupabase, toDelete.reference_code);
        await releaseCouponsForOrder(adminSupabase, toDelete);
      }
    } catch (err) {
      console.warn("Aviso ao devolver estoque antes de excluir pedido:", err);
    }

    // 1. Remove itens associados primeiro para garantir integridade referencial
    await adminSupabase.from("order_items").delete().eq("order_id", id);

    // 2. Remove o pedido
    const { error } = await adminSupabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir pedido no Supabase:", error);
      return NextResponse.json(
        { error: `Erro ao excluir pedido: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pedido excluído com sucesso.",
      id,
    });
  } catch (err: any) {
    console.error("Erro interno ao excluir pedido:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir pedido." },
      { status: 500 }
    );
  }
}
