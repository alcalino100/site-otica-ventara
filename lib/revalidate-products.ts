import { revalidatePath } from "next/cache";

/**
 * Atualiza TODAS as páginas públicas que mostram produtos depois de uma alteração no admin.
 * Os padrões dinâmicos ("/produto/[slug]", "/armacoes/[id]") cobrem qualquer produto e qualquer
 * forma de endereço (slug ou id), então fotos, cores e preços novos não ficam presos em cache.
 */
export function revalidateProductPages(slug?: string | null): void {
  const paths: Array<[string, ("page" | "layout")?]> = [
    ["/"],
    ["/armacoes"],
    ["/produto/[slug]", "page"],
    ["/armacoes/[id]", "page"],
    ["/admin/produtos"],
  ];
  if (slug) {
    paths.push([`/produto/${slug}`], [`/armacoes/${slug}`]);
  }
  for (const [path, type] of paths) {
    try {
      if (type) revalidatePath(path, type);
      else revalidatePath(path);
    } catch {
      // Fora de contexto de requisição (ex.: testes): ignora
    }
  }
}
