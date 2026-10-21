"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function UTMTrackerCore() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Garante ID de sessão consistente durante a navegação
    let sessionId = sessionStorage.getItem("ventara_session_id");
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem("ventara_session_id", sessionId);
    }

    // Extrai parâmetros UTM da URL atual
    const urlUtmSource = searchParams.get("utm_source");
    const urlUtmMedium = searchParams.get("utm_medium");
    const urlUtmCampaign = searchParams.get("utm_campaign");
    const urlUtmContent = searchParams.get("utm_content");
    const urlUtmTerm = searchParams.get("utm_term");

    // Se houver novos UTMs na URL, atualiza o sessionStorage
    if (urlUtmSource || urlUtmCampaign || urlUtmMedium) {
      const utmData = {
        utm_source: urlUtmSource || "",
        utm_medium: urlUtmMedium || "",
        utm_campaign: urlUtmCampaign || "",
        utm_content: urlUtmContent || "",
        utm_term: urlUtmTerm || "",
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem("ventara_utm_data", JSON.stringify(utmData));
    }

    // Carrega UTMs ativos da sessão (mesmo se o usuário navegar para outra página interna)
    let activeUtm: any = {};
    try {
      const stored = sessionStorage.getItem("ventara_utm_data");
      if (stored) activeUtm = JSON.parse(stored);
    } catch {
      // Ignora erro de parse
    }

    const currentKey = `${pathname}?${searchParams.toString()}`;
    if (hasTrackedPath.current === currentKey) return;
    hasTrackedPath.current = currentKey;

    const deviceType =
      window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";

    const payload = {
      path: pathname,
      referrer: document.referrer || "",
      utm_source: urlUtmSource || activeUtm.utm_source || "",
      utm_medium: urlUtmMedium || activeUtm.utm_medium || "",
      utm_campaign: urlUtmCampaign || activeUtm.utm_campaign || "",
      utm_content: urlUtmContent || activeUtm.utm_content || "",
      utm_term: urlUtmTerm || activeUtm.utm_term || "",
      device_type: deviceType,
      event_type: "pageview",
      session_id: sessionId,
    };

    // Dispara registro assíncrono sem bloquear a navegação
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Ignora silenciosamente
    }
  }, [pathname, searchParams]);

  // Monitora cliques para o WhatsApp e registra conversão atribuída à campanha ativa
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest("a");
      if (link && link.href && (link.href.includes("wa.me") || link.href.includes("api.whatsapp.com"))) {
        let activeUtm: any = {};
        try {
          const stored = sessionStorage.getItem("ventara_utm_data");
          if (stored) activeUtm = JSON.parse(stored);
        } catch {}

        const sessionId = sessionStorage.getItem("ventara_session_id") || "";
        const payload = {
          path: window.location.pathname,
          utm_source: activeUtm.utm_source || "",
          utm_campaign: activeUtm.utm_campaign || "",
          utm_medium: activeUtm.utm_medium || "",
          event_type: "whatsapp_click",
          session_id: sessionId,
        };

        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    };

    document.addEventListener("click", handleGlobalClick, { passive: true });
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  return null;
}

export function UTMTracker() {
  return (
    <Suspense fallback={null}>
      <UTMTrackerCore />
    </Suspense>
  );
}
