"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShippingCmsDocument,
  ShippingCmsHistoryRecord,
  ShippingCmsSection,
  SectionHeroData,
  SectionHighlightCardsData,
  SectionRegionalDeliveryData,
  SectionEstimatedTimeframeData,
  SectionNationalDeliveryData,
  SectionCarriersGridData,
  SectionHowItWorksData,
  SectionFaqData,
  SectionWhatsAppCtaData,
} from "@/types/shipping-cms";
import {
  saveShippingDraftAction,
  publishShippingCmsAction,
  getShippingHistoryAction,
  restoreShippingVersionAction,
  purgeShippingCacheAction,
} from "@/app/actions/shipping-cms";
import { ShippingCmsDocumentSchema } from "@/lib/validations/shipping-cms";
import { CmsTopBar } from "./cms-top-bar";
import { CmsThemeEditor } from "./cms-theme-editor";
import { CmsSectionAccordion } from "./cms-section-accordion";
import { CmsPublishModal } from "./cms-publish-modal";
import { CmsHistoryModal } from "./cms-history-modal";
import { Toast, ToastProps } from "@/components/ui/toast";

// Editores de seções
import { HeroEditor } from "./editors/hero-editor";
import { HighlightCardsEditor } from "./editors/highlight-cards-editor";
import { RegionalDeliveryEditor } from "./editors/regional-delivery-editor";
import { EstimatedTimeframeEditor } from "./editors/estimated-timeframe-editor";
import { NationalDeliveryEditor } from "./editors/national-delivery-editor";
import { CarriersEditor } from "./editors/carriers-editor";
import { HowItWorksEditor } from "./editors/how-it-works-editor";
import { FaqEditor } from "./editors/faq-editor";
import { WhatsAppCtaEditor } from "./editors/whatsapp-cta-editor";

import {
  Palette,
  Layout,
  Globe,
  Settings,
  Sparkles,
  Layers,
} from "lucide-react";

interface ShippingCmsAdminProps {
  initialDocument: ShippingCmsDocument;
  initialHistory: ShippingCmsHistoryRecord[];
}

export function ShippingCmsAdmin({
  initialDocument,
  initialHistory,
}: ShippingCmsAdminProps) {
  const [doc, setDoc] = useState<ShippingCmsDocument>(initialDocument);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(
    JSON.stringify(initialDocument)
  );
  const [history, setHistory] = useState<ShippingCmsHistoryRecord[]>(initialHistory);

  // Estados de Controle de Modais e Carregamento
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Acordeão aberto (ID da seção ou "theme" ou "seo")
  const [openAccordionId, setOpenAccordionId] = useState<string>("theme");

  // Notificações Toast
  const [toast, setToast] = useState<{ message: string | null; type?: "success" | "warning" | "info" }>({
    message: null,
  });

  const showToast = (message: string, type: "success" | "warning" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null }), 4500);
  };

  // Verificação de Estado Modificado (Dirty State)
  const isDirty = useMemo(() => {
    return JSON.stringify(doc) !== lastSavedSnapshot;
  }, [doc, lastSavedSnapshot]);

  // Alerta ao tentar sair com alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Coleta todas as URLs de imagens da página para detecção de duplicadas
  const allUsedImageUrls = useMemo(() => {
    const urls: string[] = [];
    if (doc.seo.og_image_url) urls.push(doc.seo.og_image_url);

    doc.sections.forEach((s) => {
      if (!s.data) return;
      if (s.data.image_url) urls.push(s.data.image_url);
      if (s.data.cards) {
        s.data.cards.forEach((c: any) => {
          if (c.image_url) urls.push(c.image_url);
        });
      }
    });
    return urls;
  }, [doc]);

  // Ordenação de seções: Mover para cima
  const handleMoveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...doc.sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;

    // Atualiza sort_order
    newSections.forEach((s, i) => {
      s.sort_order = i + 1;
    });

    setDoc({ ...doc, sections: newSections });
  };

  // Ordenação de seções: Mover para baixo
  const handleMoveSectionDown = (index: number) => {
    if (index === doc.sections.length - 1) return;
    const newSections = [...doc.sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;

    newSections.forEach((s, i) => {
      s.sort_order = i + 1;
    });

    setDoc({ ...doc, sections: newSections });
  };

  // Alternar ativação da seção
  const handleToggleSectionActive = (index: number) => {
    const newSections = [...doc.sections];
    newSections[index] = {
      ...newSections[index],
      is_active: !newSections[index].is_active,
    };
    setDoc({ ...doc, sections: newSections });
  };

  // Atualizar dados de uma seção específica
  const handleUpdateSectionData = (sectionId: string, updatedData: any) => {
    const newSections = doc.sections.map((s) =>
      s.id === sectionId ? { ...s, data: updatedData } : s
    );
    setDoc({ ...doc, sections: newSections });
  };

  // 1. Salvar Rascunho
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const result = await saveShippingDraftAction(doc);
      if (!result.success) {
        showToast(result.error || "Falha ao salvar rascunho.", "warning");
        return;
      }

      setLastSavedSnapshot(JSON.stringify(doc));
      showToast("Rascunho salvo com sucesso no banco de dados!");
    } catch (err: any) {
      showToast(err.message || "Erro de conexão ao salvar.", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Publicar no Ar
  const handleConfirmPublish = async (versionLabel: string, changeSummary: string) => {
    setIsPublishing(true);
    try {
      const result = await publishShippingCmsAction(doc, versionLabel, changeSummary);
      if (!result.success) {
        showToast(result.error || "Falha na publicação.", "warning");
        return;
      }

      setLastSavedSnapshot(JSON.stringify(doc));
      setIsPublishModalOpen(false);

      // Recarrega histórico
      const historyRes = await getShippingHistoryAction();
      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }

      showToast("Página publicada no ar e cache revalidado com sucesso!");
    } catch (err: any) {
      showToast(err.message || "Exceção ao publicar.", "warning");
    } finally {
      setIsPublishing(false);
    }
  };

  // 3. Abrir Modal de Histórico e Carregar
  const handleOpenHistory = async () => {
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    try {
      const res = await getShippingHistoryAction();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // 4. Restaurar Versão do Histórico
  const handleRestoreVersion = async (historyId: string) => {
    const res = await restoreShippingVersionAction(historyId);
    if (!res.success || !res.data) {
      showToast(res.error || "Não foi possível restaurar a versão.", "warning");
      return;
    }

    setDoc(res.data);
    showToast("Versão carregada no rascunho! Revise e publique quando desejar.");
  };

  // 5. Exportar JSON de Backup
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(doc, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `shipping-cms-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup JSON baixado com sucesso!");
  };

  // 6. Importar JSON de Backup
  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Validação estrita via Zod
        const validation = ShippingCmsDocumentSchema.safeParse(parsed);
        if (!validation.success) {
          showToast(
            `Arquivo inválido: ${validation.error.issues.map((i) => i.message).join(", ")}`,
            "warning"
          );
          return;
        }

        setDoc(validation.data as ShippingCmsDocument);
        showToast("Backup JSON importado no rascunho com sucesso! Clique em 'Salvar' ou 'Publicar'.");
      } catch (err: any) {
        showToast("Erro ao decodificar JSON: verifique a estrutura do arquivo.", "warning");
      }
    };
    reader.readAsText(file);
  };

  // 7. Limpar Cache da Página
  const handlePurgeCache = async () => {
    setIsPurging(true);
    try {
      const res = await purgeShippingCacheAction();
      showToast(res.message, res.success ? "success" : "warning");
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* Toast Feedback */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null })} />

      {/* Barra de Ações Fixa no Topo */}
      <CmsTopBar
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        isPurging={isPurging}
        historyCount={history.length}
        onSaveDraft={handleSaveDraft}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenHistoryModal={handleOpenHistory}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onPurgeCache={handlePurgeCache}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
        {/* Banner Explicativo */}
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-bold shrink-0">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Controle Completo da Página /entregas
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reordene blocos, alterne visibilidade, troque fotos, edite textos e valide o contraste WCAG AA em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <a
              href="/entregas"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Ver Página no Ar
            </a>
          </div>
        </div>

        {/* 1. ACORDEÃO DE TEMA E TOKENS VISUAIS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-amber-400" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                1. Identidade Visual & Design Tokens
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Tema Ativo: {doc.theme.preset_name}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-md">
            <CmsThemeEditor
              theme={doc.theme}
              onChange={(updatedTheme) => setDoc({ ...doc, theme: updatedTheme })}
            />
          </div>
        </div>

        {/* 2. ACORDEÕES DAS SEÇÕES NA MESMA ORDEM VISUAL */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-amber-400" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                2. Seções de Conteúdo (Ordem Visual da Página)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Use as setas ↑ ↓ para reordenar a exibição
            </span>
          </div>

          <div className="space-y-3">
            {doc.sections.map((section, index) => {
              const isOpen = openAccordionId === section.id;

              return (
                <CmsSectionAccordion
                  key={section.id}
                  id={section.id}
                  sectionType={section.section_type}
                  title={section.title_admin}
                  badge={section.section_type}
                  isActive={section.is_active}
                  isOpen={isOpen}
                  index={index}
                  totalCount={doc.sections.length}
                  onToggleOpen={() => setOpenAccordionId(isOpen ? "" : section.id)}
                  onToggleActive={() => handleToggleSectionActive(index)}
                  onMoveUp={() => handleMoveSectionUp(index)}
                  onMoveDown={() => handleMoveSectionDown(index)}
                >
                  {/* Renderiza o editor correspondente ao tipo de seção */}
                  {section.section_type === "hero" && (
                    <HeroEditor
                      data={section.data as SectionHeroData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                      usedImageUrls={allUsedImageUrls}
                    />
                  )}

                  {section.section_type === "highlight_cards" && (
                    <HighlightCardsEditor
                      data={section.data as SectionHighlightCardsData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                    />
                  )}

                  {section.section_type === "regional_delivery" && (
                    <RegionalDeliveryEditor
                      data={section.data as SectionRegionalDeliveryData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                      usedImageUrls={allUsedImageUrls}
                    />
                  )}

                  {section.section_type === "estimated_timeframe" && (
                    <EstimatedTimeframeEditor
                      data={section.data as SectionEstimatedTimeframeData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                    />
                  )}

                  {section.section_type === "national_delivery" && (
                    <NationalDeliveryEditor
                      data={section.data as SectionNationalDeliveryData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                      usedImageUrls={allUsedImageUrls}
                    />
                  )}

                  {section.section_type === "carriers_grid" && (
                    <CarriersEditor
                      data={section.data as SectionCarriersGridData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                    />
                  )}

                  {section.section_type === "how_it_works" && (
                    <HowItWorksEditor
                      data={section.data as SectionHowItWorksData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                    />
                  )}

                  {section.section_type === "faq" && (
                    <FaqEditor
                      data={section.data as SectionFaqData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                    />
                  )}

                  {section.section_type === "whatsapp_cta" && (
                    <WhatsAppCtaEditor
                      data={section.data as SectionWhatsAppCtaData}
                      onChange={(newData) => handleUpdateSectionData(section.id, newData)}
                    />
                  )}
                </CmsSectionAccordion>
              );
            })}
          </div>
        </div>

        {/* 3. CONFIGURAÇÕES GERAIS E SEO */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-amber-400" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
              3. Metadados e SEO da Página
            </h2>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Título da Página (Tag &lt;title&gt;)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {doc.seo.title.length}/70
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={70}
                  value={doc.seo.title}
                  onChange={(e) =>
                    setDoc({ ...doc, seo: { ...doc.seo, title: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Slug da Rota
                  </label>
                </div>
                <input
                  type="text"
                  value={doc.seo.slug}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Meta Descrição (Google e Compartilhamento)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {doc.seo.description.length}/160
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={160}
                  value={doc.seo.description}
                  onChange={(e) =>
                    setDoc({ ...doc, seo: { ...doc.seo, description: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Publicação */}
      <CmsPublishModal
        isOpen={isPublishModalOpen}
        theme={doc.theme}
        isPublishing={isPublishing}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
      />

      {/* Modal de Histórico */}
      <CmsHistoryModal
        isOpen={isHistoryModalOpen}
        history={history}
        isLoading={isHistoryLoading}
        onClose={() => setIsHistoryModalOpen(false)}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
}
