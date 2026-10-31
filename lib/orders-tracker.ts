/**
 * Módulo centralizado de rastreamento de pedidos e linha do tempo técnica
 * Garante 100% de consistência entre o Painel Admin e a Página Pública de Rastreio.
 */

export interface TimelineStep {
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  timestamp?: string;
}

export interface TrackedOrderResponse {
  id?: string;
  reference_code: string;
  customer_name: string;
  status: string;
  status_label: string;
  status_description: string;
  created_at: string;
  updated_at: string;
  delivery_type: "pickup_store" | "shipping";
  delivery_label: string;
  delivery_address: string;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery: string;
  current_step_index: number;
  timeline: TimelineStep[];
  items: Array<{
    name: string;
    variant: string;
    quantity: number;
    lenses?: string;
  }>;
}

// Repositório em memória para persistência de pedidos de demonstração e testes locais
export const INITIAL_DEMO_ORDERS: Record<string, any> = {
  "VEN-10294": {
    id: "demo-ven-10294",
    reference_code: "VEN-10294",
    customer_name: "Mariana S.",
    customer_document: "12345678900",
    customer_phone: "18999991111",
    customer_email: "mariana@exemplo.com",
    status: "preparing",
    created_at: "2026-10-22T14:30:00.000Z",
    updated_at: "2026-10-22T18:15:00.000Z",
    delivery_type: "pickup_store",
    items: [
      {
        product_name: "Ventara Essencial Black Gold",
        color_name: "Preto Fosco com Filetes Dourados",
        quantity: 1,
        lenses: "Lentes Visão Simples OPTiSYNC HD + Antirreflexo Premium",
      },
    ],
  },
  "VEN-10380": {
    id: "demo-ven-10380",
    reference_code: "VEN-10380",
    customer_name: "Rodrigo M.",
    customer_document: "98765432100",
    customer_phone: "18999992222",
    customer_email: "rodrigo@exemplo.com",
    status: "ready_for_pickup",
    created_at: "2026-10-21T10:15:00.000Z",
    updated_at: "2026-10-22T11:00:00.000Z",
    delivery_type: "pickup_store",
    items: [
      {
        product_name: "Ventara Urbano Titanium Grey",
        color_name: "Cinza Titânio Fosco",
        quantity: 1,
        lenses: "Lentes Solares Polarizadas com Proteção UV400",
      },
    ],
  },
  "VEN-10415": {
    id: "demo-ven-10415",
    reference_code: "VEN-10415",
    customer_name: "Carlos A.",
    customer_document: "45678912300",
    customer_phone: "18999993333",
    customer_email: "carlos@exemplo.com",
    status: "shipped",
    tracking_number: "BR839210492VENT",
    created_at: "2026-10-20T16:00:00.000Z",
    updated_at: "2026-10-22T08:30:00.000Z",
    delivery_type: "shipping",
    shipping_address: {
      street: "Av. Paulista",
      number: "1000",
      city: "São Paulo",
      state: "SP",
      postal_code: "01310-100",
    },
    items: [
      {
        product_name: "Ventara Aurora Havana Gold",
        color_name: "Tartaruga Havana Premium",
        quantity: 1,
        lenses: "Lentes Multifocais Varilux Comfort Max Antirreflexo Crizal",
      },
    ],
  },
};

export const DEMO_ORDERS: Record<string, any> = JSON.parse(JSON.stringify(INITIAL_DEMO_ORDERS));

export function resetDemoOrders() {
  for (const key of Object.keys(DEMO_ORDERS)) {
    delete DEMO_ORDERS[key];
  }
  Object.assign(DEMO_ORDERS, JSON.parse(JSON.stringify(INITIAL_DEMO_ORDERS)));
}

/**
 * Constrói a resposta completa e a timeline técnica com base no status real do pedido
 */
export function buildTrackingPayload(order: any): TrackedOrderResponse {
  // 1. Identificação precisa se é Retirada na Loja física
  // Se o status for explicitamente ready_for_pickup, É ESTREITAMENTE RETIRADA NA LOJA
  const isPickup =
    order.status === "ready_for_pickup" ||
    order.delivery_type === "pickup" ||
    order.delivery_type === "pickup_store" ||
    order.shipping_address?.delivery_type === "pickup" ||
    (order.notes && order.notes.toLowerCase().includes("[retirada"));

  const isShipping = !isPickup;

  // 2. Mapeamento de rótulos e descrições técnicas
  let statusLabel = "Pedido Recebido";
  let statusDesc = "Pedido registrado com sucesso na Óticas Ventara.";
  let currentStep = 0;

  switch (order.status) {
    case "pending":
    case "awaiting_payment":
      statusLabel = "Aguardando Pagamento";
      statusDesc = "Aguardando confirmação do pagamento via Pix ou Cartão para iniciar a produção no laboratório.";
      currentStep = 0;
      break;

    case "paid":
      statusLabel = "Pagamento Confirmado";
      statusDesc = "Pagamento aprovado com sucesso. Pedido em fila para validação técnica da receita médica e DNP.";
      currentStep = 1;
      break;

    case "preparing":
      statusLabel = "Em Montagem no Laboratório";
      statusDesc = "Suas lentes estão sendo cortadas com alta precisão na facetadora digital sob supervisão do Técnico Óptico.";
      currentStep = 2;
      break;

    case "ready_for_pickup":
      statusLabel = "Pronto para Retirada na Loja";
      statusDesc = "Seus óculos foram calibrados, higienizados e estão disponíveis para retirada no balcão da Óticas Ventara (Rua Princesa Isabel, 221 - Araçatuba/SP).";
      currentStep = 4;
      break;

    case "shipped":
      if (isPickup) {
        statusLabel = "Pronto para Retirada na Loja";
        statusDesc = "Seus óculos foram calibrados, higienizados e estão disponíveis para retirada no balcão da Óticas Ventara (Rua Princesa Isabel, 221 - Araçatuba/SP).";
      } else {
        statusLabel = "Enviado e Despachado";
        statusDesc = order.tracking_number
          ? `Seus óculos foram despachados para envio com código de rastreamento: ${order.tracking_number}.`
          : "Seus óculos foram enviados e despachados. Aguardando a chegada no seu endereço de entrega.";
      }
      currentStep = 4;
      break;

    case "delivered":
      statusLabel = isPickup ? "Retirado na Loja" : "Pedido Entregue";
      statusDesc = isPickup
        ? "Óculos retirados com sucesso pelo cliente no balcão da Óticas Ventara em Araçatuba."
        : "Óculos entregues com sucesso ao cliente no endereço cadastrado.";
      currentStep = 4;
      break;

    case "cancelled":
      statusLabel = "Pedido Cancelado";
      statusDesc = "Este pedido foi cancelado no sistema. Se você tiver dúvidas ou precisar de suporte, fale conosco pelo WhatsApp.";
      currentStep = -1;
      break;

    case "refunded":
      statusLabel = "Pedido Reembolsado";
      statusDesc = "O estorno deste pedido foi processado com sucesso.";
      currentStep = -1;
      break;

    default:
      statusLabel = isPickup ? "Pronto para Retirada na Loja" : "Em Processamento";
      statusDesc = isPickup
        ? "Seus óculos estão prontos para retirada no balcão da Óticas Ventara."
        : "Seus óculos estão em acompanhamento no laboratório.";
      currentStep = isPickup ? 4 : 1;
      break;
  }

  // 3. Montagem da Linha do Tempo (Stepper) com 5 Etapas Técnicas Coerentes
  const timeline: TimelineStep[] = [
    {
      title: "Pedido Recebido",
      description:
        order.status === "pending" || order.status === "awaiting_payment"
          ? "Aguardando confirmação do pagamento."
          : "Pedido confirmado e registrado no laboratório.",
      status: currentStep >= 0 ? (currentStep === 0 ? "current" : "completed") : "pending",
      timestamp: new Date(order.created_at || Date.now()).toLocaleDateString("pt-BR"),
    },
    {
      title: "Triagem Técnica da Receita & DNP",
      description: "Conferência milimétrica das dioptrias, DNP e prescrição com o Técnico Óptico.",
      status:
        currentStep > 1
          ? "completed"
          : currentStep === 1
          ? "current"
          : "pending",
    },
    {
      title: "Montagem na Facetadora Computadorizada",
      description: "Corte e biselamento digital no laboratório próprio de Araçatuba.",
      status:
        currentStep > 2
          ? "completed"
          : currentStep === 2
          ? "current"
          : "pending",
    },
    {
      title: "Controle de Qualidade Dióptrico",
      description: "Aferição no lensômetro digital de alta precisão e higienização ultrassônica.",
      status:
        currentStep > 3
          ? "completed"
          : currentStep === 3
          ? "current"
          : "pending",
    },
    {
      title: isPickup
        ? order.status === "delivered"
          ? "Retirado na Loja"
          : "Pronto para Retirada na Loja"
        : order.status === "delivered"
        ? "Pedido Entregue"
        : "Enviado e Despachado",
      description: isPickup
        ? order.status === "delivered"
          ? "Óculos retirados com sucesso no balcão de Araçatuba."
          : "Disponível para retirada no balcão da Rua Princesa Isabel, 221 - Centro, Araçatuba-SP (09h às 18h)."
        : order.status === "delivered"
        ? "Entregue com sucesso no endereço informado."
        : order.tracking_number
        ? `Objeto despachado com código de rastreamento: ${order.tracking_number}.`
        : "Objeto postado e a caminho do endereço de entrega.",
      status:
        order.status === "delivered"
          ? "completed"
          : currentStep >= 4
          ? "current"
          : "pending",
    },
  ];

  // Se cancelado ou reembolsado, reflete o encerramento do processo
  if (order.status === "cancelled") {
    timeline[timeline.length - 1] = {
      title: "Pedido Cancelado",
      description: "Produção interrompida e pedido finalizado como cancelado.",
      status: "current",
    };
  } else if (order.status === "refunded") {
    timeline[timeline.length - 1] = {
      title: "Pedido Reembolsado",
      description: "Estorno concluído e pedido encerrado.",
      status: "current",
    };
  }

  // 4. Mascara o nome do cliente para privacidade (ex: Mariana S.)
  const nameParts = (order.customer_name || "Cliente").trim().split(" ");
  const maskedName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1][0]}.`
      : nameParts[0];

  const shippingAddr = order.shipping_address || {};
  const formattedShippingAddress = shippingAddr.street
    ? `${shippingAddr.street}${shippingAddr.number ? `, ${shippingAddr.number}` : ""}${shippingAddr.complement ? ` (${shippingAddr.complement})` : ""}${shippingAddr.neighborhood ? ` - ${shippingAddr.neighborhood}` : ""}${shippingAddr.city ? `, ${shippingAddr.city}` : ""}${shippingAddr.state ? `-${shippingAddr.state}` : ""}`
    : "Endereço cadastrado no pedido (Envio pelos Correios / Transportadora)";

  const cleanTrackingNumber = isPickup ? null : order.tracking_number || null;

  return {
    id: order.id,
    reference_code: order.reference_code,
    customer_name: maskedName,
    status: order.status,
    status_label: statusLabel,
    status_description: statusDesc,
    created_at: order.created_at,
    updated_at: order.updated_at,
    delivery_type: isPickup ? "pickup_store" : "shipping",
    delivery_label: isPickup
      ? "Retirada no Balcão da Loja Física (Rua Princesa Isabel, 221 - Centro, Araçatuba/SP)"
      : "Envio para Endereço Residencial",
    delivery_address: isPickup
      ? "Óticas Ventara · Rua Princesa Isabel, 221 - Centro, Araçatuba-SP"
      : formattedShippingAddress,
    tracking_number: cleanTrackingNumber,
    tracking_url: cleanTrackingNumber
      ? `https://rastreamento.correios.com.br/app/index.php?codigo=${cleanTrackingNumber}`
      : null,
    estimated_delivery: isPickup
      ? "Disponível para retirada imediata no horário comercial (09h às 18h)"
      : "Previsão de entrega conforme prazo dos Correios",
    current_step_index: currentStep,
    timeline,
    items: (order.items || []).map((it: any) => ({
      name: it.product_name || it.name || "Armação Óticas Ventara",
      variant: it.color_name || it.variant || "Padrão",
      quantity: it.quantity || 1,
      lenses: it.lenses || undefined,
    })),
  };
}
