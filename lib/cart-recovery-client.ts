"use client";

import { hasMarketingConsent } from "@/lib/tracking/client";
import type { CartProduct } from "@/lib/cart";

const SESSION_KEY = "ventara_cart_session";
const OPTOUT_KEY = "ventara_cart_optout";

export function getCartSession(): string {
  try {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s || !/^[A-Za-z0-9_-]{16,64}$/.test(s)) {
      s = (crypto.randomUUID?.() || `${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/-/g, "");
      if (s.length < 16) s = s.padEnd(16, "0");
      localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "";
  }
}

export function hasOptedOut(): boolean {
  try {
    return localStorage.getItem(OPTOUT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Guarda o carrinho para lembrete. Só com consentimento de marketing e se a pessoa não pediu para sair. */
export async function captureCart(data: { name: string; email: string; phone: string; items: CartProduct[] }) {
  try {
    if (!hasMarketingConsent() || hasOptedOut()) return;
    const session_id = getCartSession();
    if (!session_id) return;
    await fetch("/api/cart-recovery/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, name: data.name, email: data.email, phone: data.phone, url: window.location.href, items: data.items }),
      keepalive: true,
    });
  } catch {
    /* nunca atrapalha a compra */
  }
}

export async function optOutOfReminders() {
  try {
    localStorage.setItem(OPTOUT_KEY, "1");
    await fetch("/api/cart-recovery/optout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: getCartSession() }) });
  } catch {
    /* ignora */
  }
}

/** Link do e-mail (/?retomar=TOKEN): recoloca os itens no carrinho. Devolve true se restaurou algo. */
export async function restoreCartFromToken(token: string, save: (items: CartProduct[]) => void): Promise<boolean> {
  try {
    if (!/^[a-f0-9]{64}$/.test(token)) return false;
    const r = await fetch(`/api/cart-recovery/restore?token=${token}`);
    const j = await r.json();
    if (!Array.isArray(j.items) || !j.items.length) return false;
    save(j.items as CartProduct[]);
    return true;
  } catch {
    return false;
  }
}
