"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HomepageBanner } from "@/types/ecommerce";

export default function AdminBannersPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Formulário de novo banner
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newCtaText, setNewCtaText] = useState("Explorar");
  const [newCtaUrl, setNewCtaUrl] = useState("#armacoes");
  const [newDesktopImg, setNewDesktopImg] = useState("");
  const [newMobileImg, setNewMobileImg] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const [newSortOrder, setNewSortOrder] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("homepage_banners")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setBanners(data as HomepageBanner[]);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.warn("Erro ao carregar banners do Supabase:", err);
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    // Permite âncoras locais (#armacoes, #lentes) e URLs absolutas seguras (https://)
    if (url.startsWith("#") || url.startsWith("/")) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim()) {
      setFormError("O título do banner é obrigatório.");
      return;
    }

    if (!newDesktopImg.trim()) {
      setFormError("Informe a URL da imagem para desktop.");
      return;
    }

    if (!newAltText.trim()) {
      setFormError("O texto alternativo de acessibilidade (Alt) é obrigatório.");
      return;
    }

    if (!isValidUrl(newCtaUrl)) {
      setFormError("Destino do botão inválido. Use um link seguro (#ancora ou https://).");
      return;
    }

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          subtitle: newSubtitle.trim() || null,
          cta_text: newCtaText.trim() || null,
          cta_url: newCtaUrl.trim() || null,
          image_url_desktop: newDesktopImg.trim(),
          image_url_mobile: newMobileImg.trim() || null,
          alt_text: newAltText.trim(),
          sort_order: newSortOrder,
          is_published: true,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setFormError(json.error || "Erro ao cadastrar banner no Supabase.");
        return;
      }

      if (json.banner) {
        setBanners((prev) => [...prev, json.banner as HomepageBanner]);
      }

      setFeedback("Banner criado com sucesso!");
      setIsCreating(false);
      setNewTitle("");
      setNewSubtitle("");
      setNewDesktopImg("");
      setNewMobileImg("");
      setNewAltText("");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Falha na comunicação com o servidor.");
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_published: !current }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setFeedback("Não foi possível atualizar o banner.");
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_published: !current } : b))
      );
      setFeedback(!current ? "Banner publicado." : "Banner despublicado.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback("Erro na comunicação com o servidor.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const deleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Deseja remover o banner "${title}"?`)) return;

    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setFeedback("Não foi possível remover o banner.");
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      setBanners((prev) => prev.filter((b) => b.id !== id));
      setFeedback("Banner removido.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao remover banner.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 bg-amber-400 text-[#06111f] font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            DESTAQUES & COMUNICAÇÃO
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Gestão de <span className="font-normal text-amber-400">Banners Institucionais</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure campanhas, imagens para desktop/mobile, botões de ação e ordem de exibição.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
        >
          <Plus size={16} />
          <span>{isCreating ? "Fechar Formulário" : "Novo Banner"}</span>
        </button>
      </div>

      {/* Formulário de Criação com Pré-visualização */}
      {isCreating && (
        <form onSubmit={handleCreateBanner} className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles size={16} className="text-amber-400" />
            Cadastrar Novo Banner
          </h3>

          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Título Principal do Banner *</label>
              <input
                type="text"
                placeholder="Ex: Nova Coleção Solar Ventara"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Subtítulo / Descrição Curta</label>
              <input
                type="text"
                placeholder="Ex: Proteção UV400 com design autoral exclusivo."
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Texto do Botão (CTA)</label>
              <input
                type="text"
                placeholder="Ex: Ver Coleção"
                value={newCtaText}
                onChange={(e) => setNewCtaText(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Link de Destino Seguro (URL ou #âncora) *</label>
              <input
                type="text"
                placeholder="Ex: #armacoes ou https://wa.me/..."
                value={newCtaUrl}
                onChange={(e) => setNewCtaUrl(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">URL Imagem Desktop (1920x600px recomendado) *</label>
              <input
                type="text"
                placeholder="https://..."
                value={newDesktopImg}
                onChange={(e) => setNewDesktopImg(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">URL Imagem Mobile (Opcional, 800x800px)</label>
              <input
                type="text"
                placeholder="https://..."
                value={newMobileImg}
                onChange={(e) => setNewMobileImg(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Texto Alternativo de Acessibilidade (Alt Text) *</label>
              <input
                type="text"
                placeholder="Descreva visualmente o banner para leitores de tela..."
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider"
            >
              Gravar Banner
            </button>
          </div>
        </form>
      )}

      {/* Lista de Banners */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-8">Carregando banners...</p>
        ) : banners.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <ImageIcon size={32} className="mx-auto text-slate-500" />
            <p className="text-sm font-medium text-white">Nenhum banner cadastrado</p>
            <p className="text-xs text-slate-400">
              Cadastre banners para divulgar novas coleções ou comunicados no topo da página.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-4 rounded-xl bg-[#091d33] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                    <img
                      src={banner.image_url_desktop}
                      alt={banner.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{banner.title}</h4>
                    <p className="text-xs text-slate-400">{banner.subtitle || "Sem subtítulo"}</p>
                    <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">
                      Destino: {banner.cta_url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => togglePublish(banner.id, banner.is_published)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      banner.is_published
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
                    }`}
                  >
                    {banner.is_published ? (
                      <>
                        <Eye size={12} /> Publicado
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} /> Rascunho
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBanner(banner.id, banner.title)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Excluir banner"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
