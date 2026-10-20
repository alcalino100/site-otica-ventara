import { createClient } from "@supabase/supabase-js";

/**
 * Cliente administrativo com privilégio elevado (Service Role)
 * EXCLUSIVO PARA O SERVIDOR:
 * - Criação de pedidos após validação estrita de preços
 * - Manipulação de estoque e webhooks de pagamento
 * NUNCA importe este arquivo em Client Components ("use client")!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return createClient(
      supabaseUrl || "https://placeholder-project.supabase.co",
      serviceRoleKey || "placeholder-service-role-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
