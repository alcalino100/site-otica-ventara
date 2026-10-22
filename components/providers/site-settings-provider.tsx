"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SiteIdentitySettings, SiteAppearanceSettings } from "@/types/ecommerce";
import { DEFAULT_IDENTITY, DEFAULT_APPEARANCE } from "@/lib/site-settings-constants";

interface SiteSettingsContextValue {
  identity: SiteIdentitySettings;
  appearance: SiteAppearanceSettings;
  fullAddress: string;
  cleanWhatsAppNumber: string;
  updateSettings: (newIdentity?: Partial<SiteIdentitySettings>, newAppearance?: Partial<SiteAppearanceSettings>) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  identity: DEFAULT_IDENTITY,
  appearance: DEFAULT_APPEARANCE,
  fullAddress: `${DEFAULT_IDENTITY.address_street}, ${DEFAULT_IDENTITY.address_neighborhood} · ${DEFAULT_IDENTITY.address_city}-${DEFAULT_IDENTITY.address_state}`,
  cleanWhatsAppNumber: "5518996155748",
  updateSettings: () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<SiteIdentitySettings>(DEFAULT_IDENTITY);
  const [appearance, setAppearance] = useState<SiteAppearanceSettings>(DEFAULT_APPEARANCE);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.identity) setIdentity((prev) => ({ ...prev, ...data.identity }));
          if (data.appearance) setAppearance((prev) => ({ ...prev, ...data.appearance }));
        }
      } catch (err) {
        console.warn("Utilizando dados padrão de identidade:", err);
      }
    }

    loadSettings();
  }, []);

  // Injeção de variáveis CSS dinâmicas baseadas na aparência configurada no Admin
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.style.setProperty("--navy", appearance.color_navy);
    root.style.setProperty("--deep", appearance.color_navy);
    root.style.setProperty("--electric", appearance.color_electric);
    root.style.setProperty("--yellow", appearance.color_yellow);
    root.style.setProperty("--gold", appearance.color_yellow);
    root.style.setProperty("--light", appearance.color_ice_white);

    // Cria ou atualiza a tag de estilo de tema dinâmico para sobrescrever classes estáticas
    let styleTag = document.getElementById("ventara-dynamic-theme") as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "ventara-dynamic-theme";
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --navy: ${appearance.color_navy} !important;
        --deep: ${appearance.color_navy} !important;
        --electric: ${appearance.color_electric} !important;
        --yellow: ${appearance.color_yellow} !important;
        --gold: ${appearance.color_yellow} !important;
        --light: ${appearance.color_ice_white} !important;
      }
      body {
        background-color: ${appearance.color_navy} !important;
      }
      .bg-\\[\\#06111f\\], .bg-\\[\\#06111F\\] {
        background-color: ${appearance.color_navy} !important;
      }
      .text-\\[\\#FFD62E\\], .text-\\[\\#ffd62e\\] {
        color: ${appearance.color_yellow} !important;
      }
      .bg-\\[\\#FFD62E\\], .bg-\\[\\#ffd62e\\] {
        background-color: ${appearance.color_yellow} !important;
      }
      .border-\\[\\#FFD62E\\], .border-\\[\\#ffd62e\\] {
        border-color: ${appearance.color_yellow} !important;
      }
    `;
  }, [appearance]);

  const fullAddress = `${identity.address_street}, ${identity.address_neighborhood} · ${identity.address_city}-${identity.address_state}`;
  const cleanWhatsAppNumber = identity.phone_whatsapp.replace(/\D/g, "").length >= 10
    ? `55${identity.phone_whatsapp.replace(/\D/g, "")}`
    : "5518996155748";

  const updateSettings = (
    newIdentity?: Partial<SiteIdentitySettings>,
    newAppearance?: Partial<SiteAppearanceSettings>
  ) => {
    if (newIdentity) setIdentity((prev) => ({ ...prev, ...newIdentity }));
    if (newAppearance) setAppearance((prev) => ({ ...prev, ...newAppearance }));
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        identity,
        appearance,
        fullAddress,
        cleanWhatsAppNumber,
        updateSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
