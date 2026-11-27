import type { Metadata } from "next";
import { Droplets, Sparkles, Gem, Cpu, Eye, ShieldCheck, MessageCircle, Bike, Waves, SprayCan, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getZentaraOptions } from "@/lib/zentara-settings";
import { ZentaraBuySection } from "@/components/zentara/buy-section";
import { LightRays } from "@/components/zentara/light-rays";
import { ComparisonSlider } from "@/components/zentara/comparison-slider";
import { buildPageMetadata, OG_IMAGES } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { optimizedImgProps } from "@/lib/image-url";

export const metadata: Metadata = buildPageMetadata({
  title: "Lentes Zentara | Tratamento Hidrofóbico, Antirreflexo Premium e Alto Índice | Óticas Ventara",
  description:
    "Conheça a Zentara, a linha de lentes premium da Óticas Ventara: transparência cristalina, antirreflexo premium, tratamento hidrofóbico, índices até 1.74 e 12 meses de garantia.",
  path: "/zentara",
  image: OG_IMAGES.zentara,
});

const IMG = "/images/zentara";
const wa = buildWhatsAppUrl("Olá! Quero saber mais sobre as lentes Zentara.");

const DIFFERENTIALS = [
  { icon: Eye, title: "Excelente transparência", text: "Lentes com visão limpa e nítida, sem perda de clareza." },
  { icon: Gem, title: "Aparência cristalina", text: "Sem tonalidade amarelada indesejada." },
  { icon: Sparkles, title: "Antirreflexo premium Zentara", text: "Menos reflexos, mais conforto e uma aparência mais elegante." },
  { icon: Cpu, title: "Fabricação de última geração", text: "Tecnologias modernas e processos atuais de produção." },
  { icon: ShieldCheck, title: "Excelente qualidade óptica", text: "Desempenho óptico pensado para o seu dia a dia." },
  { icon: CheckCircle2, title: "12 meses de garantia", text: "Em todas as lentes Zentara." },
];

const INDICES = [
  { n: "1.49", note: "Básico", featured: false },
  { n: "1.56", note: "Intermediário", featured: false },
  { n: "1.67", note: "Fino", featured: false },
  { n: "1.74", note: "Ultrafino · graus elevados", featured: true },
];

const DAILY = [
  { icon: Droplets, text: "Ajuda a repelir as gotas de água da superfície da lente." },
  { icon: SprayCan, text: "Facilita a limpeza e reduz o acúmulo de marcas de água." },
  { icon: Bike, text: "Um benefício para quem trabalha com entregas de moto e fica exposto à chuva." },
  { icon: Waves, text: "Ajuda quem trabalha em ambientes úmidos ou em contato frequente com água." },
];

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">{children}</p>
);

export const revalidate = 60;

export default async function ZentaraPage() {
  const options = await getZentaraOptions();
  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white selection:bg-violet-500 selection:text-white font-sans">
      <LightRays />
      <Header theme="dark" />
      <main className="relative z-10 flex-1 pt-24">
        {/* HERO */}
        <section className="relative border-b border-white/10 px-4 py-16 sm:px-6 lg:py-24" data-testid="zentara-hero">
          <div className="relative mx-auto max-w-4xl text-center space-y-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...optimizedImgProps(`${IMG}/logo-zentara.png`, [384, 640, 828])} sizes="(min-width: 640px) 420px, 80vw" alt="Lentes Zentara" width={900} height={257} className="mx-auto h-auto w-[78%] max-w-[420px]" />
            <h1 className="text-3xl font-light leading-tight tracking-tight sm:text-5xl">
              Lentes premium para ver o mundo <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-400">com mais clareza</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-slate-300">
              A Zentara é a linha de lentes da Óticas Ventara: tecnologia moderna, tratamentos de alta performance e 12 meses de garantia.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500">
                <MessageCircle size={18} /> Falar no WhatsApp
              </a>
              <a href="#tratamentos" className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5">Ver os tratamentos</a>
            </div>
          </div>
        </section>

        {/* TRATAMENTOS */}
        <section id="tratamentos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24 space-y-14">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Tratamentos</Eyebrow>
            <h2 className="!text-3xl !font-semibold">Veja a diferença na prática</h2>
            <p className="text-slate-300">Arraste o seletor sobre cada imagem para comparar a lente sem e com tratamento.</p>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-2" data-testid="trat-hidrofobico">
            <ComparisonSlider testId="cmp-hidrofobico" beforeSrc={`${IMG}/hidrofobico-sem.jpg`} afterSrc={`${IMG}/hidrofobico-com.jpg`} beforeLabel="Sem hidrofóbico" afterLabel="Com hidrofóbico" alt="Lente com gotas de água" />
            <div className="space-y-3">
              <Droplets className="text-violet-400" size={28} />
              <h3 className="text-2xl font-semibold">Tratamento hidrofóbico</h3>
              <p className="text-slate-300">Na lente sem tratamento, a água se espalha e forma marcas e escorridos. Na lente com tratamento hidrofóbico, a água forma gotas que escorrem com facilidade: a lente repele a água e fica mais fácil de limpar.</p>
            </div>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-2" data-testid="trat-antirreflexo">
            <div className="space-y-3 lg:order-1 order-2">
              <Sparkles className="text-violet-400" size={28} />
              <h3 className="text-2xl font-semibold">Antirreflexo premium Zentara</h3>
              <p className="text-slate-300">Sem antirreflexo, a lente reflete a luz e esconde os olhos de quem está olhando, dentro e fora de casa. Com o antirreflexo premium Zentara, os reflexos diminuem: a lente fica mais transparente, os olhos aparecem e o visual fica mais elegante.</p>
            </div>
            <div className="lg:order-2 order-1">
              <ComparisonSlider testId="cmp-antirreflexo" beforeSrc={`${IMG}/antirreflexo-sem.jpg`} afterSrc={`${IMG}/antirreflexo-com.jpg`} beforeLabel="Sem antirreflexo" afterLabel="Zentara premium" alt="Rosto com óculos" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/40 to-black/60 p-6 sm:p-10" data-testid="trat-transparencia">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Gem className="text-violet-400" size={28} />
                <h3 className="text-2xl font-semibold">Transparência de verdade</h3>
                <p className="text-slate-300">Algumas lentes convencionais podem apresentar tonalidade residual ou um aspecto amarelado. As lentes Zentara têm excelente transparência e uma aparência mais cristalina.</p>
              </div>
              <ul className="grid gap-3 text-sm">
                <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><span className="text-slate-400">Lente convencional</span><br />Pode apresentar tonalidade residual ou aspecto amarelado.</li>
                <li className="rounded-xl border border-violet-500/40 bg-violet-500/10 p-4"><span className="text-violet-300">Lente Zentara</span><br />Excelente transparência e aparência cristalina.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* QUALIDADE */}
        <section className="border-y border-white/10 bg-black/30 px-4 py-16 sm:px-6 lg:py-24" data-testid="zentara-qualidade">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="max-w-2xl space-y-3">
              <Eyebrow>Por que Zentara</Eyebrow>
              <h2 className="!text-3xl !font-semibold">Qualidade que você percebe</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIFFERENTIALS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/40 p-5 transition-colors hover:border-violet-500/50">
                  <Icon className="mb-3 text-violet-400" size={24} />
                  <h3 className="mb-1 text-base font-semibold">{title}</h3>
                  <p className="text-sm text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ÍNDICES */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24" data-testid="zentara-indices">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="mx-auto w-full max-w-[560px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...optimizedImgProps(`${IMG}/indices-miopia.jpg`, [640, 828, 1080])} sizes="(min-width: 1024px) 560px, 92vw" alt="Comparação de espessura das lentes para miopia de -5,00 nos índices 1.49, 1.56, 1.67 e 1.74" width={1200} height={1200} loading="lazy" decoding="async" className="aspect-square w-full rounded-2xl border border-white/10 object-cover" />
            </div>
            <div className="space-y-5">
              <Eyebrow>Índices de refração</Eyebrow>
              <h2 className="!text-3xl !font-semibold">Lentes para todos os graus</h2>
              <p className="text-slate-300">A Zentara oferece diferentes índices de refração para atender cada necessidade. Quem tem grau mais alto pode escolher índices maiores, que reduzem significativamente a espessura da lente e deixam os óculos mais leves e bonitos.</p>
              <div className="grid grid-cols-2 gap-3">
                {INDICES.map((i) => (
                  <div key={i.n} data-testid={`indice-${i.n}`} className={`rounded-xl border p-4 ${i.featured ? "border-violet-400 bg-violet-500/15 shadow-[0_0_30px_rgba(139,92,246,0.25)]" : "border-white/10 bg-white/[0.03]"}`}>
                    <div className="text-2xl font-semibold">{i.n}</div>
                    <div className={`text-xs ${i.featured ? "text-violet-200" : "text-slate-400"}`}>{i.note}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-300"><strong className="text-white">Índice 1.74:</strong> indicado para graus elevados, com lentes mais finas e estética mais bonita. A indicação ideal para o seu grau é confirmada na loja.</p>
            </div>
          </div>
        </section>

        {/* DIA A DIA */}
        <section className="border-t border-white/10 bg-black/30 px-4 py-16 sm:px-6 lg:py-24" data-testid="zentara-dia-a-dia">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="max-w-2xl space-y-3">
              <Eyebrow>No dia a dia</Eyebrow>
              <h2 className="!text-3xl !font-semibold">Hidrofóbico: onde você mais vai notar</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {DAILY.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/40 p-5">
                  <Icon className="mt-0.5 shrink-0 text-violet-400" size={24} />
                  <p className="text-slate-200">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">O tratamento hidrofóbico repele a água e facilita a limpeza da lente. Ele não impede totalmente o embaçamento.</p>
          </div>
        </section>

        <ZentaraBuySection options={options} />

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-violet-500/30 bg-violet-600/10 p-8 text-center space-y-4">
            <h2 className="!text-2xl !font-semibold sm:!text-3xl">Quer lentes Zentara nos seus óculos?</h2>
            <p className="text-slate-300">Fale com a gente e descubra o índice e os tratamentos ideais para o seu grau. 12 meses de garantia em todas as lentes Zentara.</p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500">
              <MessageCircle size={18} /> Chamar no WhatsApp
            </a>
          </div>
        </section>
      </main>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
