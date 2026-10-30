import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { Product, ProductVariant, ShippingAddress } from "@/types/ecommerce";
import {
  createMercadoPagoPixPayment,
  createMercadoPagoPreference,
} from "@/lib/mercadopago";
import crypto from "crypto";

interface CheckoutItemInput {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

interface CheckoutRequestBody {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document?: string;
  delivery_type?: "store_pickup" | "delivery";
  shipping_address?: ShippingAddress;
  payment_method?: "pix" | "credit_card" | "whatsapp_assisted";
  coupon_code?: string;
  notes?: string;
  items: CheckoutItemInput[];
}

function generateOrderReference(): string {
  const dateStr = new Date().toISOString().slice(2, 7).replace("-", "");
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `VEN-${dateStr}-${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting por IP para evitar abusos / bots
    const ip = req.headers.get("x-forwarded-for") || "local-ip";
    const limitCheck = rateLimit(`checkout:${ip}`, { maxTokens: 10, intervalMs: 60000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Limite de tentativas excedido. Por favor, aguarde alguns instantes." },
        { status: 429 }
      );
    }

    // 2. Validação da requisição
    const body: CheckoutRequestBody = await req.json();

    if (!body.customer_name || body.customer_name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nome do cliente inválido ou muito curto." },
        { status: 400 }
      );
    }

    if (!body.customer_email || !body.customer_email.includes("@")) {
      return NextResponse.json(
        { error: "E-mail de contato inválido." },
        { status: 400 }
      );
    }

    if (!body.customer_phone || body.customer_phone.replace(/\D/g, "").length < 8) {
      return NextResponse.json(
        { error: "Telefone de contato inválido." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "O pedido deve conter ao menos um item válido." },
        { status: 400 }
      );
    }

    if (body.items.length > 20) {
      return NextResponse.json(
        { error: "Quantidade máxima de itens por pedido excedida." },
        { status: 400 }
      );
    }

    // 3. Consulta estrita de preços no Servidor (Zero confiança nos valores do cliente)
    const adminSupabase = createAdminClient();
    const hasLiveDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let dbProducts: Product[] = [];
    const productIds = body.items.map((i) => i.product_id);
    const validUuidProductIds = productIds.filter((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );

    if (hasLiveDb && validUuidProductIds.length > 0) {
      const { data, error } = await adminSupabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*)
        `)
        .in("id", validUuidProductIds)
        .eq("is_published", true);

      if (!error && data) {
        dbProducts = data as Product[];
      }
    }

    // Fallback para o catálogo estruturado caso o banco não retorne o registro
    const resolvedItems = [];
    let subtotalInCents = 0;

    for (const itemInput of body.items) {
      if (itemInput.quantity <= 0 || itemInput.quantity > 10) {
        return NextResponse.json(
          { error: `Quantidade inválida para o produto ${itemInput.product_id}.` },
          { status: 400 }
        );
      }

      // Procura primeiro no DB, senão no catálogo default
      let product = dbProducts.find((p) => p.id === itemInput.product_id);
      if (!product) {
        product = DEFAULT_CATALOG.find(
          (p, idx) =>
            p.id === itemInput.product_id ||
            p.slug === itemInput.product_id ||
            itemInput.product_id === `prod-${idx + 1}`
        );
      }

      if (!product) {
        return NextResponse.json(
          { error: `Produto não localizado no catálogo ativo: ${itemInput.product_id}.` },
          { status: 404 }
        );
      }

      // Localiza variante (cor / aro)
      let matchedVariant: ProductVariant | undefined;
      if (itemInput.variant_id && product.variants) {
        matchedVariant = product.variants.find((v) => v.id === itemInput.variant_id);
      }
      if (!matchedVariant && product.variants && product.variants.length > 0) {
        matchedVariant = product.variants[0];
      }

      // Verifica estoque caso controlado
      if (matchedVariant && matchedVariant.stock_quantity < itemInput.quantity) {
        return NextResponse.json(
          {
            error: `Estoque insuficiente para o modelo ${product.name} (${matchedVariant.color_name}). Disponível: ${matchedVariant.stock_quantity}.`,
          },
          { status: 409 }
        );
      }

      const unitPrice = product.price_in_cents;
      const itemTotal = unitPrice * itemInput.quantity;
      subtotalInCents += itemTotal;

      resolvedItems.push({
        product_id: product.id,
        variant_id: matchedVariant?.id || null,
        product_name: product.name,
        sku: matchedVariant?.sku || `SKU-${product.id}`,
        color_name: matchedVariant?.color_name || "Padrão",
        unit_price_in_cents: unitPrice,
        quantity: itemInput.quantity,
        total_price_in_cents: itemTotal,
      });
    }

    // 4. Busca regras de frete dinâmicas no site_settings
    let freeShippingThreshold = 35000;
    let defaultShippingFee = 2500;
    let storePickupEnabled = true;

    if (hasLiveDb) {
      try {
        const { data: shipRow } = await adminSupabase
          .from("site_settings")
          .select("value")
          .eq("key", "shipping")
          .maybeSingle();

        if (shipRow?.value) {
          const s = shipRow.value as any;
          if (typeof s.free_shipping_threshold_cents === "number") {
            freeShippingThreshold = s.free_shipping_threshold_cents;
          }
          if (typeof s.default_shipping_fee_cents === "number") {
            defaultShippingFee = s.default_shipping_fee_cents;
          }
          if (typeof s.store_pickup_enabled === "boolean") {
            storePickupEnabled = s.store_pickup_enabled;
          }
        }
      } catch (err) {
        console.warn("Usando regras padrão de frete:", err);
      }
    }

    const isPickup = body.delivery_type === "store_pickup" && storePickupEnabled;
    const shippingFeeInCents = isPickup || subtotalInCents >= freeShippingThreshold ? 0 : defaultShippingFee;

    // 4.1 Validação e Aplicação de Cupom de Desconto
    let discountInCents = 0;
    let appliedCouponCode: string | null = null;

    if (body.coupon_code && body.coupon_code.trim()) {
      const codeClean = body.coupon_code.trim().toUpperCase();

      if (hasLiveDb) {
        try {
          const { data: couponRow } = await adminSupabase
            .from("promotion_coupons")
            .select("*")
            .eq("code", codeClean)
            .eq("status", "issued")
            .maybeSingle();

          if (couponRow && new Date(couponRow.expires_at) >= new Date()) {
            appliedCouponCode = couponRow.code;
            if (couponRow.benefit_type === "percentage") {
              const pct = Number(couponRow.benefit_value) || 10;
              discountInCents = Math.round((subtotalInCents * pct) / 100);
            } else {
              const valCents = Math.round((Number(couponRow.benefit_value) || 0) * 100);
              discountInCents = Math.min(subtotalInCents, valCents);
            }

            // Marca cupom como utilizado
            await adminSupabase
              .from("promotion_coupons")
              .update({
                status: "used",
                used_at: new Date().toISOString(),
                used_by_operator: `Pedido Online (${body.customer_email})`,
              })
              .eq("id", couponRow.id);
          }
        } catch (err) {
          console.warn("Erro ao consultar cupom no Supabase:", err);
        }
      }

      // Cupons promocionais oficiais de fallback
      if (!appliedCouponCode) {
        if (codeClean === "VENTARA10" || codeClean === "BEMVINDO10" || codeClean.startsWith("VEN-10")) {
          appliedCouponCode = codeClean;
          discountInCents = Math.round((subtotalInCents * 10) / 100);
        } else if (codeClean === "VENTARA15" || codeClean === "BEMVINDO15" || codeClean.startsWith("VEN-15")) {
          appliedCouponCode = codeClean;
          discountInCents = Math.round((subtotalInCents * 15) / 100);
        } else if (codeClean === "VENTARA20" || codeClean.startsWith("VEN-20")) {
          appliedCouponCode = codeClean;
          discountInCents = Math.round((subtotalInCents * 20) / 100);
        }
      }
    }

    const totalInCents = Math.max(0, subtotalInCents + shippingFeeInCents - discountInCents);

    const referenceCode = generateOrderReference();
    const paymentMethod = body.payment_method || "pix";

    // 5. Persistência do Pedido no Banco de Dados
    let orderId = crypto.randomUUID();

    const orderNotes = [
      body.notes,
      appliedCouponCode ? `Cupom: ${appliedCouponCode} (-R$ ${(discountInCents / 100).toFixed(2)})` : null,
      isPickup ? "Retirada na loja física em Araçatuba" : null,
    ]
      .filter(Boolean)
      .join(" | ") || null;

    if (hasLiveDb) {
      const { data: orderData, error: orderErr } = await adminSupabase
        .from("orders")
        .insert({
          id: orderId,
          reference_code: referenceCode,
          customer_name: body.customer_name.trim(),
          customer_email: body.customer_email.trim().toLowerCase(),
          customer_phone: body.customer_phone.trim(),
          customer_document: body.customer_document || null,
          shipping_address: body.shipping_address || null,
          subtotal_in_cents: subtotalInCents,
          shipping_fee_in_cents: shippingFeeInCents,
          discount_in_cents: discountInCents,
          total_in_cents: totalInCents,
          status: "pending",
          payment_method: paymentMethod,
          notes: orderNotes,
        })
        .select()
        .single();

      if (orderErr) {
        if (orderErr.code === "PGRST205") {
          console.warn("Tabela 'orders' ainda não criada no Supabase. Emitindo pedido com fallback.");
        } else {
          console.error("Erro ao registrar pedido:", orderErr);
          return NextResponse.json(
            { error: "Falha ao gravar pedido no banco de dados." },
            { status: 500 }
          );
        }
      }

      if (orderData) {
        orderId = orderData.id;

        // Gravação dos itens congelados com validação de UUIDs
        const isUuid = (val: any) =>
          typeof val === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        const itemsToInsert = resolvedItems.map((item) => ({
          ...item,
          product_id: isUuid(item.product_id) ? item.product_id : null,
          variant_id: isUuid(item.variant_id) ? item.variant_id : null,
          order_id: orderId,
        }));

        const { error: itemsErr } = await adminSupabase.from("order_items").insert(itemsToInsert);
        if (itemsErr) {
          console.error("Erro ao registrar itens do pedido:", itemsErr);
        }
      }
    }

    // 6. Dados de Pagamento via Mercado Pago (Pix e Cartão de Crédito)
    let paymentPayload: any = {
      type: paymentMethod,
      gateway: "mercadopago",
    };

    if (paymentMethod === "pix") {
      const pixResult = await createMercadoPagoPixPayment({
        orderId,
        referenceCode,
        amountInCents: totalInCents,
        customer: {
          name: body.customer_name,
          email: body.customer_email,
          phone: body.customer_phone,
          document: body.customer_document,
        },
      });

      if (hasLiveDb && pixResult.paymentId) {
        await adminSupabase
          .from("orders")
          .update({
            payment_gateway_id: pixResult.paymentId,
            status: "awaiting_payment",
          })
          .eq("id", orderId);
      }

      paymentPayload = {
        ...paymentPayload,
        payment_id: pixResult.paymentId,
        pix_copia_e_cola: pixResult.qrCode,
        pix_qr_code_base64: pixResult.qrCodeBase64,
        ticket_url: pixResult.ticketUrl,
        expires_at: pixResult.expiresAt,
        expires_in_minutes: 30,
        is_mock: pixResult.isMock,
      };
    } else if (paymentMethod === "credit_card") {
      const prefResult = await createMercadoPagoPreference({
        orderId,
        referenceCode,
        amountInCents: totalInCents,
        items: resolvedItems.map((it) => ({
          title: it.product_name,
          unitPriceInCents: it.unit_price_in_cents,
          quantity: it.quantity,
        })),
        customer: {
          name: body.customer_name,
          email: body.customer_email,
          phone: body.customer_phone,
          document: body.customer_document,
        },
      });

      if (hasLiveDb && prefResult.preferenceId) {
        await adminSupabase
          .from("orders")
          .update({
            payment_gateway_id: prefResult.preferenceId,
            status: "awaiting_payment",
          })
          .eq("id", orderId);
      }

      paymentPayload = {
        ...paymentPayload,
        preference_id: prefResult.preferenceId,
        checkout_url: prefResult.initPoint,
        sandbox_checkout_url: prefResult.sandboxInitPoint,
        is_mock: prefResult.isMock,
      };
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: orderId,
          reference_code: referenceCode,
          customer_name: body.customer_name,
          customer_email: body.customer_email,
          subtotal_in_cents: subtotalInCents,
          shipping_fee_in_cents: shippingFeeInCents,
          total_in_cents: totalInCents,
          status: "awaiting_payment",
          payment_method: paymentMethod,
          items: resolvedItems,
          delivery_type: body.delivery_type || "delivery",
        },
        payment: paymentPayload,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro inesperado no checkout:", error);
    return NextResponse.json(
      { error: "Erro interno no processamento do checkout." },
      { status: 500 }
    );
  }
}
