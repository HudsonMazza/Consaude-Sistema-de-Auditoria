# Resumo do redesign — ConSaúde

Todo o front-end passou para o novo design system (tokens + componentes `cs-` portados para React). Telas, dados, ações e fluxos são os mesmos; parsing, comparação, cálculos, exportações (Excel/PDF/HTML da IA), chamadas Firebase e permissões não mudaram (código movido literalmente para `src/lib/` e `src/App.jsx`).

## Estrutura nova
- `src/styles/tokens.css` (cópia do DS, fonte Inter local), `components.css` (bundle.css do DS sem os blocos de prévia), `app.css` (composições do app, só `var(--…)`).
- `src/components/ds/` — Button, IconButton, Badge/StatusBadge/ResultBadge/ProfileBadge, DirectionTag, DiffValue, Avatar, Icon (Lucide 1.75), campos, FilterChips, SelectChip, **SheetSelect**, SegmentedControl, Tabs, Accordion, Callout, EmptyState/ErrorState, Dropzone, UploadProgress, Card, HeroKpi, KpiGroup/KpiCard, StatStrip, SegmentedMeter, ProgressBar, BarChart, DonutChart, Legend, RankingList, DataTable (tabela ↔ cards por largura do container, ordenação controlável), Pagination, Modal, ConfirmDialog, AiProgressModal, Drawer, BottomSheet, ActionMenu, Toast, AppShell, Sidebar (trilho + Recolher lembrado), Topbar, BottomNav, PageHeader, ActionBar, SettingsSection, ThemeToggle, AccountMenu, **Brand** (placeholder único).
- `src/components/AppLayout.jsx` (navegação por papel), `Toaster.jsx` (pilha única de toasts).
- `src/pages/` — auth (Login, Esqueci a senha, Troca obrigatória, Setup do Firebase, carregando), Dashboard, Auditorias (lista + nova), Processando, Relatório (+ drawer do médico + modal IA), Usuários, Perfil, Configurações.
- `src/lib/` — engine, exporters, aiReport, clinicSettings, photo (movidos do monolito), theme, display (derivações de exibição).
- `auditoria-medica.jsx` virou shim que reexporta `App` e `detectColumns`.
- Tema: `data-theme` no `<html>`, escuro padrão, salvo em `localStorage['cs-theme']`, aplicado antes do primeiro paint.

## O que mudou por tela
- **Login / Esqueci a senha / Troca obrigatória / Setup**: cartão central com marca, TextField com ícones, mostrar/ocultar senha, erros em Callout (`role="alert"`), botão com loading, alternância de tema.
- **Shell**: sidebar 248px com grupos, card "Nova auditoria" e Recolher; trilho de 76px entre 768–1279px; no mobile top app bar + bottom nav (Início, Auditorias, **Nova**, Usuários/Perfil, Ajustes). Menu da conta com Meu perfil, Configurações, tema e Sair. Link "Pular para o conteúdo".
- **Dashboard**: um HeroKpi (valor divergente do período), Resumo em KpiGroup, Taxa de conformidade (SegmentedMeter), Auditorias por mês em colunas empilhadas (com divergência × conformes, mês em andamento hachurado, tooltip em hover/foco, alternância Gráfico/Tabela), Direção dos desvios (donut, Repasse maior laranja ↗ / Produção maior azul ↙), Últimas auditorias (DataTable → cards), Maiores impactos (RankingList). Filtros período/escopo viram chips com bottom sheet no mobile. Carregando, vazio e erro com "Tentar novamente".
- **Auditorias › Minhas auditorias**: Tabs, StatStrip, busca, escopo (admin), FilterChips com contagem, "Exibindo X de Y", DataTable com prioridade de colunas (Arquivos/Auditor somem em tabelas estreitas), **uma** ação visível ("Abrir") e o resto no ⋯ (Exportar Excel, Ver relatório IA, Excluir por último), paginação, ConfirmDialog de exclusão. Mobile: cards + action sheet.
- **Auditorias › Nova auditoria**: UploadProgress "N de 2", dois Dropzones (arrastar/selecionar, trocar, remover, colunas reconhecidas, linhas lidas, erros por arquivo), referência, Accordion "Opções de comparação", card "Como funciona", ActionBar fixa com o motivo do bloqueio e "Processar auditoria".
- **Processando**: card com etapa atual, ProgressBar e as 6 etapas reais.
- **Relatório**: cabeçalho com referência + ResultBadge + metadados; Exportar (Excel/PDF), Relatório IA (sparkles + "IA"), ⋯ (Copiar resumo, Nova auditoria); no mobile: IA em largura total + ⋯ com tudo. HeroKpi, Resumo, Progresso da revisão, tabela de médicos (Diferença = Repasse − Produção com sinal, seta e palavra; nomes em title case com o original no `title`; status Pendente → Revisado → Corrigido pelo ⋯ ou pelo drawer), Análise inteligente com copiar.
- **Detalhe do médico**: Drawer 520px (tela cheia no mobile) com status, Produção/Repasse/Diferença, explicação da direção, tipos de divergência, itens por paciente com copiar e botão "Marcar como revisado/corrigido".
- **Gerando relatório IA**: AiProgressModal (progresso indeterminado, "Continuar em segundo plano"), toast ao concluir, erro em toast `role="alert"`.
- **Usuários e acessos**: StatStrip, busca, filtros com contagem, e-mail na segunda linha da célula com reticências, "Editar" visível e Redefinir senha/Desativar/Reativar no ⋯ (Desativar em vermelho, por último; oculto para a própria conta), modais de criar/editar (escolhas em cartão), redefinir senha e desativar. Mobile: cards; modal vira bottom sheet.
- **Meu perfil**: cartão de identidade (foto, papel, conta ativa, alterar/remover foto) + formulários de dados e senha.
- **Configurações**: SettingsSection (Identificação da clínica com CNPJ mascarado; Preferências com tolerância em R$ e formato em SegmentedControl), ActionBar "Salvar configurações".

## Verificação
- `npx vite build`: ok (só o aviso de chunk grande que já existia).
- `node --test tests/dashboard.test.js`: 3/3 passando.
- Harness `dev-preview.html` + `src/dev/` (dados fictícios, fora do bundle de produção — conferido no `dist/`).
- Playwright (Chromium local): 22 estados × 1440/1024/390 × escuro/claro = 132 capturas + 10 de interação em `/home/claude/consaude-shots/`. Sem scroll horizontal e sem erros de console em nenhuma. Teclado: menu abre com foco no 1º item, ↑/↓, Esc fecha e devolve o foco ao gatilho; diálogo prende o foco, Esc fecha e devolve o foco.
- Comparação com as prévias `components/Tela */preview.html` (renderizadas localmente): layout, hierarquia e componentes equivalentes; diferenças são os elementos sem dado listados em `REDESIGN-PENDENCIAS.md`.
- `grep -rE "#[0-9a-fA-F]{3,8}" src`: só em `src/styles/tokens.css` e no conteúdo exportado (`src/lib/aiReport.js`), como previsto. Sem `rgba()`/DM Sans/laranja antigo na UI.

Pendências e decisões para o seu OK: `REDESIGN-PENDENCIAS.md`.
