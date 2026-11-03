# Guia do Usuário — CMS da Rede de Entregas (/entregas)

Este guia orienta administradores e operadores da **Ótica Ventara** a gerenciar **100% dos textos, imagens, cores, ordem e visibilidade das seções** da página de entregas (`https://www.oticasventara.com.br/entregas`), diretamente pelo painel administrativo (`/admin/entrega`), sem necessidade de programação ou novos deploys.

---

## 1. Visão Geral da Arquitetura

O sistema opera com o conceito de **Rascunho vs. Publicado**:
- **Rascunho (Draft):** Ambiente de trabalho onde você pode alterar textos, fotos, cores e seções. Essas alterações **não afetam** o site no ar até que você clique em **Publicar**.
- **Publicado (Published):** A versão ativa visível para os clientes no ar.
- **Snapshot e Histórico:** Toda vez que você publica, uma versão com data, autor e changelog é arquivada automaticamente no banco de dados Supabase (`shipping_cms_history`).
- **Resiliência Total:** Caso o banco passe por instabilidade temporária, o site utiliza automaticamente valores padrão de fallback de alta qualidade (zero páginas quebradas).

---

## 2. Acesso ao Painel

1. Acesse o painel administrativo em: `https://www.oticasventara.com.br/admin/entrega`
2. No topo da tela, você verá a **Barra de Ações Superior Fixa**:
   - **Indicador de Status:** Sinaliza se há alterações não salvas no rascunho (*"Não Salvo"* em amarelo) ou se está sincronizado (*"Sincronizado"* em verde).
   - **Exportar JSON:** Faz o download de um arquivo `.json` com o backup de todo o conteúdo da página.
   - **Importar:** Permite carregar um arquivo `.json` salvo anteriormente para restaurar dados em massa.
   - **Histórico:** Abre o modal com os últimos 10 snapshots publicados para conferência ou restauração.
   - **Limpar Cache:** Dispara a revalidação imediata do cache do Next.js.
   - **Pré-visualizar:** Abre a página `/entregas?preview=draft` em nova aba com uma tarja identificando o modo de rascunho.
   - **Salvar Rascunho:** Salva as alterações de trabalho no banco de dados.
   - **Publicar:** Abre o modal de confirmação para colocar as alterações no ar.

---

## 3. Gestão de Identidade Visual e Tokens (Tema)

Na seção **1. Identidade Visual & Design Tokens**:

### 3.1. Presets de 1 Clique
- **Off-white Ventara (Atual):** Estética clara e sofisticada com fundo `#FAF8F4`, cards brancos e tipografia azul-marinho.
- **Escuro Ventara (Clássico):** Estética noturna clássica com fundo `#02070D` e superfícies escuras.
- **Reset:** Restaura as configurações originais do sistema.

### 3.2. Auditoria WCAG 2.1 em Tempo Real
O sistema calcula continuamente a taxa de contraste do texto principal com o fundo da página:
- Se o contraste for superior a **4.5:1**, a badge exibirá **Aprovado (AA)** ou **Excelente (AAA)**.
- Se o contraste for inferior a **4.5:1**, o botão de **Publicar será bloqueado compulsoriamente**, protegendo a marca contra problemas de acessibilidade e legibilidade.

### 3.3. Personalização de Cores
Você pode ajustar individualmente cada cor clicando no seletor ou digitando o código hexadecimal:
- Fundo da Página (ex: `#FAF8F4`)
- Fundo de Seções Alternadas (ex: `#F3F0E9`)
- Superfície dos Cards (ex: `#FFFFFF`)
- Borda dos Cards (ex: `#E8E3D8`)
- Texto Principal (ex: `#06111F`)
- Texto Secundário (ex: `#4A5875`)
- Amarelo da Marca (ex: `#FFD62E` — preenchimentos)
- Âmbar de Destaque (ex: `#9A6700` — textos e ícones com contraste aprovado)

---

## 4. Gestão de Conteúdo e Seções

As seções aparecem organizadas na **mesma ordem visual** da página pública:

1. **Cabeçalho / Hero**
2. **Destaques / Benefícios Rápidos**
3. **Entrega Regional Araçatuba e Região**
4. **Prazo Estimado**
5. **Envio Seguro para Todo o Brasil**
6. **Transportadoras Parceiras**
7. **Passo a Passo do Envio (Linha do Tempo)**
8. **Perguntas Frequentes (FAQ)**
9. **CTA Final / WhatsApp**

### 4.1. Reordenação e Visibilidade
- **Setas ↑ e ↓:** Movem o bloco para cima ou para baixo na página. A nova ordem é salva automaticamente.
- **Botão Ativa/Oculta:** Oculta temporariamente uma seção inteira da página pública sem apagar seu conteúdo.

### 4.2. Upload e Gestão de Imagens
Cada bloco com foto possui controles completos:
- **Formatos aceitos:** JPG, PNG ou WebP até **5 MB**.
- **Texto Alternativo (Alt):** Campo **obrigatório**. Descreva sucintamente a imagem para leitores de tela e Google.
- **Enquadramento (Ponto Focal):** Permite escolher o alinhamento da imagem (`Centro`, `Topo`, `Base`, `Esquerda`, `Direita`) para que o elemento principal nunca seja cortado no celular.
- **Gradiente de Integração:** Ajusta a intensidade da fusão suave da imagem com a cor do cartão.
- **Aviso de Duplicidade:** O CMS alerta automaticamente caso a mesma foto já esteja sendo utilizada em outro cartão, estimulando a variedade visual.

### 4.3. Cartões de Envio Nacional (Correios, Transportadoras, Aéreo)
No acordeão **Envio Seguro para Todo o Brasil**:
1. Clique na aba da modalidade desejada: *Correios*, *Transportadoras Rodoviárias* ou *Envio Aéreo*.
2. Faça o upload da foto temática (ex: van amarela dos Correios, caminhão de carga, avião cargueiro).
3. Preencha o texto alternativo (Alt), selo translúcido sobreposto e legenda opcional.
4. Ajuste prazos e descrições conforme a estratégia logística.

---

## 5. Fluxo de Publicação e Restauração

1. Faça as edições desejadas no painel.
2. Clique em **Pré-visualizar** para inspecionar o resultado no navegador.
3. Clique em **Publicar**:
   - Uma janela será aberta solicitando o **Rótulo da Versão** (ex: *"Nova foto do frete aéreo"*) e um breve **Resumo das Modificações**.
   - O sistema valida a taxa de contraste e, estando em conformidade, grava no ar.
   - O cache do Next.js é purgado instantaneamente.
4. Se precisar voltar a uma versão anterior:
   - Clique em **Histórico**.
   - Localize o snapshot desejado.
   - Clique em **Restaurar como Rascunho**.
   - Revise e publique novamente.
