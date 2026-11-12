/**
 * Tipos e Definições do Motor de Conteúdo Dinâmico (CMS Universal da Ótica Ventara)
 */

export type ContentFieldType =
  | "text"
  | "textarea"
  | "rich"
  | "image"
  | "link"
  | "list"
  | "color"
  | "toggle"
  | "select";

export interface ContentImageValue {
  url: string;
  alt: string;
  focalPoint?: {
    x: number; // 0 a 100%
    y: number; // 0 a 100%
  };
}

export interface ContentLinkValue {
  url: string;
  label?: string;
  targetBlank?: boolean;
}

export interface ContentFieldOption {
  label: string;
  value: string;
}

export interface ContentFieldDefinition {
  id: string; // Ex: "optisync.hero.title" ou "home.banner.headline"
  key: string; // Ex: "title"
  label: string; // Rótulo amigável em pt-BR
  type: ContentFieldType;
  default: any; // Valor fallback original do código
  maxLength?: number;
  placeholder?: string;
  help?: string; // Dica contextual para o lojista
  location?: string; // Onde aparece visualmente na página
  options?: ContentFieldOption[]; // Para campos tipo 'select'
  toggleLabels?: { on: string; off: string }; // Rótulos do campo tipo 'toggle' (padrão: "Seção Ativada" / "Seção Desativada")
}

export interface ContentSectionDefinition {
  id: string; // Ex: "hero", "simulator", "benefits", "faq"
  label: string; // Rótulo da seção em pt-BR
  description?: string;
  defaultVisible?: boolean;
  defaultOrder?: number;
  fields: ContentFieldDefinition[];
}

export interface ContentPageDefinition {
  id: string; // Ex: "optisync", "home", "armacoes", "lentes", "global-header"
  path: string; // Ex: "/optisync"
  title: string;
  category: "page" | "global" | "template";
  description: string;
  previewPath?: string;
  existingEditorUrl?: string; // Se já possuir um editor especializado (ex: /admin/entrega)
  sections: ContentSectionDefinition[];
}

export interface SiteContentRecord {
  page: string;
  key: string;
  status: "draft" | "published";
  value: any;
  updated_by?: string;
  updated_at?: string;
}

export interface SiteContentHistoryRecord {
  id: string;
  page: string;
  snapshot: Record<string, any>;
  label?: string;
  summary?: string;
  created_by?: string;
  created_at: string;
}

export interface PageContentDocument {
  page: string;
  status: "draft" | "published";
  values: Record<string, any>; // key-value map dos campos
  sectionsOrder?: string[];
  hiddenSections?: string[];
  updatedAt?: string;
  updatedBy?: string;
}
