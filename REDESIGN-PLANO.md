# Plano do redesign — ConSaúde × design system

## Stack detectada
- Vite 5 + React 18, sem roteador (navegação por estado `activePage` no `App`), sem Tailwind/shadcn/CSS Modules.
- Estilo atual: objetos de tema `t` (navy/laranja), CSS em strings (`UI_CSS`, `INTERFACE_CSS`, `USER_MANAGEMENT_CSS`) e fonte DM Sans do Google Fonts.
- Ícones: SVGs inline próprios (`ICONS`). Gráficos: barras em `div` (sem lib). Firebase Auth/Firestore em `src/auth.js`, `src/audits.js`; métricas em `src/dashboard.js`; export com `xlsx`, `jspdf`, `jspdf-autotable`.
- Testes: `node --test tests/dashboard.test.js` (node:test). Linha de base: build ok, 3/3 testes ok. Não há lint nem typecheck configurados.

## Estratégia de tokens
- `consaude-design-system/tokens.css` copiado para `src/styles/tokens.css` (fonte Inter em `src/styles/fonts/`), única origem de cor/espaço/raio/sombra.
- `components/bundle.css` copiado para `src/styles/components.css` sem os blocos "Demo helpers" e "Device frames (previews only)" (únicos com hex).
- `src/styles/app.css` só com composições do app (telas de autenticação etc.), usando apenas `var(--…)`.
- Tema no `<html data-theme>`: `dark` padrão, persistido em `localStorage['cs-theme']`, aplicado antes do primeiro paint (script inline no `index.html` + `src/lib/theme.js`).

## Componentes
- Referência `components/src/*.jsx` portada para `src/components/ds/` (ES modules com `import React`), mantendo classes `cs-`, teclado, ARIA e comportamento mobile. Ajustes: `Topbar` sem busca global (proposta), `AccountMenu` com ações reais, `Brand` isolado em `Brand.jsx`, `Dropzone` com "Trocar"/"Remover" funcionais e slot para erros, `SheetSelect` (chip → bottom sheet) para filtros no mobile.
- Helpers `formatBRL`, `formatNumber`, `titleCase`, `initials` em `src/components/ds/core.jsx`.

## Quebra do monolito (sem mudar comportamento)
- `src/lib/engine.js` — parsing, detecção de colunas, validação, comparação, insights (código movido literalmente).
- `src/lib/exporters.js` — Excel e PDF (conteúdo intacto).
- `src/lib/aiReport.js` — prompt OpenAI + HTML do relatório IA (conteúdo intacto).
- `src/lib/clinicSettings.js`, `src/lib/format.js` (datas, foto), `src/lib/theme.js`.
- `src/App.jsx` — estado e handlers do `App` movidos sem alteração de lógica; renderiza `AppLayout` + páginas.
- `src/pages/` — Login, Esqueci a senha, Troca obrigatória, Setup do Firebase, Dashboard, Auditorias (lista), Nova auditoria, Processando, Relatório (+ drawer do médico), Usuários, Perfil, Configurações.
- `auditoria-medica.jsx` vira um shim que reexporta `App` (compatibilidade).

## Ordem
1. Fundação (tokens, fonte, tema, reset, helpers) → 2. Primitivos → 3. Shell → 4. Dados e overlays → 5. Extração da lógica para `src/lib` → 6. Telas: Dashboard, Auditorias, Nova auditoria + Processando, Relatório + drawer + IA, Usuários, Configurações, Perfil e telas de autenticação → 7. Troca do App, limpeza → 8. Harness `dev-preview.html` (fora do bundle) + screenshots Playwright 1440/1024/390 × dark/light → correções → resumo.

## Riscos
- Monolito grande: risco de regressão ao mover. Mitigação: mover funções de lógica literalmente, manter nomes/assinaturas e rodar build + testes a cada etapa.
- Dados que o design pede e não existem (contagem por status nas auditorias, série mensal por resultado, delta vs. período anterior, escopo, colunas extras): escondidos e registrados em `REDESIGN-PENDENCIAS.md`.
- Sem Firebase real no ambiente: validação visual via harness com dados fictícios.
