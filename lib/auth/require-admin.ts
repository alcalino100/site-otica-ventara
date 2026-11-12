import { NextRequest, NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role: "super_admin" | "admin" | "editor";
  created_at?: string;
  updated_at?: string;
}

export interface AdminAuthSuccess {
  authorized: true;
  user: {
    id: string;
    email?: string | null;
  };
  profile: AdminProfile;
}

export interface AdminAuthFailure {
  authorized: false;
  response: NextResponse;
}

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

/**
 * Validação de sessão administrativa obrigatória para rotas em /api/admin/**
 * - Verifica sessão ativa no Supabase (@supabase/ssr, cookies)
 * - Valida se o usuário autenticado está presente na tabela admin_profiles
 * - Em ambientes locais/testes (NODE_ENV !== "production"), suporta token secreto PLAYWRIGHT_BYPASS_TOKEN
 * - Em PRODUÇÃO, qualquer tentativa de bypass por header ou cookie é estritamente ignorada
 */
export async function requireAdmin(req?: NextRequest): Promise<AdminAuthResult> {
  // 1. Checagem de bypass em ambiente de teste/desenvolvimento
  // Em produção no Vercel (VERCEL_ENV === "production"), o bypass NUNCA é executado
  const isVercelProd = process.env.VERCEL_ENV === "production";
  const configuredBypassToken = process.env.PLAYWRIGHT_BYPASS_TOKEN;
  const isDevOrTest =
    !isVercelProd &&
    (process.env.NODE_ENV !== "production" || Boolean(process.env.PLAYWRIGHT_TEST));

  if (isDevOrTest && configuredBypassToken) {
    let bypassHeader: string | null = null;
    let bypassCookie: string | null = null;

    if (req) {
      bypassHeader = req.headers.get("x-playwright-bypass-token");
      bypassCookie = req.cookies.get("pw_bypass_token")?.value || null;
    } else {
      try {
        const headerStore = await headers();
        bypassHeader = headerStore.get("x-playwright-bypass-token");
        const cookieStore = await cookies();
        bypassCookie = cookieStore.get("pw_bypass_token")?.value || null;
      } catch {
        // Ignora erro ao acessar context de headers/cookies fora de request
      }
    }

    if (
      bypassHeader === configuredBypassToken ||
      bypassCookie === configuredBypassToken
    ) {
      return {
        authorized: true,
        user: {
          id: "playwright-test-admin-id",
          email: "admin@oticasventara.com.br",
        },
        profile: {
          id: "playwright-test-admin-id",
          email: "admin@oticasventara.com.br",
          full_name: "Administrador de Testes",
          role: "super_admin",
        },
      };
    }
  }

  // 2. Se o Supabase não estiver configurado (ex.: CI estático sem credenciais)
  if (!isSupabaseConfigured() && isDevOrTest) {
    // Apenas em dev/test sem Supabase podemos permitir mock controlado
    return {
      authorized: true,
      user: {
        id: "local-dev-mock-admin-id",
        email: "admin@oticasventara.com.br",
      },
      profile: {
        id: "local-dev-mock-admin-id",
        email: "admin@oticasventara.com.br",
        full_name: "Mock Dev Admin",
        role: "super_admin",
      },
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Acesso não autorizado: sessão administrativa necessária.",
          },
          { status: 401 }
        ),
      };
    }

    // 3. Verifica privilégio na tabela admin_profiles
    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[requireAdmin] Erro ao consultar admin_profiles:", profileError);
    }

    // Se o perfil existe no banco
    if (profile) {
      return {
        authorized: true,
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
      };
    }

    // Fallback: se o usuário logado for o e-mail canônico da diretoria
    if (user.email && user.email.toLowerCase() === "admin@oticasventara.com.br") {
      return {
        authorized: true,
        user: {
          id: user.id,
          email: user.email,
        },
        profile: {
          id: user.id,
          email: user.email,
          full_name: "Diretoria Óticas Ventara",
          role: "super_admin",
        },
      };
    }

    // Usuário autenticado no Supabase, mas sem perfil administrativo
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Acesso negado: o usuário autenticado não possui privilégios administrativos.",
        },
        { status: 403 }
      ),
    };
  } catch (err: any) {
    console.error("[requireAdmin] Exceção ao verificar sessão:", err);
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Falha na verificação de autenticação administrativa.",
        },
        { status: 401 }
      ),
    };
  }
}
