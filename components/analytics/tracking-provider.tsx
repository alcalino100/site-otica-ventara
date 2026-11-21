"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { bootTrackingScripts, hasMarketingConsent, loadTrackingConfig, trackEvent } from "@/lib/tracking/client";

function TrackingCore() {
  const pathname = usePathname();
  const search = useSearchParams();
  const last = useRef<string | null>(null);

  // PageView a cada navegação
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const key = `${pathname}?${search.toString()}`;
    if (last.current === key) return;
    last.current = key;
    void trackEvent("page_view");
  }, [pathname, search]);

  // Quando o visitante aceita os cookies de marketing: instala e dispara a página atual
  useEffect(() => {
    const onConsent = async () => {
      if (!hasMarketingConsent()) return;
      const cfg = await loadTrackingConfig(true);
      if (cfg) bootTrackingScripts(cfg);
      void trackEvent("page_view");
    };
    window.addEventListener("ventara_cookie_consent_updated", onConsent);
    return () => window.removeEventListener("ventara_cookie_consent_updated", onConsent);
  }, []);

  return null;
}

export function TrackingProvider() {
  return (
    <Suspense fallback={null}>
      <TrackingCore />
    </Suspense>
  );
}
