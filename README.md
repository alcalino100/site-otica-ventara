# Site - Ótica Ventara

Protótipo institucional com catálogo interativo, inspirado na referência fornecida. Não é uma loja operacional.

## Executar

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000. Para conferir a compilação: `npm run build`.

## Incluído

- Next.js App Router, React, TypeScript, Tailwind CSS 4 e Lucide.
- Layout responsivo, hero com ilustração SVG original, apresentação, catálogo, lentes, FAQ e contato.
- Filtro por categoria, busca por nome, detalhes do modelo e seleção de produtos em memória.
- Feedback de ações, resultados vazios e navegação mobile.

## Antes de publicar

1. Revisar dependências e executar instalação/build. Este pacote foi gerado sem executar o build.
2. Substituir as ilustrações por fotografias licenciadas dos produtos reais e fornecer o logotipo oficial.
3. Confirmar cidade, endereço, telefone, horários e descrição da empresa.
4. Substituir os produtos fictícios por catálogo real, com preços, estoque, materiais e medidas.
5. Validar alegações de serviços, garantias e prazos antes de incluí-las. As métricas da referência não foram reproduzidas.
6. Conectar o atendimento oficial. O botão de contato atual só mostra um aviso local.
7. Para e-commerce: implementar backend, catálogo, estoque, frete, checkout, gateway, webhooks e políticas revisadas.
8. Auditar acessibilidade. O diálogo é básico: implementar focus trap e restauração de foco antes da produção.
9. Adicionar estados reais de carregamento/erro quando houver chamadas ao servidor. Não há carregamento artificial nesta versão.

## GitHub e Fluxo de Trabalho

O projeto está publicado em: [github.com/alcalino100/site-otica-ventara](https://github.com/alcalino100/site-otica-ventara) com deploy contínuo na Vercel.

Para diretrizes de governança, padrões de Pull Requests, regras de arquitetura, esteira de qualidade e princípios de animação (Emil Kowalski & Motion Principles), consulte o documento oficial:
👉 [**AGENTS.md**](./AGENTS.md)

## Limitações

Sem autenticação, banco de dados, pagamentos, analytics, envio de mensagens ou persistência do carrinho. A seleção é descartada ao recarregar. Não inclui shadcn/ui pois esta primeira superfície não exige componentes desse toolkit. Imagens geradas em SVG são representações conceituais e não fotografias de produtos.
