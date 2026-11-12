import { test, expect } from "@playwright/test";
import { parseVideoUrl } from "../lib/video-embed";
import { getPageDefaultValues } from "../lib/content/registry";

test.describe("Guia de medidas: vídeo explicativo editável no admin", () => {
  test("1. Reconhece links do YouTube (watch, youtu.be, shorts) e arquivos de vídeo", () => {
    expect(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({ kind: "youtube", id: "dQw4w9WgXcQ", vertical: false });
    expect(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ?si=abc")).toEqual({ kind: "youtube", id: "dQw4w9WgXcQ", vertical: false });
    expect(parseVideoUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toEqual({ kind: "youtube", id: "dQw4w9WgXcQ", vertical: true });
    expect(parseVideoUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toMatchObject({ kind: "youtube" });
    expect(parseVideoUrl("https://cdn.exemplo.com.br/guia.mp4?v=2")).toEqual({ kind: "file", src: "https://cdn.exemplo.com.br/guia.mp4?v=2" });
    expect(parseVideoUrl("/videos/guia-medidas.webm")).toEqual({ kind: "file", src: "/videos/guia-medidas.webm" });
  });

  test("2. Ignora vazio, links inseguros ou desconhecidos (o botão de vídeo não aparece)", () => {
    expect(parseVideoUrl("")).toBeNull();
    expect(parseVideoUrl("   ")).toBeNull();
    expect(parseVideoUrl(undefined)).toBeNull();
    expect(parseVideoUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseVideoUrl("javascript:alert(1)")).toBeNull();
    expect(parseVideoUrl("https://youtube.com.malicioso.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseVideoUrl("https://www.youtube.com/watch?v=curto")).toBeNull();
    expect(parseVideoUrl("//malicioso.com/x.mp4")).toBeNull();
    expect(parseVideoUrl("https://exemplo.com/pagina.html")).toBeNull();
  });

  test("3. Template de produto expõe os campos do guia, com vídeo vazio por padrão", () => {
    const defaults = getPageDefaultValues("produtoTemplate");
    expect(defaults.sizingVideoUrl).toBe("");
    for (const key of ["sizingHelpTitle", "sizingHelpSubtitle", "sizingStep1", "sizingStep2", "sizingStep3", "sizingVideoLabel"]) {
      expect(typeof defaults[key]).toBe("string");
      expect(defaults[key].length).toBeGreaterThan(5);
    }
  });
});
