import React from "react";
import Link from "next/link";
import { isValidSafeUrl } from "@/lib/validations/content-engine";

interface SafeRichTextProps {
  content: string;
  className?: string;
}

/**
 * Renderiza texto rico de forma estritamente segura sem dangerouslySetInnerHTML livre.
 * Suporta quebras de linha (\n), negrito (**texto**), itálico (*texto*) e links seguros ([rótulo](url)).
 */
export function SafeRichText({ content, className = "" }: SafeRichTextProps) {
  if (!content) return null;

  // Divide por quebras de linha
  const paragraphs = content.split(/\n\s*\n/);

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split("\n");
        return (
          <p key={pIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderFormattedLine(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderFormattedLine(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex para capturar links: [texto](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderBoldItalic(text.substring(lastIndex, match.index), `txt-${lastIndex}`));
    }

    const label = match[1];
    const url = match[2];

    if (isValidSafeUrl(url)) {
      const isExternal = url.startsWith("http") || url.startsWith("wa.me");
      parts.push(
        <Link
          key={`link-${match.index}`}
          href={url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors font-medium"
        >
          {label}
        </Link>
      );
    } else {
      parts.push(label);
    }

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderBoldItalic(text.substring(lastIndex), `txt-${lastIndex}`));
  }

  return parts;
}

function renderBoldItalic(text: string, keyPrefix: string): React.ReactNode {
  // Trata negrito **bold**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <React.Fragment key={keyPrefix}>
      {boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith("**") && bPart.endsWith("**")) {
          const inner = bPart.slice(2, -2);
          return <strong key={bIdx} className="font-semibold text-white">{inner}</strong>;
        }

        // Trata itálico *italic*
        const italicParts = bPart.split(/(\*[^*]+\*)/g);
        return (
          <React.Fragment key={bIdx}>
            {italicParts.map((iPart, iIdx) => {
              if (iPart.startsWith("*") && iPart.endsWith("*")) {
                const inner = iPart.slice(1, -1);
                return <em key={iIdx} className="italic text-slate-200">{inner}</em>;
              }
              return iPart;
            })}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}
