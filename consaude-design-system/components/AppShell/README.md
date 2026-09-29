# AppShell

Estrutura de toda página: sidebar, topbar, conteúdo e bottom nav, com o layout escolhido pela largura medida do próprio shell.

**Você fornece**: `active` (id do item de nav: `dashboard`, `auditorias`, `usuarios`, `configuracoes`), `onNavigate(id)`, `crumbs` (`[{ label, href }]`, o último é a página atual), `title` e `back` (`{ label, onClick }`) para o app bar mobile em páginas de detalhe, `onNewAudit`, `children` (a página, normalmente `PageHeader` + `cs-grid`).

- < 768px: `data-layout="compact"`, sidebar some, top app bar de 56px e `BottomNav`.
- 768–1279px: sidebar em trilho (`data-nav="rail"`). ≥ 1280px: sidebar completa, recolhível pelo usuário ("Recolher").
- Fornece o contexto de viewport (`useViewport()`) que os componentes usam para virar sheet, cards ou tela cheia.
- Use o grid `cs-grid` + `cs-span-N` (12 colunas) e `cs-md-6`/`cs-md-12` para o tablet.
