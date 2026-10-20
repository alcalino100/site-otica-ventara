# Diretrizes do Projeto Ótica Ventara — Contexto para Agentes de IA e Desenvolvedores

> **Aviso Importante para Agentes:**  
> Este documento estabelece o padrão obrigatório de engenharia, governança, design, motion e qualidade para qualquer agente (de qualquer modelo: Gemini, Claude, GPT, etc.) ou desenvolvedor atuando neste repositório. Nenhuma modificação deve ser mesclada sem respeitar estas diretrizes.

---

## 1. Visão Geral do Projeto
- **Nome:** Ótica Ventara (`site-otica-ventara`)
- **Objetivo:** Site institucional e plataforma de produtos ópticos (armações de grau, solares e lentes) com presença digital sofisticada, diferenciada e única.
- **Stack Tecnológico:**
  - Framework: [Next.js](https://nextjs.org/) (App Router)
  - Biblioteca de UI: [React](https://react.dev/)
  - Tipagem: [TypeScript](https://www.typescriptlang.org/)
  - Estilização: [Tailwind CSS](https://tailwindcss.com/)
  - Ícones: [Lucide React](https://lucide.dev/)
  - Deploy contínuo: [Vercel](https://vercel.com/)
  - Repositório oficial: [github.com/alcalino100/site-otica-ventara](https://github.com/alcalino100/site-otica-ventara)

---

## 2. Governança e Fluxo de Entrega no GitHub

### 2.1. Regra de Ouro: Sem Commits Diretos na `main`
- Toda alteração **deve** ser sincronizada com o GitHub.
- É estritamente proibido commitar diretamente na branch principal (`main`).
- Todo trabalho deve ser gerenciado por meio de **Branches dedicadas** e **Pull Requests (PRs)**.

### 2.2. Gestão de Tarefas via Issues
Antes de implementar qualquer alteração, certifique-se de que existe uma **Issue aberta no GitHub**. As issues devem ser categorizadas com as seguintes labels:
- `Correção`: Para correção de bugs, quebras visuais, falhas de lógica ou regressões.
- `Melhoria`: Para otimizações de performance, refatorações, refinamentos visuais de UX/UI ou motion.
- `Nova função`: Para novas funcionalidades, novas páginas, integrações ou componentes inéditos.

### 2.3. Padrão Obrigatório de Pull Request (PR)
Ao abrir um PR (via `gh pr create` ou interface web), o template oficial deve ser rigorosamente preenchido:
1. **Issue Relacionada:** Mencionar explicitamente a issue (ex: `Closes #1`, `Fixes #2`, `Relacionado a #3`).
2. **O que mudou:** Descrição detalhada do escopo técnico e visual implementado.
3. **Como foi validado:** Checklist de testes locais, verificação de build (`npm run build`), validação em múltiplos viewports (mobile/desktop) e análise de consistência.
4. **Riscos, limitações e próximos passos:** Registrar eventuais dependências pendentes, pontos de atenção ou melhorias subsequentes.

---

## 3. Filosofia de Motion e Design de Interação (Emil Kowalski & Motion Principles)

O projeto utiliza as skills de design de movimento inspiradas nas filosofias de **Emil Kowalski**, **Jakub Krehel** e **Jhey Tompkins**, disponíveis localmente em `.agents/skills/`:
- `animate`: Criação de animações sob medida com contenção e timing ideal.
- `design-motion-principles`: Auditoria e criação orientada a princípios de movimento sem clichês ("AI-slop").
- `review-animations` / `improve-animations`: Revisão crítica e refatoração de motion.

### 3.1. Requisitos Obrigatórios de Toda Interface
1. **Lazy Loading consciente:**
   - Carregamento sob demanda de componentes secundários, imagens pesadas e ilustrações fora da dobra inicial (*viewport*).
2. **Skeleton Screens contextuais:**
   - Para carregamento de dados, listas de produtos e modais. Evitar telas em branco ou spinners genéricos que causem layout shifts bruscos.
3. **Animações suaves de entrada e saída:**
   - Entradas com curvas de aceleração/desaceleração naturais (springs ou cubic-bezier refinadas); saídas ligeiramente mais rápidas para manter o dinamismo.
4. **Estados de progresso em elementos interativos:**
   - Botões, campos e seletores devem exibir feedback visual imediato (loading spinner interno sem alterar a dimensão do botão, estado desabilitado sutil).
5. **Feedback visual imediato:**
   - Toasts não-intrusivos, micro-interações táteis de clique e hover, estados ativos perceptíveis e previsíveis.
6. **Transições consistentes:**
   - Continuidade visual coerente entre telas, abertura e fechamento de cards, modais e filtros de lista.

### 3.2. Revisão de Designer de Produto Sênior
Antes de considerar qualquer entrega concluída, atue como um **Designer de Produto Sênior** e audite a interface:
- Eliminar qualquer efeito brusco, travado, exagerado, genérico ou amador.
- Movimento deve ter **propósito de guiar a atenção** e **nunca atrapalhar ou atrasar a ação** do usuário.
- Respeitar rigorosamente preferências de acessibilidade (`prefers-reduced-motion`).

---

## 4. Esteira de Qualidade de Código (CI/CD)

Antes de qualquer merge na branch principal, o código deve passar pelos seguintes pilares:

### 4.1. Observabilidade
- **Sentry:** Monitoramento em tempo real de exceções e erros no cliente/servidor.
- **OpenTelemetry / Datadog / New Relic:** Tracing distribuído e métricas de desempenho quando houver backend dedicado.

### 4.2. Qualidade e Linting
- **Biome / ESLint:** Padronização estrita de código e formatação limpa.
- **Commitlint:** Mensagens de commit semânticas (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- **Knip:** Varredura contínua para prevenir dependências não utilizadas, tipos mortos e arquivos órfãos.
- **arch-contract:** Garantia de respeito às camadas de arquitetura.

### 4.3. Testes Automatizados
- **Testes Unitários e de Integração:** Para regras de negócio, cálculos de frete, seletores de grau e formatação de dados.
- **Testes End-to-End (E2E):** Suíte com **Playwright** cobrindo fluxos críticos (navegação de catálogo, abertura de detalhes de produto, interação com filtros e checkout/contato).
- **Cobertura:** Monitoramento via Codecov.

### 4.4. Segurança e Operação
- **Rate Limit:** Proteção em formulários e endpoints de API contra abusos.
- **Revisão de Segurança:** Validação periódica com `npm audit` e sanitização de inputs.
- **Performance Budget:**
  - LCP (Largest Contentful Paint) < 2.5s
  - CLS (Cumulative Layout Shift) < 0.1
  - INP (Interaction to Next Paint) < 200ms
- **Separação Frontend / Backend:** Camada de apresentação descolada de regras de persistência e serviços externos.
- **Privacidade e Conformidade:** Termos de uso e política de privacidade alinhados com a LGPD.

---

## 5. Diretrizes de Arquitetura de Software

1. **Evitar Overengineering:**
   - Construir soluções simples, robustas e escaláveis. Não adicionar abstrações ou bibliotecas complexas sem necessidade clara.
2. **Eliminar Bottlenecks:**
   - Evitar re-renders desnecessários no React; otimizar SVGs e imagens; monitorar o tamanho final do bundle.
3. **Componentização Modular:**
   - Quebrar componentes grandes em subcomponentes coesos e bem delimitados desde o início.
4. **DRY com Critério:**
   - Reutilizar código genuinamente compartilhado, mas sem criar acoplamento ou abstrações prematuras entre funcionalidades com ciclos de vida independentes.
5. **Reaproveitamento de Componentes:**
   - Antes de criar um componente novo, verificar se ele já existe na base de código para evitar duplicações.
