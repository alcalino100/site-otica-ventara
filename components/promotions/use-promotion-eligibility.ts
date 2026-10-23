"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { TriggersConfig } from "@/types/promotion-wheel";

interface EligibilityOptions {
  campaignId: string;
  campaignVersion: number;
  triggers: TriggersConfig;
  isOpen: boolean;
  onTrigger: () => void;
}

export function usePromotionEligibility({
  campaignId,
  campaignVersion,
  triggers,
  isOpen,
  onTrigger,
}: EligibilityOptions) {
  const pathname = usePathname();
  const [isEligible, setIsEligible] = useState(false);

  // Armazenamento em memória caso localStorage/sessionStorage falhem (ex: navegação privada estrita)
  const memoryStorage = useRef<Record<string, string>>({});

  const safeStorage = {
    getItem: (key: string): string | null => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStorage.current[key] || null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        memoryStorage.current[key] = value;
      }
    },
    getSession: (key: string): string | null => {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return memoryStorage.current[key] || null;
      }
    },
    setSession: (key: string, value: string) => {
      try {
        window.sessionStorage.setItem(key, value);
      } catch {
        memoryStorage.current[key] = value;
      }
    },
  };

  const closeKey = `ventara_wheel_closed_${campaignId}_v${campaignVersion}`;
  const participatedKey = `ventara_wheel_participated_${campaignId}_v${campaignVersion}`;
  const sessionKey = `ventara_wheel_session_${campaignId}`;

  // Verifica se o visitante já concluiu ou está em cooldown
  const checkStoredEligibility = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    // 1. Já participou desta versão da campanha?
    if (safeStorage.getItem(participatedKey)) {
      return false;
    }

    // 2. Já abriu nesta sessão?
    if (safeStorage.getSession(sessionKey)) {
      return false;
    }

    // 3. Fechou recentemente (cooldown)?
    const closedTimestamp = safeStorage.getItem(closeKey);
    if (closedTimestamp) {
      const closedAt = parseInt(closedTimestamp, 10);
      const cooldownMs = (triggers.cooldown_days_on_close || 7) * 86400000;
      if (Date.now() - closedAt < cooldownMs) {
        return false;
      }
    }

    // 4. Está em rota excluída?
    if (triggers.excluded_paths.some((p) => pathname?.startsWith(p))) {
      return false;
    }

    return true;
  }, [campaignId, campaignVersion, triggers, pathname]);

  const triggerModal = useCallback(() => {
    if (!checkStoredEligibility() || isOpen) return;

    safeStorage.setSession(sessionKey, "1");
    setIsEligible(true);
    onTrigger();
  }, [checkStoredEligibility, isOpen, onTrigger, sessionKey]);

  // Função para registrar fechamento sem participação (aplica cooldown de 7 dias)
  const markAsDismissed = useCallback(() => {
    safeStorage.setItem(closeKey, Date.now().toString());
  }, [closeKey]);

  // Função para registrar conclusão com sucesso (bloqueia nova oferta)
  const markAsCompleted = useCallback(() => {
    safeStorage.setItem(participatedKey, Date.now().toString());
  }, [participatedKey]);

  useEffect(() => {
    if (!triggers.is_enabled || isOpen) return;
    if (!checkStoredEligibility()) return;

    let isDocumentVisible = document.visibilityState === "visible";
    let visibleSecondsElapsed = 0;
    let inactivitySecondsElapsed = 0;

    // 1. Contador de Tempo de Aba Visível (Mínimo configurado, padrão 30s)
    const intervalTimer = setInterval(() => {
      if (isDocumentVisible) {
        visibleSecondsElapsed += 1;
        inactivitySecondsElapsed += 1;

        // Disparo por inatividade após o tempo mínimo na página
        if (
          visibleSecondsElapsed >= triggers.min_seconds_on_page &&
          inactivitySecondsElapsed >= triggers.inactivity_seconds
        ) {
          triggerModal();
        }
      }
    }, 1000);

    // Pausa e retoma contagem com visibilitychange
    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === "visible";
    };

    // Reinicia contagem de inatividade em interação do usuário
    const resetInactivity = (e?: Event) => {
      // Se o usuário estiver digitando em um campo de formulário, não interrompe
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable);

      if (isTyping) return;

      inactivitySecondsElapsed = 0;
    };

    // Throttled mousemove
    let lastMouseMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove > 1000) {
        lastMouseMove = now;
        resetInactivity(e);
      }
    };

    // Detecção de Intenção de Saída no Desktop (cursor saindo pelo topo: clientY <= 0)
    const handleExitIntent = (e: MouseEvent) => {
      if (!triggers.exit_intent_desktop) return;

      // Apenas dispositivos com ponteiro fino (mouse/trackpad)
      const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (!hasFinePointer) return;

      // Apenas se o cursor saiu do documento pelo topo (não sobre botões ou elementos internos)
      if (e.clientY <= 0 && e.relatedTarget === null) {
        // Dispara apenas se o visitante já tiver pelo menos 8s na página
        if (visibleSecondsElapsed >= 8) {
          triggerModal();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pointerdown", resetInactivity, { passive: true });
    window.addEventListener("keydown", resetInactivity, { passive: true });
    window.addEventListener("scroll", resetInactivity, { passive: true });
    window.addEventListener("touchstart", resetInactivity, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleExitIntent);

    return () => {
      clearInterval(intervalTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointerdown", resetInactivity);
      window.removeEventListener("keydown", resetInactivity);
      window.removeEventListener("scroll", resetInactivity);
      window.removeEventListener("touchstart", resetInactivity);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleExitIntent);
    };
  }, [triggers, isOpen, checkStoredEligibility, triggerModal]);

  return {
    isEligible,
    triggerModal,
    markAsDismissed,
    markAsCompleted,
  };
}
