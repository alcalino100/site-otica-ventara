import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname.startsWith("/admin");

  // Intercepta exclusivamente rotas da central administrativa e suas APIs
  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  // A tela de login é a única rota pública de /admin
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Bypass exclusivo para suíte de testes em ambiente NÃO-produção com token criptográfico seguro
  // Em produção no Vercel (VERCEL_ENV === "production"), o bypass NUNCA é executado
  const isVercelProd = process.env.VERCEL_ENV === "production";
  const configuredBypassToken = process.env.PLAYWRIGHT_BYPASS_TOKEN;
  const isDevOrTest =
    !isVercelProd &&
    (process.env.NODE_ENV !== "production" || Boolean(process.env.PLAYWRIGHT_TEST));

  const requestBypassToken =
    request.headers.get("x-playwright-bypass-token") ||
    request.cookies.get("pw_bypass_token")?.value;

  const isBypassAuthorized =
    isDevOrTest &&
    Boolean(configuredBypassToken) &&
    requestBypassToken === configuredBypassToken;

  if (isBypassAuthorized) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdminApi) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso não autorizado: variáveis de autenticação ausentes.",
        },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validação estrita de sessão ativa no Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se não estiver logado
  if (!user) {
    if (isAdminApi) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso não autorizado: sessão administrativa necessária.",
        },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
