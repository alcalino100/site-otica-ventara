/**
 * Envio de fotos no admin (navegador).
 * - Reduz fotos grandes antes de enviar: a Vercel recusa requisições acima de ~4,5 MB e fotos de celular
 *   passam disso com facilidade (a resposta de erro não é JSON e virava mensagem em inglês).
 * - Traduz qualquer falha para uma mensagem em português dizendo QUAL foto falhou e o que fazer.
 */
export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const MAX_SEND_BYTES = 3.8 * 1024 * 1024; // folga abaixo do limite de ~4,5 MB da hospedagem
const REDUCE_ABOVE_BYTES = 1.2 * 1024 * 1024;
const MAX_SIDE_PX = 2400;

function loadBitmap(file: File): Promise<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        draw: (ctx, w, h) => {
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
        },
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

/** Reduz a foto (lado maior até 2400 px, qualidade ajustada) só quando necessário. */
export async function compressImageForUpload(file: File): Promise<File> {
  const supported = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!supported.includes(file.type) || file.size <= REDUCE_ABOVE_BYTES) return file;

  try {
    const bmp = await loadBitmap(file);
    const keepAlpha = file.type === "image/png" || file.type === "image/webp";
    const outType = keepAlpha ? "image/webp" : "image/jpeg";
    let scale = Math.min(1, MAX_SIDE_PX / Math.max(bmp.width, bmp.height));
    let best: Blob | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      if (!keepAlpha) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      // A imagem só pode ser desenhada uma vez por bitmap carregado: recarrega a cada tentativa
      const again = attempt === 0 ? bmp : await loadBitmap(file);
      again.draw(ctx, w, h);

      for (const q of [0.88, 0.8, 0.7]) {
        const blob = await toBlob(canvas, outType, q);
        if (!blob) continue;
        if (blob.type && blob.type !== outType) break; // navegador não gerou o formato pedido
        best = blob;
        if (blob.size <= MAX_SEND_BYTES) break;
      }
      if (best && best.size <= MAX_SEND_BYTES) break;
      scale *= 0.75;
    }

    if (!best || best.size >= file.size) return file;
    const ext = outType === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([best], `${base}.${ext}`, { type: outType });
  } catch {
    return file;
  }
}

/** Envia uma foto ao Storage; sempre devolve um resultado (nunca lança) com erro em português. */
export async function uploadProductImage(original: File): Promise<UploadResult> {
  const label = original.name || "foto";
  const file = await compressImageForUpload(original);

  if (file.size > MAX_SEND_BYTES + 0.6 * 1024 * 1024) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { ok: false, error: `A foto "${label}" é grande demais (${mb} MB) mesmo depois de reduzida. Use uma foto menor.` };
  }

  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  } catch {
    return { ok: false, error: `Sem conexão ao enviar "${label}". Confira a internet e tente de novo.` };
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.status === 401 || res.status === 403) {
    return { ok: false, error: "Sua sessão do painel expirou. Entre de novo em /admin/login e envie a foto outra vez." };
  }
  if (res.status === 413) {
    return { ok: false, error: `A foto "${label}" é grande demais para enviar. Use uma foto menor (até uns 4 MB).` };
  }
  if (!res.ok || !data?.url) {
    const detail = data?.error ? `: ${data.error}` : ` (erro ${res.status})`;
    return { ok: false, error: `Não foi possível enviar "${label}"${detail}` };
  }

  return { ok: true, url: data.url as string };
}
