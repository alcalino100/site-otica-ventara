"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { PromotionCampaignConfig, DEFAULT_PROMOTION_CONFIG } from "@/types/promotion-wheel";
import { usePromotionEligibility } from "./use-promotion-eligibility";

const PromotionWheelModal = dynamic(
  () => import("./promotion-wheel-modal").then((m) => m.PromotionWheelModal),
  { ssr: false }
);

interface PromotionWheelTriggerProps {
  onOpenPrivacyModal?: () => void;
}

export function PromotionWheelTrigger({ onOpenPrivacyModal }: PromotionWheelTriggerProps) {
  const [config, setConfig] = useState<PromotionCampaignConfig>(DEFAULT_PROMOTION_CONFIG);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Busca configuração pública ativa
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const res = await fetch("/api/promotions/wheel/config");
        if (res.ok) {
          const data = await res.json();
          if (data && data.config && isMounted) {
            setConfig(data.config);
          }
        }
      } catch {
        // Mantém configuração padrão Ventara
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTriggerOpen = () => {
    setIsOpen(true);
    fetch("/api/promotions/wheel/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "open" }),
    }).catch(() => {});
  };

  const { triggerModal, markAsDismissed, markAsCompleted } = usePromotionEligibility({
    campaignId: config.id,
    campaignVersion: config.version,
    triggers: config.triggers,
    isOpen,
    onTrigger: handleTriggerOpen,
  });

  const handleClose = () => {
    setIsOpen(false);
    markAsDismissed();
  };

  const handleCompleted = () => {
    markAsCompleted();
  };

  const isDev = process.env.NODE_ENV === "development";

  if (!isLoaded || !config.triggers.is_enabled || config.status === "disabled") {
    return isDev ? (
      <div className="fixed bottom-20 left-4 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-amber-300 hover:bg-amber-300 transition-all cursor-pointer"
          title="Forçar abertura da roleta para testes em desenvolvimento"
        >
          <Sparkles size={13} />
          <span>Testar Roleta (Dev)</span>
        </button>
      </div>
    ) : null;
  }

  return (
    <>
      {/* Botão de Teste Exclusivo de Desenvolvimento */}
      {isDev && (
        <div className="fixed bottom-20 left-4 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-amber-300 hover:bg-amber-300 transition-all cursor-pointer"
            title="Forçar abertura da roleta para testes em desenvolvimento"
          >
            <Sparkles size={13} />
            <span>Testar Roleta (Dev)</span>
          </button>
        </div>
      )}

      {/* Modal Principal com Carregamento Sob Demanda */}
      {isOpen && (
        <PromotionWheelModal
          isOpen={isOpen}
          onClose={handleClose}
          config={config}
          onCompleted={handleCompleted}
          onOpenPrivacyModal={onOpenPrivacyModal}
        />
      )}
    </>
  );
}
