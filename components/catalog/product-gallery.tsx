"use client";

import { focusImageStyle } from "@/lib/image-focus";
import React, { useState, useEffect, useRef } from "react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "./frame-art";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { optimizedImgProps } from "@/lib/image-url";

interface ProductGalleryProps {
  product: Product;
  overrideImage?: string | null;
}

export function ProductGallery({ product, overrideImage: rawOverrideImage }: ProductGalleryProps) {
  const images = React.useMemo(
    () => (product.images && product.images.length > 0 ? product.images : []),
    [product.images]
  );
  // Foto de cor que não está mais na galeria (já removida no admin) é ignorada
  const overrideImage =
    rawOverrideImage && (images.length === 0 || images.some((img) => img.url === rawOverrideImage))
      ? rawOverrideImage
      : null;
  const primaryIdx = Math.max(
    0,
    images.findIndex((img) => img.is_primary)
  );
  const [activeIdx, setActiveIdx] = useState(primaryIdx);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  // Zoom manual (botões, pinça, duplo toque) e reposicionamento por arraste dentro do bloco
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{ startDist: number; startScale: number; startOffset: { x: number; y: number }; startPoint: { x: number; y: number } } | null>(null);
  const swipeStartRef = useRef<number | null>(null);
  const swipeEndRef = useRef<number | null>(null);
  const lastTapRef = useRef(0);
  const movedRef = useRef(false);

  const clampOffset = (o: { x: number; y: number }, sc: number) => {
    const rect = boxRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 0;
    const h = rect?.height ?? 0;
    const maxX = ((sc - 1) * w) / 2;
    const maxY = ((sc - 1) * h) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
  };

  const aplicarZoom = (next: number) => {
    const sc = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    setScale(sc);
    setOffset((o) => (sc === 1 ? { x: 0, y: 0 } : clampOffset(o, sc)));
  };

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // A foto da cor escolhida só vale quando a COR muda; depois disso, miniaturas, setas e deslize mandam.
  // (Antes a foto da cor travava a imagem principal e os cliques nas miniaturas não faziam nada.)
  const [colorImage, setColorImage] = useState<string | null>(overrideImage || null);

  useEffect(() => {
    setColorImage(overrideImage || null);
    if (overrideImage) {
      const matchIdx = images.findIndex((img) => img.url === overrideImage);
      if (matchIdx >= 0) {
        setActiveIdx(matchIdx);
      }
    }
  }, [overrideImage, images]);

  /** Escolha do visitante (miniatura, seta, deslize): passa a valer no lugar da foto da cor. */
  const selectImage = (next: number | ((prev: number) => number)) => {
    setColorImage(null);
    setActiveIdx(next);
  };

  const activeImage = colorImage || images[activeIdx]?.url;
  // Enquadramento do admin vale para a foto exibida (inclusive quando vem da cor escolhida)
  const framedImage = images.find((img) => img.url === activeImage);
  const framingStyle = focusImageStyle(framedImage);
  const adminFraming = framingStyle
    ? {
        objectPosition: framingStyle.objectPosition as string | undefined,
        scale: framingStyle.scale as string | undefined,
        origin: framingStyle.transformOrigin as string | undefined,
      }
    : null;

  const finePointer = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Zoom por aproximação do mouse só quando o zoom manual está desligado (Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale > 1 || !finePointer()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomCoords({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };
  const handleMouseEnter = () => {
    if (finePointer()) setIsZoomed(true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = false;
    setIsZoomed(false);
    const pts = Array.from(pointersRef.current.values());
    if (pts.length === 2) {
      gestureRef.current = {
        startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
        startScale: scale,
        startOffset: offset,
        startPoint: { x: 0, y: 0 },
      };
    } else if (pts.length === 1) {
      gestureRef.current = { startDist: 0, startScale: scale, startOffset: offset, startPoint: { x: e.clientX, y: e.clientY } };
      swipeStartRef.current = e.clientX;
      swipeEndRef.current = e.clientX;
    }
    if (scale > 1 || pts.length === 2) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignora */
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureRef.current;
    if (!g) return;
    const pts = Array.from(pointersRef.current.values());
    if (pts.length >= 2) {
      // Pinça
      movedRef.current = true;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const sc = Math.max(MIN_SCALE, Math.min(MAX_SCALE, g.startScale * (dist / g.startDist)));
      setScale(sc);
      setOffset(sc === 1 ? { x: 0, y: 0 } : clampOffset(g.startOffset, sc));
      return;
    }
    swipeEndRef.current = e.clientX;
    if (scale > 1) {
      // Arrastar para reposicionar a foto dentro do bloco
      const dx = e.clientX - g.startPoint.x;
      const dy = e.clientY - g.startPoint.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) movedRef.current = true;
      setOffset(clampOffset({ x: g.startOffset.x + dx, y: g.startOffset.y + dy }, scale));
    } else if (Math.abs(e.clientX - g.startPoint.x) > 8) {
      movedRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const eraUnico = pointersRef.current.size === 1;
    pointersRef.current.delete(e.pointerId);
    if (!eraUnico) {
      // Terminou a pinça: reinicia o gesto com o dedo que sobrou
      gestureRef.current = null;
      return;
    }
    gestureRef.current = null;

    // Deslizar troca de foto (apenas sem zoom)
    if (scale === 1 && swipeStartRef.current !== null && swipeEndRef.current !== null) {
      const diff = swipeStartRef.current - swipeEndRef.current;
      if (diff > 40 && activeIdx < images.length - 1) selectImage((prev) => prev + 1);
      else if (diff < -40 && activeIdx > 0) selectImage((prev) => prev - 1);
    }
    swipeStartRef.current = null;
    swipeEndRef.current = null;

    // Duplo toque: aproxima / volta
    if (!movedRef.current && e.pointerType !== "mouse") {
      const agora = Date.now();
      if (agora - lastTapRef.current < 300) {
        if (scale > 1) resetZoom();
        else aplicarZoom(2.5);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = agora;
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    gestureRef.current = null;
    swipeStartRef.current = null;
    swipeEndRef.current = null;
  };

  // Ao trocar de foto, volta ao enquadramento original
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [activeIdx, colorImage]);

  const handlePrev = () => {
    selectImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    selectImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 items-start">
      {/* Desktop: Miniaturas Verticais à Esquerda */}
      {images.length > 1 && (
        <div className="hidden lg:flex flex-col gap-2.5 w-20 shrink-0">
          {images.map((img, idx) => {
            const isCurrent = activeIdx === idx;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => selectImage(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? "border-amber-400 shadow-md ring-1 ring-amber-400"
                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                }`}
                title={`Ver imagem ${idx + 1}`}
              >
                <img
                  {...optimizedImgProps(img.url, [96, 128, 256])}
                  sizes="96px"
                  alt={img.alt_text || `${product.name} foto ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Bloco Principal de Apresentação Visual */}
      <div className="flex-1 w-full space-y-3">
        {/* Etiquetas FORA da foto: o espaço interno fica todo para o óculos */}
        <div className="flex items-center justify-between gap-2" data-testid="pdp-gallery-labels">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-slate-900 text-white px-3 py-1.5 rounded-full whitespace-nowrap">
              {product.frame_type === "Solar" ? "Óculos Solar UV400" : "Armação de Grau"}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap">
              {product.gender || "Unissex"}
            </span>
          </div>
          {images.length > 1 && (
            <span className="text-[11px] font-mono tracking-wider text-slate-500" data-testid="pdp-gallery-counter">
              {activeIdx + 1} / {images.length}
            </span>
          )}
        </div>

        {activeImage ? (
          <div
            ref={boxRef}
            data-testid="pdp-gallery-box"
            className="relative w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-square min-h-[340px] sm:min-h-[460px] lg:min-h-[520px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-950 group select-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            style={{ touchAction: scale > 1 ? "none" : "pan-y", cursor: scale > 1 ? "grab" : "zoom-in" }}
          >
            {/* Ajuste de posição/zoom salvo no admin (camada separada do zoom do visitante) */}
            <div
              className="absolute inset-0 pointer-events-none"
              data-testid="pdp-admin-framing"
              style={adminFraming ? { scale: adminFraming.scale, transformOrigin: adminFraming.origin } : undefined}
            >
            <img
              {...optimizedImgProps(activeImage, [640, 828, 1080, 1200])}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt={images[activeIdx]?.alt_text || product.name}
              data-testid="pdp-main-image"
              data-zoom-scale={scale.toFixed(2)}
              draggable={false}
              fetchPriority="high"
              decoding="async"
              style={{
                ...(adminFraming?.objectPosition ? { objectPosition: adminFraming.objectPosition } : {}),
                ...(scale > 1
                  ? { transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: "center", transition: "none" }
                  : isZoomed
                    ? { transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`, transform: "scale(1.9)" }
                    : { transform: "scale(1)" }),
              }}
              className="w-full h-full object-cover object-center transition-transform duration-200 ease-out pointer-events-none"
            />
            </div>

            {/* Controles de zoom discretos (também reposicione arrastando a foto quando ampliada) */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                data-testid="pdp-zoom-out"
                onClick={(e) => { e.stopPropagation(); aplicarZoom(scale - 0.75); }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={scale <= MIN_SCALE}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/55 backdrop-blur-md text-white border border-white/20 disabled:opacity-35 touch-manipulation cursor-pointer"
                aria-label="Afastar foto"
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button"
                data-testid="pdp-zoom-in"
                onClick={(e) => { e.stopPropagation(); aplicarZoom(scale === 1 ? 2 : scale + 0.75); }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={scale >= MAX_SCALE}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/55 backdrop-blur-md text-white border border-white/20 disabled:opacity-35 touch-manipulation cursor-pointer"
                aria-label="Aproximar foto"
              >
                <ZoomIn size={18} />
              </button>
              {scale > 1 && (
                <button
                  type="button"
                  data-testid="pdp-zoom-reset"
                  onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-400 text-slate-950 border border-amber-300 touch-manipulation cursor-pointer"
                  aria-label="Voltar ao enquadramento original"
                >
                  <RotateCcw size={17} />
                </button>
              )}
            </div>

            {/* Setas de navegação no mobile (zona de toque de 44px) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  data-testid="pdp-gallery-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handlePrev();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors border border-white/20 shadow-md touch-manipulation cursor-pointer"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  data-testid="pdp-gallery-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleNext();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors border border-white/20 shadow-md touch-manipulation cursor-pointer"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        ) : (
          /* Caso sem Foto Real: Arte Vetorial Studio Light */
          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[460px] lg:min-h-[520px] relative overflow-hidden shadow-xs">
            <div className="w-full max-w-md py-6 relative z-10">
              <FrameArt
                solar={product.frame_type === "Solar"}
                round={product.frame_shape === "Redondo"}
                amber={product.slug.includes("aurora") || (product.slug.includes("solar") && !product.slug.includes("kids"))}
                customColor={
                  product.gender === "Infantil"
                    ? product.frame_type === "Solar"
                      ? "#0284c7"
                      : "#2563eb"
                    : undefined
                }
              />
            </div>

            <div className="absolute bottom-5 right-5 text-[10px] font-semibold text-slate-400 tracking-wider">
              ÓTICA VENTARA · ARAÇATUBA-SP
            </div>
          </div>
        )}

        {/* Mobile: Miniaturas horizontais com rolagem suave e indicador touch */}
        {images.length > 1 && (
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 pt-1 justify-center">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => selectImage(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeIdx === idx
                    ? "border-amber-400 shadow-md ring-1 ring-amber-400"
                    : "border-slate-200 opacity-60"
                }`}
              >
                <img
                  {...optimizedImgProps(img.url, [96, 128, 256])}
                  sizes="96px"
                  alt=""
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
