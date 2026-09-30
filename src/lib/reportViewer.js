// Abre um relatório IA (HTML) numa aba nova, isolado do app.
//
// O HTML salvo no histórico pode ser editado por qualquer dono da auditoria (a regra do
// Firestore só limita o tamanho). Aberto direto como blob:, ele rodaria com a origem do app
// e poderia usar a sessão de quem abriu (ex.: um admin). Aqui o relatório vai para um
// <iframe sandbox> sem allow-same-origin: os scripts do relatório funcionam (tema, imprimir,
// expandir), mas numa origem opaca, sem acesso ao app, ao Firebase nem à aba que abriu.

const escAttr = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function reportViewerHTML(html, title = "Relatório IA · ConSaúde") {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escAttr(title)}</title>
<style>html,body{margin:0;height:100%;background:#16171a}iframe{display:block;border:0;width:100%;height:100%}</style>
</head><body>
<iframe title="${escAttr(title)}" sandbox="allow-scripts allow-modals allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer" srcdoc="${escAttr(html)}"></iframe>
</body></html>`;
}

/** Abre o relatório numa aba nova, isolado do app. Retorna false se o navegador bloqueou a aba. */
export function openReport(html, { title } = {}) {
  const blob = new Blob([reportViewerHTML(html, title)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  // Sem "noopener" para saber se a aba abriu (com ele o navegador sempre devolve null);
  // o vínculo com esta aba é cortado logo em seguida.
  const win = window.open(url, "_blank");
  if (!win) return false;
  try { win.opener = null; } catch { /* já isolada */ }
  return true;
}
