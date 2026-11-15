/**
 * Chamadas do painel admin com mensagens de erro SEMPRE em português.
 * Sem isso, sessão expirada, timeout ou queda de conexão viravam textos técnicos em inglês
 * ("Load failed", "The string did not match the expected pattern", "Unexpected token '<'").
 */
export interface AdminRequestResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  /** Mensagem pronta para mostrar ao usuário (só quando ok = false). */
  error?: string;
}

const MSG_NETWORK =
  "Sem conexão com o servidor agora (internet instável?). Seus dados continuam na tela. Antes de tentar de novo, confira a lista de produtos para não cadastrar em duplicidade.";
const MSG_SESSION =
  "Sua sessão do painel expirou. Abra /admin/login em outra aba, entre de novo e volte aqui: os dados continuam na tela e é só salvar outra vez.";

export async function adminRequest<T = any>(url: string, init?: RequestInit): Promise<AdminRequestResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return { ok: false, status: 0, data: null, error: MSG_NETWORK };
  }

  const sessionExpired = res.status === 401 || res.status === 403 || (res.redirected && /\/admin\/login/.test(res.url));

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (sessionExpired) {
    return { ok: false, status: res.status, data, error: MSG_SESSION };
  }

  if (data === null) {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: `O servidor demorou ou falhou ao responder (erro ${res.status || "de rede"}). O produto pode ter sido salvo: confira a lista antes de tentar de novo.`,
    };
  }

  if (!res.ok || data?.error) {
    return { ok: false, status: res.status, data, error: data?.error || `Erro ${res.status} ao falar com o servidor.` };
  }

  return { ok: true, status: res.status, data };
}
