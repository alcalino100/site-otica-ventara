import crypto from "crypto";

export interface ValidatedImage {
  valid: true;
  buffer: Buffer;
  mime: string;
  extension: "jpg" | "png" | "webp";
  safeFileName: string;
  sizeBytes: number;
}

export interface InvalidImage {
  valid: false;
  error: string;
  status: 400;
}

export type ImageValidationResult = ValidatedImage | InvalidImage;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/**
 * Validação segura de uploads de imagem no servidor:
 * - Tipo MIME declarado e extensão de arquivo
 * - Assinatura real de bytes (magic numbers) para prevenção de spoofing
 * - Tamanho máximo estrito de 5 MB
 * - Geração de nome criptograficamente seguro no servidor
 */
export async function validateImageFile(
  file: File | null | undefined,
  prefix = "img"
): Promise<ImageValidationResult> {
  if (!file) {
    return {
      valid: false,
      error: "Nenhum arquivo enviado para upload.",
      status: 400,
    };
  }

  // 1. Validação de tamanho
  if (file.size <= 0) {
    return {
      valid: false,
      error: "O arquivo enviado está vazio.",
      status: 400,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Arquivo muito grande (${sizeMb} MB). O tamanho máximo permitido é 5 MB.`,
      status: 400,
    };
  }

  // 2. Validação de extensão declarada
  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  const extMatch = rawExt.match(/^(jpg|jpeg|png|webp)$/i);
  if (!extMatch) {
    return {
      valid: false,
      error: "Extensão inválida. O arquivo deve ter extensão .jpg, .jpeg, .png ou .webp.",
      status: 400,
    };
  }

  // 3. Validação de tipo MIME declarado
  const declaredMime = (file.type || "").toLowerCase().trim();
  if (declaredMime && !ALLOWED_MIME_TYPES.has(declaredMime)) {
    return {
      valid: false,
      error: "Tipo MIME não permitido. Apenas imagens JPEG, PNG ou WebP são aceitas.",
      status: 400,
    };
  }

  // 4. Verificação de assinatura binária (magic numbers)
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length < 12) {
    return {
      valid: false,
      error: "Arquivo corrompido ou formato binário inválido.",
      status: 400,
    };
  }

  let verifiedExt: "jpg" | "png" | "webp" | null = null;
  let verifiedMime = "";

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    verifiedExt = "jpg";
    verifiedMime = "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    verifiedExt = "png";
    verifiedMime = "image/png";
  }
  // WebP: RIFF (0..3) ... WEBP (8..11)
  else if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    verifiedExt = "webp";
    verifiedMime = "image/webp";
  }

  if (!verifiedExt) {
    return {
      valid: false,
      error: "O conteúdo real do arquivo não corresponde a uma imagem JPG, PNG ou WebP válida.",
      status: 400,
    };
  }

  // 5. Geração de nome de arquivo seguro gerado no servidor
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20) || "img";
  const safeFileName = `${cleanPrefix}-${Date.now()}-${randomSuffix}.${verifiedExt}`;

  return {
    valid: true,
    buffer,
    mime: verifiedMime,
    extension: verifiedExt,
    safeFileName,
    sizeBytes: buffer.length,
  };
}
