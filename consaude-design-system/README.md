ConSaúde é um SaaS de auditoria financeira de produção médica: o auditor envia **Produção × Repasse**, o sistema cruza as planilhas e aponta divergências por médico e por paciente. A interface é **escura por padrão, densa em dados e calma** — carvão grafite com um único azul de marca (o *Primary Blue* da referência Finora), cards arredondados, números tabulares e cor semântica só onde há significado. Deve parecer uma ferramenta confiável para lidar com dinheiro, não um template.

## Como usar este sistema

- Carregue `tokens.css` (cores, espaços, raios, sombras, tamanhos, estilos de texto e a fonte Inter), depois `components/bundle.css`, React 18 e `components/bundle.js`, que expõe `window.ConSaude`.
- O tema é o atributo `data-theme` em `<html>`: `dark` (padrão, primeiro tema) ou `light`. Os dois usam os mesmos nomes de token — nunca escreva hex no código de tela.
- Monte toda página dentro de `AppShell`: ele mede a própria largura e troca sozinho entre sidebar completa (≥ 1280px), trilho de ícones (768–1279px) e top app bar + `BottomNav` (< 768px). As telas de referência em `ConSaude.screens` mostram cada composição.
- Classes CSS usam o prefixo `cs-` e funcionam sem React (`cs-btn cs-btn--primary`, `cs-card`, `cs-badge cs-badge--warning`…). Os componentes React são a forma recomendada porque já trazem teclado, ARIA e o comportamento mobile.

## Conteúdo e voz

- Português do Brasil, tratamento por **você**, frases curtas e diretas. Sem emojis, sem exclamações, sem jargão de TI.
- **Caixa de frase** em tudo: "Nova auditoria", "Relatório IA", "Salvar configurações" — nunca "Nova Auditoria".
- Botões dizem a ação com verbo: "Processar auditoria", "Exportar", "Marcar como revisado", "Enviar convite". Links de navegação podem ser substantivos: "Ver todas", "Abrir".
- Erros dizem o que houve e o que fazer: "Formato não suportado (.pdf). Envie .xlsx, .xls ou .csv." / "CNPJ inválido. Confira os 14 dígitos."
- Destrutivos nomeiam o objeto e a perda: "Excluir a auditoria Setembro/2026?" + "Os 37 itens divergentes, os status de revisão e o relatório IA serão apagados."
- Vocabulário fixo do domínio: **Produção**, **Repasse**, **Diferença** (= Repasse − Produção), **divergência** (um item), **Repasse maior** / **Produção maior** (direção), **Pendente → Revisado → Corrigido** (status de revisão), **Conforme**.
- Dinheiro sempre `R$ 38.521,16` (`formatBRL`); diferenças com sinal `+R$ 1.732,40` / `−R$ 2.130,00`. Datas `26/09/2026`, hora `14:32` em linha secundária. Contagens com separador de milhar (`1.284 linhas`).
- Nomes de médicos e pacientes chegam em CAIXA ALTA das planilhas: exiba em caixa de título com `titleCase` ("Ricardo Alves Pereira", partículas "de/da/do" em minúsculas) e mantenha o original no `title`.

## Fundamentos visuais

### Cor

- **Superfícies em camadas, não sombras**: `bg` (página e sidebar) → `surface` (cards, tabelas, painéis) → `surface-2` (tiles e blocos dentro de card, cabeçalho de tabela) → `surface-3` (hover, linha selecionada). Separe com `line` (hairline decorativa); bordas de controle usam `line-strong` (≥ 3:1).
- Texto: `ink` para conteúdo e valores, `ink-2` para rótulos e subtítulos, `ink-3` para metadados e placeholders. Todos passam AA sobre `bg`, `surface`, `surface-2` e `surface-3` nos dois temas.
- **Azul com parcimônia**: `accent-fill` (com `on-accent`) só para a ação primária de cada área, o item de navegação ativo e o card herói de KPI. `accent` pinta formas (barras, segmentos, sublinhado da aba ativa); `accent-text` é o azul de texto (links, aba ativa); `accent-soft` tinge fundos (chip ativo, Revisado, drag-over). `soft-blue` e `accent-deep` existem só dentro do card herói.
- Semânticas com significado fixo e **sempre com ícone + palavra**: `success` (Conforme, Corrigido, Ativo, ícone do Excel), `warning` (Pendente, Senha pendente), `danger` (divergência, erro, destrutivo), `ia` (tudo que a IA gera — sempre com o ícone *sparkles* e a palavra "IA"), `info` (= `accent-text`). Cada uma tem o par `*-soft` para fundos.
- **Direção do desvio não é erro**: `dir-rep` (laranja, ↗ "Repasse maior", pago a mais) e `dir-prod` (azul, ↙ "Produção maior", pago a menos), sempre via `DirectionTag`/`DiffValue`. Nunca use vermelho/verde para direção.
- Gráficos usam só `chart-1` (azul), `chart-2` (Soft Blue, rampa ordinal com o azul) e `chart-3` (laranja); `chart-track` para trilhos e hachuras, `chart-grid` para grade. A paleta foi validada para daltonismo nos dois temas.

### Tipografia

- Uma família: **Inter** (variável, 400/500/600), a mesma da referência. `text-page-title` 24/32 para o título da página (20/28 no mobile), `text-section-title` 16/24 para títulos de card, `text-body` 14/20 para quase tudo, `text-small` 13/18 para segundas linhas, `text-label` 12/16 para rótulos de KPI, cabeçalhos de tabela e badges, `text-overline` 11/16 em caixa alta para grupos da sidebar.
- Números: `text-kpi-hero` 32/40 **uma vez por tela**, `text-kpi` 22/28 nos tiles, `text-num` 14/20 em tabelas. Todo número em coluna usa `font-variant-numeric: tabular-nums` (classe `cs-num`) e alinha à direita.
- Pesos: 600 para títulos e valores, 500 para rótulos e botões, 400 para texto. Nada abaixo de 11px.

### Espaço, grid e layout

- Base de 4px (`space-1`…`space-12`). Padding de card `space-5` no desktop e `space-4` no mobile; gutter `space-6`; margem lateral `space-8` (desktop), `space-6` (tablet), `space-4` (mobile).
- Grid de 12 colunas (`cs-grid`, `cs-span-*`), conteúdo até `content-max` (1600px). No tablet (768–1279) os blocos passam a metades (`cs-md-6`) ou linha cheia (`cs-md-12`); no mobile, uma coluna.
- Breakpoints: `bp-md` 768 (tabelas voltam a ser tabelas, sidebar em trilho), `bp-xl` 1280 (sidebar expandida), `bp-2xl` 1536 (colunas de prioridade 3 visíveis). Componentes de dados decidem pela **largura do próprio container**, não da janela.
- Hierarquia de indicadores: cada tela tem **um** `HeroKpi` (o número que responde "quanto dinheiro está em jogo"), KPIs secundários agrupados em um card (`KpiGroup`) e, nas telas de lista, só uma `StatStrip` compacta.

### Forma, borda, elevação

- Raios: `radius-lg` 14px em cards, tabelas e dropzones; `radius-md` 10px em inputs e tiles; `radius-sm` 6px em itens de nav e menu; `radius-full` em botões de texto, badges, chips, segmentos do medidor e avatares; `radius-xl` 20px em modais e no topo do bottom sheet.
- O tema escuro é quase plano: `shadow-card` é uma hairline. Sombra só no que flutua (`shadow-pop` para menus e toasts, `shadow-overlay` para drawer, modal e sheet). `shadow-glow` — o brilho azul da referência — no máximo uma vez por tela (dropzone em drag-over, card em destaque).
- Foco de teclado: `focus-ring` em todo controle (2px da cor do fundo + 2px sólidos de `accent-text`, ≥ 4.8:1 sobre qualquer superfície).

### Movimento

- `duration-fast` 120ms para hover e cor, `duration-base` 200ms para menus, abas e accordion, `duration-slow` 320ms para drawer, sheet e modal, com `ease-standard`. Sem animação decorativa; `prefers-reduced-motion` desliga tudo. A única animação contínua é o orbe e o spinner da geração por IA.

### Gráficos

- Colunas empilhadas com no máximo 36px de largura, 2px de respiro entre segmentos, ponta arredondada de 4px; período em andamento com hachura `chart-track`. Donut só para 2–4 partes, com total no centro.
- Todo gráfico tem legenda (≥ 2 séries), tooltip em hover **e** foco de teclado, e alternância para tabela. Texto de gráfico usa tokens de texto, nunca a cor da série.

## Iconografia

- **Lucide** (ISC), traço 1.75, 20px padrão (16px em badges e botões pequenos, 22px na bottom nav), sempre `currentColor` via `Icon`. Ícones são decorativos quando há texto ao lado; ícone sozinho exige `label` (ou `IconButton`, que exige `label`).
- Significados fixos: `sparkles` = IA · `file-spreadsheet` = Excel (em `success`) · `file-text` = PDF · `arrow-up-right` = Repasse maior · `arrow-down-left` = Produção maior · `clock` = Pendente · `eye` = Revisado · `circle-check` = Conforme/Corrigido/Ativo · `triangle-alert` = divergência · `key-round` = senha · `shield-check` = Administrador · `cloud-upload` = enviar arquivo · `ellipsis` = mais ações.
- **Logo**: o ConSaúde ainda não tem marca. A sidebar usa o nome em Inter ("Con" em `ink`, "Saúde" em `accent-text`) e um quadrado `accent-fill` com o ícone `activity` apenas como marcador provisório — substitua pelo logo oficial quando existir, sem recriar um desenho a partir deste placeholder.

## Acessibilidade

- Contraste AA em todos os pares texto/fundo dos dois temas (valores nas notas de cada token). Cor nunca é o único indicador: status, resultado, direção e séries de gráfico sempre carregam ícone e/ou palavra.
- Alvos de toque ≥ 44px no mobile (`control-lg`); botões pequenos ganham área de toque invisível. Inputs no mobile usam 16px para evitar zoom no iOS.
- Teclado: abas com ←/→, menus com ↑/↓/Home/End/Esc, overlays prendem o foco e devolvem ao gatilho, gráficos focáveis por coluna, linhas de tabela com ação explícita (não só clique na linha).
- Semântica: `aria-current="page"` na navegação, `aria-sort` em colunas ordenáveis, `role="progressbar"`/`"meter"` com valor em texto, toasts de erro com `role="alert"`, progresso da IA anunciado por `aria-live`.

## Componentes

Os componentes seguem a lista do produto (navegação, ações, filtros e campos, indicadores, dados, gráficos, upload, sobreposições e feedback). Cada um tem um README com o que o consumidor fornece e quando usar, e uma prévia viva. Em **Telas** estão Dashboard, Auditorias, Nova auditoria, Relatório (com detalhe do médico e geração por IA), Usuários e Configurações em desktop, tablet e mobile — todas montadas só com estes componentes.
