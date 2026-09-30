// O antigo monolito foi dividido durante o redesign (veja REDESIGN-RESUMO.md):
//   src/App.jsx            — estado e fluxo do app
//   src/pages/*            — telas
//   src/components/ds/*    — design system
//   src/lib/*              — parsing, comparação, exportações, relatório IA
// Este arquivo só reexporta o App e detectColumns para compatibilidade com imports antigos.
export { default } from "./src/App.jsx";
export { detectColumns } from "./src/lib/engine.js";
