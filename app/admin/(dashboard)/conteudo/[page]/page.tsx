"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ContentTopBar } from "@/components/admin/content-cms/content-top-bar";
import { ContentSectionAccordion } from "@/components/admin/content-cms/content-section-accordion";
import { ContentPublishModal } from "@/components/admin/content-cms/content-publish-modal";
import { ContentHistoryModal } from "@/components/admin/content-cms/content-history-modal";
import { ContentBackgroundSwitcher } from "@/components/admin/content-cms/content-background-switcher";
import {
  ContentPageDefinition,
  ContentSectionDefinition,
  SiteContentHistoryRecord,
} from "@/lib/content/types";

export default function PageContentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = typeof params.page === "string" ? params.page : "";

  const [isLoading, setIsLoading] = useState(true);
  const [definition, setDefinition] = useState<ContentPageDefinition | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([]);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [history, setHistory] = useState<SiteContentHistoryRecord[]>([]);
  const [availablePages, setAvailablePages] = useState<Array<{ id: string; title: string; path: string }>>([]);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Carrega dados da página via API administrativa
  const loadPageData = useCallback(async () => {
    if (!pageId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/content/${pageId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Falha ao carregar conteúdo de '${pageId}'`);
      }

      const data = await res.json();
      setDefinition(data.definition);
      setHistory(data.history || []);
      setAvailablePages(data.availablePages || []);

      const loadedValues = data.draft || data.defaults || {};
      setValues(loadedValues);
      setInitialValues(loadedValues);

      // Ordem padrão das seções
      const defaultOrder = (data.definition.sections as ContentSectionDefinition[]).map((s) => s.id);
      setSectionsOrder(loadedValues._sectionsOrder || defaultOrder);
      setHiddenSections(loadedValues._hiddenSections || []);

      setIsDirty(false);
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Erro ao carregar dados" });
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // Atualização de um campo
  const handleFieldChange = (key: string, val: any) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      setIsDirty(true);
      return next;
    });
  };

  // Reordenação de seção
  const handleMoveSection = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= sectionsOrder.length) return;
    const newOrder = [...sectionsOrder];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setSectionsOrder(newOrder);
    setIsDirty(true);
  };

  // Visibilidade de seção
  const handleToggleVisibility = (sectionId: string) => {
    setHiddenSections((prev) => {
      const isHidden = prev.includes(sectionId);
      const next = isHidden ? prev.filter((id) => id !== sectionId) : [...prev, sectionId];
      setIsDirty(true);
      return next;
    });
  };

  // Salvar Rascunho
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setToastMessage(null);
    try {
      const res = await fetch(`/api/admin/content/${pageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          values,
          sectionsOrder,
          hiddenSections,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao salvar rascunho");
      }

      setIsDirty(false);
      setInitialValues(values);
      setToastMessage({ type: "success", text: "Rascunho salvo com sucesso no banco!" });
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Erro ao salvar rascunho" });
    } finally {
      setIsSaving(false);
    }
  };

  // Publicar no Ar
  const handleConfirmPublish = async (label: string, summary: string) => {
    setIsPublishing(true);
    setToastMessage(null);
    try {
      const res = await fetch(`/api/admin/content/${pageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          label,
          summary,
          values,
          sectionsOrder,
          hiddenSections,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao publicar alterações");
      }

      setIsDirty(false);
      setToastMessage({
        type: "success",
        text: "Conteúdo publicado no ar com sucesso! O cache do site foi revalidado.",
      });
      // Recarrega histórico
      loadPageData();
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Erro ao publicar no ar" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Restaurar Versão
  const handleRestoreVersion = async (historyId: string) => {
    const res = await fetch(`/api/admin/content/${pageId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "restore",
        historyId,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Erro ao restaurar versão");
    }

    const data = await res.json();
    if (data.restoredValues) {
      setValues(data.restoredValues);
      setIsDirty(true);
    }
  };

  // Exportar Backup JSON
  const handleExportJson = () => {
    const backupData = {
      page: pageId,
      exportedAt: new Date().toISOString(),
      values,
      sectionsOrder,
      hiddenSections,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-cms-${pageId}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar Backup JSON
  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.values || typeof parsed.values !== "object") {
        throw new Error("Arquivo JSON inválido (campo 'values' não encontrado)");
      }

      setValues(parsed.values);
      if (parsed.sectionsOrder) setSectionsOrder(parsed.sectionsOrder);
      if (parsed.hiddenSections) setHiddenSections(parsed.hiddenSections);
      setIsDirty(true);

      setToastMessage({
        type: "success",
        text: "Conteúdo importado com sucesso para o rascunho! Revise e clique em 'Salvar Rascunho' ou 'Publicar'.",
      });
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: `Falha na importação: ${err.message || "Arquivo inválido"}`,
      });
    }
  };

  // Aplicação do Fundo em Outras Páginas
  const handleApplyBackgroundToOtherPages = async (
    targetPages: string[],
    bgConfig: Record<string, any>
  ) => {
    const res = await fetch("/api/admin/content/batch-background", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetPages, backgroundConfig: bgConfig }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Falha ao aplicar fundo nas páginas selecionadas");
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-amber-400" />
        <span className="text-sm">Carregando editor de conteúdo...</span>
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="p-8 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200">
        <h2 className="text-base font-bold text-white">Página não encontrada</h2>
        <p className="text-xs mt-1">
          A página &quot;{pageId}&quot; não está cadastrada no catálogo central de conteúdo.
        </p>
      </div>
    );
  }

  // Ordena as seções com base em sectionsOrder
  const orderedSections = [...definition.sections].sort((a, b) => {
    const aIdx = sectionsOrder.indexOf(a.id);
    const bIdx = sectionsOrder.indexOf(b.id);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Barra de Ações Superior Fixa */}
      <ContentTopBar
        pageTitle={definition.title}
        pagePath={definition.path}
        previewUrl={definition.previewPath || `${definition.path}?preview=draft`}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        historyCount={history.length}
        onSaveDraft={handleSaveDraft}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-lg ${
            toastMessage.type === "success"
              ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-200"
              : "bg-red-950/80 border border-red-500/30 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Switcher Visual de Fundo de Página (Presets & Estilos) */}
      {definition.category === "page" && (
        <ContentBackgroundSwitcher
          pageId={pageId}
          pageTitle={definition.title}
          values={values}
          onFieldChange={handleFieldChange}
          onApplyToOtherPages={handleApplyBackgroundToOtherPages}
          availablePages={availablePages.filter((p) => p.id !== pageId)}
        />
      )}

      {/* Lista de Acordeões na Ordem Visual da Página */}
      <div className="space-y-4">
        {orderedSections.map((section, idx) => {
          const isHidden = hiddenSections.includes(section.id);

          return (
            <ContentSectionAccordion
              key={section.id}
              section={section}
              index={idx}
              totalSections={orderedSections.length}
              values={values}
              isHidden={isHidden}
              onFieldChange={handleFieldChange}
              onMoveUp={() => handleMoveSection(idx, idx - 1)}
              onMoveDown={() => handleMoveSection(idx, idx + 1)}
              onToggleVisibility={() => handleToggleVisibility(section.id)}
            />
          );
        })}
      </div>

      {/* Modais de Publicação e Histórico */}
      <ContentPublishModal
        isOpen={isPublishModalOpen}
        pageTitle={definition.title}
        isPublishing={isPublishing}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handleConfirmPublish}
      />

      <ContentHistoryModal
        isOpen={isHistoryModalOpen}
        pageTitle={definition.title}
        history={history}
        isLoading={false}
        onClose={() => setIsHistoryModalOpen(false)}
        onRestoreVersion={handleRestoreVersion}
      />
    </div>
  );
}
