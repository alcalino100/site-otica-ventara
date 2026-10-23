import { test, expect } from "@playwright/test";
import {
  normalizeBrazilianPhone,
  formatBrazilianPhone,
  maskPhoneForDisplay,
  wheelLeadFormSchema,
  DEFAULT_PROMOTION_CONFIG,
} from "../types/promotion-wheel";
import { PromotionService, generateCouponCode } from "../lib/promotions/promotion-service";

test.describe("Módulo Roleta Promocional · Regras de Negócio e Segurança", () => {
  test("1. Validação e normalização de telefone brasileiro", () => {
    // DDD + 9 dígitos celular
    const cellPhone = "(18) 99812-3456";
    expect(normalizeBrazilianPhone(cellPhone)).toBe("18998123456");
    expect(maskPhoneForDisplay("18998123456")).toBe("(18) 9****-3456");

    // DDD + 8 dígitos fixo
    const landline = "(18) 3304-2808";
    expect(normalizeBrazilianPhone(landline)).toBe("1833042808");
    expect(maskPhoneForDisplay("1833042808")).toBe("(18) ****-2808");

    // Prefixo 55 internacional
    const withCountryCode = "5518998123456";
    expect(normalizeBrazilianPhone(withCountryCode)).toBe("18998123456");

    // Validação com Schema Zod
    const validData = wheelLeadFormSchema.safeParse({
      name: "Mariana Silva",
      phone: "(18) 99812-3456",
      marketingOptIn: false,
    });
    expect(validData.success).toBe(true);

    // Nome curto (< 2 chars) deve falhar
    const invalidName = wheelLeadFormSchema.safeParse({
      name: "A",
      phone: "(18) 99812-3456",
    });
    expect(invalidName.success).toBe(false);

    // Telefone com menos de 10 dígitos deve falhar
    const invalidPhone = wheelLeadFormSchema.safeParse({
      name: "Mariana Silva",
      phone: "123456",
    });
    expect(invalidPhone.success).toBe(false);
  });

  test("2. Modo FIXED garante rigorosamente 10% OFF e segmento compatível", async () => {
    const payload = {
      name: "Teste Cliente Fixo",
      phone: "(18) 99111-2233",
      marketingOptIn: false,
      campaignId: "camp-ventara-revelacao-v1",
      campaignVersion: 1,
      idempotencyKey: `test-fixed-${Date.now()}`,
      clientElapsedMs: 3500,
      hp_field: "",
    };

    const result = await PromotionService.processParticipation(payload);

    expect(result.success).toBe(true);
    expect(result.benefit.value).toBe(10);
    expect(result.benefit.type).toBe("percentage");
    expect(result.benefit.label).toBe("10% OFF");
    expect(result.coupon.code).toMatch(/^VENTARA-10-[2-9A-HJ-NP-Z]{5}$/);

    // O índice do segmento vencedor deve apontar para uma fatia que realmente seja 10% OFF
    const config = await PromotionService.getPublicCampaignConfig();
    const winningSeg = config!.segments[result.winning_segment_index];
    expect(winningSeg.value).toBe(10);
    expect(winningSeg.is_winner_eligible).toBe(true);
  });

  test("3. Idempotência e Deduplicação por telefone e campanha", async () => {
    const testPhone = "(18) 98888-7777";
    const payload1 = {
      name: "Cliente Idempotente",
      phone: testPhone,
      marketingOptIn: false,
      campaignId: "camp-ventara-revelacao-v1",
      campaignVersion: 1,
      idempotencyKey: `idem-1-${Date.now()}`,
      clientElapsedMs: 4000,
      hp_field: "",
    };

    const firstResult = await PromotionService.processParticipation(payload1);
    expect(firstResult.success).toBe(true);
    const initialCoupon = firstResult.coupon.code;

    // Segunda tentativa com mesmo telefone na mesma campanha
    const payload2 = {
      name: "Cliente Idempotente Tentativa 2",
      phone: testPhone,
      marketingOptIn: true,
      campaignId: "camp-ventara-revelacao-v1",
      campaignVersion: 1,
      idempotencyKey: `idem-2-${Date.now()}`,
      clientElapsedMs: 3000,
      hp_field: "",
    };

    const secondResult = await PromotionService.processParticipation(payload2);
    expect(secondResult.success).toBe(true);
    expect(secondResult.already_participated).toBe(true);
    // Deve retornar o mesmo cupom gerado na primeira participação sem duplicar
    expect(secondResult.coupon.code).toBe(initialCoupon);
  });

  test("4. Proteção contra bots: Honeypot e preenchimento instantâneo", async () => {
    // Caso 1: Honeypot preenchido
    const botPayload = {
      name: "Spam Bot",
      phone: "(18) 99999-0000",
      marketingOptIn: false,
      campaignId: "camp-ventara-revelacao-v1",
      campaignVersion: 1,
      idempotencyKey: `bot-${Date.now()}`,
      clientElapsedMs: 5000,
      hp_field: "http://spam-link.com",
    };

    await expect(PromotionService.processParticipation(botPayload)).rejects.toThrow(
      "Acesso inválido detectado."
    );

    // Caso 2: Tempo de preenchimento impossível (< 1.2s)
    const instantPayload = {
      name: "Fast Bot",
      phone: "(18) 99999-0001",
      marketingOptIn: false,
      campaignId: "camp-ventara-revelacao-v1",
      campaignVersion: 1,
      idempotencyKey: `fast-${Date.now()}`,
      clientElapsedMs: 400,
      hp_field: "",
    };

    await expect(PromotionService.processParticipation(instantPayload)).rejects.toThrow(
      "Envio excessivamente rápido."
    );
  });

  test("5. Geração de cupons únicos e seguros", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const code = generateCouponCode("VENTARA-10");
      expect(code).toMatch(/^VENTARA-10-[2-9A-HJ-NP-Z]{5}$/);
      // O sufixo randômico não deve conter caracteres ambíguos: 0, O, 1, I
      const randomSuffix = code.replace("VENTARA-10-", "");
      expect(randomSuffix).not.toMatch(/[0O1I]/);
      codes.add(code);
    }
    // Todos os 50 cupons devem ser únicos
    expect(codes.size).toBe(50);
  });

  test("6. Exportação CSV com proteção contra Fórmula Injection (RFC 4180)", async () => {
    const csv = await PromotionService.exportParticipationsCsv();
    expect(csv).toContain("ID,Nome,Telefone,Campanha,Versão,Benefício,Cupom,Status");
    // Garante que não existem fórmulas executáveis não escapadas
    expect(csv).not.toMatch(/\n[=+\-@]/);
  });
});
