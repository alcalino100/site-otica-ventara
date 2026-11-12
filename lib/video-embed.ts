/**
 * Interpreta o link de vídeo informado no admin e devolve uma forma segura de exibi-lo.
 * Aceita apenas YouTube (inclusive Shorts) e arquivos de vídeo (.mp4/.webm/.mov) via https
 * ou caminho do próprio site. Qualquer outra coisa é ignorada (retorna null).
 */
export type ParsedVideo =
  | { kind: "youtube"; id: string; vertical: boolean }
  | { kind: "file"; src: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIDEO_FILE = /\.(mp4|webm|mov)$/i;

export function parseVideoUrl(raw: unknown): ParsedVideo | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  // Arquivo hospedado no próprio site (ex: /videos/guia-medidas.mp4)
  if (value.startsWith("/") && !value.startsWith("//")) {
    const path = value.split(/[?#]/)[0];
    return VIDEO_FILE.test(path) ? { kind: "file", src: value } : null;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1] ?? "";
    return YOUTUBE_ID.test(id) ? { kind: "youtube", id, vertical: false } : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v") ?? "";
      return YOUTUBE_ID.test(id) ? { kind: "youtube", id, vertical: false } : null;
    }
    const match = url.pathname.match(/^\/(shorts|embed|live)\/([^/?#]+)/);
    if (match && YOUTUBE_ID.test(match[2])) {
      return { kind: "youtube", id: match[2], vertical: match[1] === "shorts" };
    }
    return null;
  }

  if (VIDEO_FILE.test(url.pathname)) return { kind: "file", src: url.toString() };
  return null;
}
