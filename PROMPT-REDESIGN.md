# Refatoração do front-end do ConSaúde com o novo design system

Você vai refatorar **todo o front-end** do ConSaúde (SaaS de auditoria financeira de produção médica) e implementar o novo design system. O visual muda por completo. **Telas, dados, ações e fluxos continuam os mesmos**, e nenhuma regra de negócio, chamada de API ou cálculo deve mudar.

> **Contexto deste repositório (já verificado):** Vite + React 18 + Firebase (Firestore/Auth), jsPDF, xlsx. Quase toda a UI está no arquivo monolítico `auditoria-medica.jsx` (~240 KB) + `src/` (`main.jsx`, `auth.js`, `firebase.js`, `dashboard.js`). Há `tests/` com Playwright. O design system **já está descompactado em `consaude-design-system/`** na raiz (use essa pasta onde o texto abaixo diz `design-system/`; ignore `consaude-design-system.zip` e não o commite).
>
> **Git:** você está na branch `historico-firestore` com várias alterações NÃO commitadas do Hudson (trabalho em andamento). Não descarte nada. Antes de começar: crie a branch `redesign/design-system` a partir do estado atual e faça um commit "WIP: estado antes do redesign" com essas alterações (sem `.env`, sem o zip). Depois, um commit por etapa. Não faça push.
>
> **Autonomia:** o Hudson está no celular. Não espere OK para o plano da seção 2 — escreva o plano em `REDESIGN-PLANO.md` e siga. Para as "propostas" da seção 5, implemente só se o dado já existir; caso contrário registre em `REDESIGN-PENDENCIAS.md`. Ao quebrar o monolito, extraia componentes para `src/components/ds/` e telas para `src/pages/`, sem mudar lógica de negócio. No fim, gere `REDESIGN-RESUMO.md` com o que foi feito.

---

## 1. Fonte da verdade: o design system

**Artifact (design system publicado):** https://claude.ai/artifact/6Egow23xUgjYNjNGeeJntr
Se você tiver a ferramenta Artifact, leia-o com `action: "read"`. Os arquivos ficam em `project/…`. Comece por `project/README.md` e depois leia `project/tokens.json`, `project/components/bundle.css`, `project/components/src/*.jsx` e `project/components/<Componente>/README.md`.

**Cópia local (use se não conseguir abrir o link):** o arquivo `consaude-design-system.zip`. Descompacte em `design-system/` na raiz do repositório. Ele contém:

| Arquivo | O que é |
| --- | --- |
| `README.md` | Guia de uso: voz, cores, tipografia, espaçamento, iconografia, acessibilidade. **Leia inteiro antes de começar.** |
| `01-diagnostico-e-arquitetura.md` | Problemas atuais → solução, mapa de navegação, fluxo, escalabilidade |
| `02-responsivo-e-mobile.md` | Breakpoints e a tradução de cada padrão desktop → mobile |
| `03-regras-de-dados.md` | Moeda, datas, nomes, direção do desvio, tabelas grandes, estados |
| `tokens.json` / `tokens.css` | Todos os tokens (tema `dark` padrão e `light`) já compilados em variáveis CSS |
| `fonts/Inter-Variable-latin.woff2` | Fonte Inter (400–600) |
| `components/bundle.css` | CSS de todos os componentes (prefixo `cs-`) |
| `components/src/*.jsx` | **Implementação de referência em React** (core, forms, data, overlays, layout, screens, icons, demo-data) |
| `components/index.d.ts` | Props de todos os componentes |
| `components/<Nome>/README.md` + `preview.html` | Guia e prévia de cada componente |
| `components/Tela */preview.html` | Telas de referência: Dashboard (desktop/tablet/mobile), Auditorias, Nova auditoria, Relatório (+ detalhe do médico, + IA), Usuários, Configurações, mobile |

A referência em `components/src/` é a especificação executável. **Porte-a para a stack do projeto**, sem copiar o bundle compilado. A implementação precisa reproduzir o visual e o comportamento das prévias.

---

## 2. Antes de escrever código (obrigatório)

1. **Mapeie o repositório**: framework, roteamento, estilização (Tailwind? CSS Modules? styled-components? shadcn/ui?), gerenciamento de estado, lib de ícones, lib de gráficos e onde vivem as páginas e os componentes.
2. **Inventarie as telas e os componentes atuais** e ligue cada um ao componente do design system que o substitui (tabela abaixo).
3. **Rode o projeto e os testes** para ter uma linha de base, e anote o que já quebra antes de você mexer.
4. **Me apresente um plano curto** com a stack detectada, a estratégia de tokens, a ordem das telas e os riscos. Espere meu OK antes de começar a fase 2.

---

## 3. Estratégia de implementação

**Tokens**
- Use as variáveis CSS de `tokens.css` como fonte única e troque o tema pelo atributo `data-theme="dark|light"` no `<html>`. O tema padrão é `dark` e a escolha fica persistida.
- Se o projeto usa Tailwind: mapeie os tokens no `tailwind.config` (`colors: { bg: 'var(--bg)', surface: 'var(--surface)', … }`, spacing, borderRadius, boxShadow, fontFamily), sem valores hex soltos.
- Se o projeto usa shadcn/ui: remapeie as variáveis do shadcn (`--background`, `--card`, `--primary`, `--border`, `--ring`…) para os tokens do sistema. Não mantenha duas paletas.
- Remova do código a paleta antiga: navy, acento laranja e fonte geométrica. **Nenhum hex fora dos tokens.** Faça um grep no final para confirmar.

**Componentes**
- Crie uma pasta de UI do design system (ex.: `src/components/ds/`) com os componentes abaixo, na stack do projeto.
- Os componentes de dados decidem o layout pela **largura do próprio container** (ResizeObserver). O `AppShell` mede a si mesmo e fornece `useViewport()`: `< 768` compacto, `768–1279` sidebar em trilho, `≥ 1280` sidebar completa.
- Sobreposições (Drawer, Modal, Sheet, Menu, Toast) são renderizadas via portal, prendem o foco, fecham com Esc e devolvem o foco ao gatilho.
- Ícones: Lucide (`lucide-react` se já estiver no projeto), traço 1.75 e 20px.

| Do sistema | Substitui / serve para |
| --- | --- |
| `AppShell`, `Sidebar`, `Topbar`, `BottomNav`, `PageHeader`, `Tabs` | Layout global, navegação, breadcrumb, tema, conta |
| `Button`, `IconButton`, `ActionMenu` | Todos os botões; ações por linha (1 visível + ⋯) |
| `FilterChips`, `SelectChip`, `SegmentedControl`, `TextField`, `MaskedField` (CNPJ), `CurrencyField`, `SearchField`, `Select`, `Checkbox`, `Switch` | Filtros e formulários |
| `HeroKpi`, `KpiCard` + `KpiGroup`, `StatStrip`, `SegmentedMeter`, `ProgressBar` | KPIs com hierarquia (1 herói por tela) |
| `Card`, `DataTable` (+ cards no mobile), `Pagination`, `Badge`, `StatusBadge`, `ResultBadge`, `ProfileBadge`, `DirectionTag`, `DiffValue`, `Avatar`, `RankingList` | Tabelas e listas |
| `BarChart`, `DonutChart`, `Legend` | "Auditorias por mês", "Direção dos desvios" |
| `Dropzone`, `UploadProgress`, `Accordion` | Nova auditoria |
| `Drawer`, `BottomSheet`, `Modal`, `ConfirmDialog`, `AiProgressModal` | Detalhe do médico, exclusão, geração de relatório IA |
| `Toast`, `Callout`, `EmptyState`, `ErrorState`, skeleton | Feedback e estados |
| Helpers `formatBRL`, `formatNumber`, `titleCase`, `initials` | Formatação pt-BR (use em **todo** valor exibido) |

Se o projeto já tiver uma lib de gráficos (Recharts etc.), pode usá-la, desde que siga as especificações: colunas empilhadas `chart-1`/`chart-2`, no máximo 36px, 2px de respiro entre segmentos, mês em andamento hachurado, tooltip em hover **e** foco, e alternância para tabela.

---

## 4. Ordem de trabalho (faça commits por etapa)

1. **Fundação**: tokens, fonte, tema claro/escuro, reset, `formatBRL` e helpers.
2. **Primitivos**: Button, IconButton, Badge family, Icon, Avatar, campos, chips, segmented, tabs.
3. **Shell**: AppShell, Sidebar (com trilho e "Recolher"), Topbar, BottomNav, PageHeader.
4. **Dados e overlays**: Card, KPIs, DataTable (tabela ↔ cards), Pagination, ActionMenu, Drawer, Modal, Sheet, Toast, gráficos.
5. **Telas**, uma por vez, comparando com a prévia correspondente:
   1. Dashboard
   2. Auditorias › Minhas auditorias
   3. Auditorias › Nova auditoria (upload → comparação → processar)
   4. Relatório de auditoria + detalhe do médico + gerando relatório IA
   5. Usuários e acessos
   6. Configurações
6. **Limpeza**: remova componentes, CSS e dependências antigos que ficaram sem uso.

---

## 5. Regras que não podem quebrar

**Dados e conteúdo**
- Moeda `R$ 38.521,16`. Diferenças sempre com sinal (`+R$ 1.732,40` / `−R$ 2.130,00`), alinhadas à direita e com números tabulares (`font-variant-numeric: tabular-nums`). Valor vazio vira `—`.
- **Diferença = Repasse − Produção.** Positivo = "Repasse maior" (↗, laranja `dir-rep`). Negativo = "Produção maior" (↙, azul `dir-prod`). Sempre com seta + palavra, **nunca** em vermelho/verde.
- Nomes de médicos e pacientes chegam em CAIXA ALTA: exiba com `titleCase` e guarde o original no `title`.
- Datas `dd/mm/aaaa`, com a hora em linha secundária. Texto em pt-BR, caixa de frase ("Nova auditoria").

**Hierarquia e ações**
- Um `HeroKpi` por tela. As telas de lista usam `StatStrip`, e não cards grandes de KPI.
- Nas tabelas, **uma** ação visível por linha ("Abrir", "Detalhar" ou "Editar"). O resto (Excel, PDF, Relatório IA, Excluir) vai no menu ⋯, com Excluir por último. A cor semântica fica só no ícone.
- E-mail do usuário na segunda linha da célula "Usuário", com reticências (corrige a quebra letra a letra).
- Azul preenchido (`accent-fill`) só na ação primária, na nav ativa e no card herói. IA sempre com o ícone *sparkles* e a palavra "IA" (`ia`/`ia-soft`).

**Responsivo**
- **Nenhuma funcionalidade some no mobile.** Siga a tabela de `02-responsivo-e-mobile.md`:
  - tabela → cards;
  - ações → action sheet;
  - drawer → tela cheia;
  - modal → bottom sheet;
  - filtros → chips com scroll;
  - KPIs → 2×2;
  - barra de ações → primária + ⋯;
  - bottom nav com "Nova" no centro.

**Acessibilidade**
- AA nos dois temas e foco visível (`--focus-ring`).
- Alvos de toque ≥ 44px no mobile e inputs com 16px no mobile.
- Navegação por teclado completa.
- `aria-current`, `aria-sort`, `aria-expanded`, `role="alert"` nos erros, e `prefers-reduced-motion` respeitado.

**Estados**
- Toda lista e ação tem loading (skeleton), vazio, sem resultados ("Limpar filtros"), erro ("Tentar novamente"), sucesso (toast) e confirmação destrutiva.

**Escopo**
- Não altere contratos de API, modelos de dados, cálculos de divergência, autenticação nem permissões. Se algo do design depender de um dado que não existe (ex.: "colunas reconhecidas" após o upload, contagens por status), **use o dado se já existir; se não existir, esconda o elemento e me avise**. Não invente dado.

**Propostas do design system (confirme comigo antes)**
- Busca global na topbar (atalho `/`).
- Perfil "Gestor".
- "Colunas reconhecidas" no upload.
- Medidor "Progresso da revisão" no relatório.

**Logo**
- Não existe logo. Use o placeholder do sistema (nome "Con**Saúde**" + quadrado azul com o ícone `activity`) em um único componente `Brand`, para trocar depois.

---

## 6. Verificação (antes de dizer que terminou)

- Rode o build, o lint, os testes e o typecheck, e corrija o que você quebrou.
- Abra cada tela em **1440px, 1024px e 390px**, nos temas **escuro e claro**, e compare com as prévias em `components/Tela */preview.html`. Tire screenshots (Playwright, se disponível) e me mostre.
- Confira:
  - sem scroll horizontal em nenhuma largura;
  - ações das linhas sempre alcançáveis;
  - teclado funciona em menus, drawer e modal;
  - números alinhados à direita;
  - nenhum hex fora dos tokens (`grep -rE "#[0-9a-fA-F]{3,8}" src`, exceto os arquivos de tokens).
- Me entregue um resumo com o que mudou por tela, o que ficou pendente, os dados que faltaram para algum elemento e as decisões que precisam do meu OK.
