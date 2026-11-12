"use client";

import React, { useMemo, useState } from "react";
import { Lightbulb, PlayCircle, X } from "lucide-react";
import { parseVideoUrl } from "@/lib/video-embed";

export interface SizingHelpGuideProps {
  title: string;
  subtitle: string;
  steps: [string, string, string];
  videoUrl?: string;
  videoLabel: string;
}

/**
 * Ilustração: lado de dentro da haste com os 3 números gravados (ex: 52 · 18 · 145).
 * As cores seguem as do Guia Visual (lente = azul, ponte = verde, haste = dourado).
 */
function TempleNumbersIllustration() {
  return (
    <svg
      viewBox="0 0 360 170"
      className="w-full h-auto"
      role="img"
      aria-label="Haste de óculos vista por dentro, com os três números gravados: primeiro a largura da lente, depois a ponte e por fim o comprimento da haste"
    >
      <rect width="360" height="170" rx="18" fill="#0F172A" />

      {/* Haste vista por dentro */}
      <path d="M 24 52 H 300 Q 336 52 338 84 Q 338 100 322 100 H 24 Q 14 100 14 90 V 62 Q 14 52 24 52 Z" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="30" cy="76" r="5" fill="#FBBF24" />

      {/* Números gravados */}
      <text x="96" y="86" fill="#38BDF8" fontSize="26" fontWeight="800" textAnchor="middle" fontFamily="ui-monospace, monospace">52</text>
      <rect x="132" y="68" width="14" height="14" rx="2" fill="none" stroke="#64748B" strokeWidth="2" />
      <text x="186" y="86" fill="#34D399" fontSize="26" fontWeight="800" textAnchor="middle" fontFamily="ui-monospace, monospace">18</text>
      <text x="268" y="86" fill="#FBBF24" fontSize="26" fontWeight="800" textAnchor="middle" fontFamily="ui-monospace, monospace">145</text>

      {/* Setas e legendas */}
      <g fontSize="14" fontWeight="700" textAnchor="middle">
        <path d="M 96 98 V 118" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <text x="96" y="138" fill="#38BDF8">1º número</text>
        <text x="96" y="156" fill="#BAE6FD" fontSize="12" fontWeight="600">Lente</text>

        <path d="M 186 98 V 118" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
        <text x="186" y="138" fill="#34D399">2º número</text>
        <text x="186" y="156" fill="#A7F3D0" fontSize="12" fontWeight="600">Ponte</text>

        <path d="M 268 98 V 118" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        <text x="268" y="138" fill="#FBBF24">3º número</text>
        <text x="268" y="156" fill="#FDE68A" fontSize="12" fontWeight="600">Haste</text>
      </g>
    </svg>
  );
}

export function SizingHelpGuide({ title, subtitle, steps, videoUrl, videoLabel }: SizingHelpGuideProps) {
  const [playing, setPlaying] = useState(false);
  const video = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

  return (
    <section
      aria-labelledby="sizing-help-title"
      className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-5 sm:p-7 space-y-5"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 size-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm">
          <Lightbulb size={22} aria-hidden="true" />
        </span>
        <div>
          <h4 id="sizing-help-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h4>
          <p className="text-sm sm:text-base text-slate-700 mt-1 leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
        <ol className="space-y-4">
          {steps.map((text, index) => (
            <li key={index} className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="shrink-0 size-10 rounded-full bg-amber-500 text-white text-lg font-bold flex items-center justify-center shadow-sm"
              >
                {index + 1}
              </span>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed pt-1.5">
                <span className="sr-only">{`Passo ${index + 1}: `}</span>
                {text}
              </p>
            </li>
          ))}
        </ol>

        <div className="max-w-[420px] w-full mx-auto lg:mx-0 lg:justify-self-end">
          <TempleNumbersIllustration />
        </div>
      </div>

      {video && (
        <div className="space-y-3 pt-1">
          {!playing ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-base font-semibold shadow-md transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <PlayCircle size={24} className="text-amber-400 shrink-0" aria-hidden="true" />
              <span>{videoLabel}</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div
                className={`mx-auto overflow-hidden rounded-2xl bg-black shadow-lg ${
                  video.kind === "youtube" && video.vertical ? "aspect-[9/16] max-w-[320px]" : "aspect-video max-w-[720px]"
                }`}
              >
                {video.kind === "youtube" ? (
                  <iframe
                    title={title}
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <video
                    src={video.src}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  >
                    Seu navegador não conseguiu abrir este vídeo.
                  </video>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPlaying(false)}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X size={16} aria-hidden="true" />
                Fechar vídeo
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
