import Link from "next/link";
import { ComparisonSlider } from "@/components/zentara/comparison-slider";

/** Faixa de destaque das lentes Zentara na home (fundo roxo, botão roxo). */
export function ZentaraBanner() {
  return (
    <section
      data-testid="zentara-banner"
      className="relative overflow-hidden bg-black px-4 py-14 sm:px-6 lg:py-20"
      aria-label="Lentes Zentara"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.25),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="space-y-5 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">Nova linha de lentes</p>
          <h2 className="text-3xl font-light leading-tight text-white sm:text-4xl lg:text-5xl">
            Lentes <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-400">Zentara</span>
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-300 sm:text-base lg:mx-0">
            Tratamento hidrofóbico, antirreflexo premium, transparência cristalina e 12 meses de garantia. Veja a diferença na prática.
          </p>
          <Link
            href="/zentara"
            data-testid="zentara-banner-cta"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Conhecer as lentes Zentara
          </Link>
        </div>
        <div className="rounded-3xl border border-violet-500/30 p-2 shadow-[0_0_60px_rgba(124,58,237,0.25)]">
          <ComparisonSlider
            testId="zentara-banner-slider"
            beforeSrc="/images/zentara/hidrofobico-sem.jpg"
            afterSrc="/images/zentara/hidrofobico-com.jpg"
            beforeLabel="Sem hidrofóbico"
            afterLabel="Com hidrofóbico"
            alt="Lente com gotas de água"
          />
        </div>
      </div>
    </section>
  );
}
