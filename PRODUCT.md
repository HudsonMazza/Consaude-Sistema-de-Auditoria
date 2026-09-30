# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Auditores financeiros de clínicas executam comparações entre relatórios de produção e repasse. Administradores também acompanham os registros da clínica e gerenciam contas.

## Product Purpose

ConSaúde recebe dois relatórios financeiros, compara seus dados e identifica divergências. Sucesso é um auditor iniciar, revisar, retomar e exportar uma auditoria sem dúvida sobre onde cada ação está.

## Positioning

Auditoria financeira de produção versus repasse, com divergências, revisão por médico e relatórios exportáveis em um fluxo único.

## Operating Context

Auditor envia arquivos XLSX, XLS ou CSV de produção e repasse; define referência; revisa divergências; gera relatório; consulta registros persistidos no Firestore.

## Capabilities and Constraints

Aplicação React/Vite. Firebase Auth e Firestore. Usuário comum acessa suas auditorias; administrador pode acessar auditorias da clínica. Auditorias armazenam resultado, responsável, data e relatório IA opcional. Não há rascunho persistido confirmado no produto atual.

## Brand Commitments

ConSaúde. Produto de auditoria financeira em saúde. Logotipo em `public/logo.svg` e `public/logo.png`.

## Evidence on Hand

Fluxo atual e implementação em `auditoria-medica.jsx`; histórico e permissões em `src/audits.js` e `firestore.rules`. Não há pesquisa de usuários ou métricas de uso no repositório.

## Product Principles

- Nome da navegação descreve ação ou conteúdo real.
- Uma auditoria tem ciclo único: iniciar, revisar, concluir e consultar.
- Registros pessoais ficam fáceis de achar; escopo da clínica é explícito para administradores.
- Dados financeiros, estado e responsável aparecem antes de ações secundárias.
