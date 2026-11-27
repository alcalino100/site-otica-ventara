import { CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { optimizedImgProps } from "@/lib/image-url";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatBRL, type ZentaraOption } from "@/lib/zentara-options";

/** Cartões de compra Zentara (editáveis em /admin/zentara): 3 em linha no desktop; 2 + 1 centralizado no celular. */
export function ZentaraBuySection({ options }: { options: ZentaraOption[] }) {
  const list = options.filter((o) => o.active);
  const cols = list.length >= 3 ? "md:grid-cols-3" : list.length === 2 ? "md:grid-cols-2 md:max-w-3xl md:mx-auto" : "md:grid-cols-1 md:max-w-sm md:mx-auto";
  const centerLast = list.length % 2 === 1;
  return (
    <section id="comprar" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24" data-testid="zentara-comprar">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300">Super promoção Zentara</p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Escolha sua lente</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">Toque na opção desejada e finalize seu pedido direto no nosso WhatsApp.</p>
      </div>
      <div className={`mt-10 grid grid-cols-2 gap-4 md:gap-6 ${cols}`}>
        {list.map((o, i) => {
          const card = (
            <div data-testid={`zentara-opcao-${o.index}`} className="relative flex h-full flex-col rounded-3xl border-2 border-fuchsia-400 bg-black/60 p-3 shadow-[0_0_28px_rgba(217,70,239,0.55),inset_0_0_18px_rgba(168,85,247,0.25)] sm:p-4">
              <span className="absolute -left-2 -top-3 z-10 -rotate-6 rounded-lg bg-fuchsia-500 px-2.5 py-1 text-[10px] font-extrabold uppercase leading-tight tracking-wide text-white shadow-[0_0_18px_rgba(217,70,239,0.9)] sm:text-xs">Super<br />oferta</span>
              {o.badge && <span className="absolute right-3 top-3 z-10 rounded-md bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">{o.badge}</span>}
              <div className="overflow-hidden rounded-2xl bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...optimizedImgProps(o.imageUrl, [384, 640, 828])} sizes="(min-width: 640px) 380px, 44vw" alt={`Lentes ${o.name}`} width={1536} height={1024} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-fuchsia-300">Lente</p>
              <h3 className="text-base font-bold leading-tight sm:text-xl">{o.name}</h3>
              {o.tagline && <p className="mt-2 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-xs text-slate-200 sm:text-sm md:min-h-[3.75rem]"><Sparkles size={14} className="mt-0.5 shrink-0 text-fuchsia-300" />{o.tagline}</p>}
              <ul className="mt-3 space-y-1 text-xs text-slate-300 sm:text-sm">
                {o.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-1.5"><CheckCircle2 size={14} className="shrink-0 text-fuchsia-300" />{h}</li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                {o.oldPriceCents && o.priceCents && o.oldPriceCents > o.priceCents ? (
                  <div className="text-xs text-white sm:text-sm" data-testid={`zentara-preco-antigo-${o.index}`}><span className="text-slate-400">De </span><s>{formatBRL(o.oldPriceCents)}</s></div>
                ) : null}
                <div className="text-xl font-extrabold text-fuchsia-300 [text-shadow:0_0_14px_rgba(217,70,239,0.9)] sm:text-3xl" data-testid={`zentara-preco-${o.index}`}>
                  {o.priceCents ? formatBRL(o.priceCents) : <span className="text-sm font-semibold text-fuchsia-200 sm:text-base">Consulte o valor</span>}
                </div>
                <a
                  href={buildWhatsAppUrl(`Olá! Tenho interesse nas lentes ${o.name}${o.priceCents ? ` (${formatBRL(o.priceCents)})` : ""}. Pode me ajudar com o pedido?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`zentara-comprar-${o.index}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-fuchsia-500 px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wide text-white shadow-[0_0_22px_rgba(217,70,239,0.8)] transition-colors hover:bg-fuchsia-400 sm:text-sm"
                >
                  <MessageCircle size={16} className="shrink-0" /> Garantir no WhatsApp
                </a>
              </div>
            </div>
          );
          return centerLast && i === list.length - 1 ? (
            <div key={o.id} className="col-span-2 flex justify-center md:col-span-1"><div className="w-[calc(50%-0.5rem)] md:w-full">{card}</div></div>
          ) : (
            <div key={o.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
