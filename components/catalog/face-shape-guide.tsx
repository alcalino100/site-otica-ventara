"use client";

import React, { useEffect, useState } from "react";
import { FACE_SHAPES, FaceShapeFit, FaceShapeId, faceShapeLabel, fitLevelInfo, hasFaceFit } from "@/lib/face-shapes";

interface FaceShapeGuideProps {
  fit?: FaceShapeFit | null;
  productName?: string;
  whatsappHref?: string;
}

const STORAGE_KEY = "ventara:formato-rosto";

const BAR_COLOR: Record<string, string> = {
  ideal: "bg-emerald-500",
  boa: "bg-lime-500",
  regular: "bg-amber-500",
  baixa: "bg-rose-400",
};

/**
 * "Meu rosto é ..." — a pessoa escolhe o formato do próprio rosto e vê o quanto a armação combina.
 * A avaliação por rosto é cadastrada pelo cliente no admin (campo face_shape_fit).
 */
export function FaceShapeGuide({ fit, productName, whatsappHref }: FaceShapeGuideProps) {
  const [selected, setSelected] = useState<FaceShapeId | null>(null);

  // Lembra o formato escolhido entre as armações (a pessoa só precisa escolher uma vez)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && FACE_SHAPES.some((f) => f.id === saved)) setSelected(saved as FaceShapeId);
    } catch {
      // sem armazenamento local: segue só nesta sessão
    }
  }, []);

  const choose = (id: FaceShapeId) => {
    setSelected(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignora
    }
  };

  const evaluated = hasFaceFit(fit);
  const level = selected && fit ? fit[selected] : undefined;
  const info = level ? fitLevelInfo(level) : null;
  const bestFaces = fit ? FACE_SHAPES.filter((f) => fit[f.id] === "ideal") : [];

  return (
    <div className="space-y-4">
      <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/formatos-de-rosto.jpg"
          alt="Os seis formatos de rosto: oval, quadrado, redondo, retangular, alongado e angular"
          width={1536}
          height={1024}
          loading="lazy"
          className="block h-auto w-full"
        />
        <figcaption className="px-3 py-2 text-[11px] text-slate-500">
          Compare o contorno do seu rosto com os exemplos acima.
        </figcaption>
      </figure>

      <div>
        <p className="mb-2 text-xs font-bold text-slate-900">Meu rosto é:</p>
        <div role="radiogroup" aria-label="Formato do meu rosto" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {FACE_SHAPES.map((f) => {
            const active = selected === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choose(f.id)}
                className={`min-h-[44px] rounded-xl border px-2 text-xs font-semibold transition-colors ${
                  active
                    ? "border-amber-500 bg-amber-50 text-amber-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-amber-300"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {!selected && (
          <p className="text-xs leading-relaxed text-slate-600">
            Escolha o formato do seu rosto acima para ver se {productName ? <strong>{productName}</strong> : "esta armação"} é indicada para você.
          </p>
        )}

        {selected && !evaluated && (
          <p className="text-xs leading-relaxed text-slate-600">
            Ainda não avaliamos esta armação por formato de rosto. Fale com a gente
            {whatsappHref ? (
              <>
                {" "}
                no{" "}
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-700 underline">
                  WhatsApp
                </a>
              </>
            ) : null}{" "}
            e indicamos a melhor opção para o seu rosto.
          </p>
        )}

        {selected && evaluated && !info && (
          <p className="text-xs leading-relaxed text-slate-600">
            Ainda não avaliamos esta armação para o formato <strong>{faceShapeLabel(selected)}</strong>.
            {bestFaces.length > 0 && <> Ela é mais indicada para rosto {bestFaces.map((f) => f.label).join(", ")}.</>}
          </p>
        )}

        {selected && info && level && (
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-bold text-slate-900">
                Rosto {faceShapeLabel(selected)} · compatibilidade
              </p>
              <p className="text-lg font-extrabold text-slate-900">{info.percent}%</p>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={info.percent}
              aria-label={`Compatibilidade com rosto ${faceShapeLabel(selected)}`}
              className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
            >
              <div className={`h-full rounded-full ${BAR_COLOR[level]}`} style={{ width: `${info.percent}%` }} />
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              {level === "ideal"
                ? info.message
                : `Esta armação não é 100% indicada para rosto ${faceShapeLabel(selected)}. ${info.message}`}
              {level !== "ideal" && bestFaces.length > 0 && (
                <> Ela é mais indicada para rosto {bestFaces.map((f) => f.label).join(", ")}.</>
              )}
            </p>
          </div>
        )}
      </div>

      {evaluated && fit && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Compatibilidade por formato de rosto
          </p>
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {FACE_SHAPES.filter((f) => fit[f.id]).map((f) => {
              const lv = fit[f.id]!;
              return (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700"
                >
                  <span className="font-medium">{f.label}</span>
                  <span className="font-bold text-slate-900">{fitLevelInfo(lv).percent}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-[11px] italic text-slate-500">
        Referência de visagismo: o caimento também depende das medidas da armação e do seu estilo.
      </p>
    </div>
  );
}
