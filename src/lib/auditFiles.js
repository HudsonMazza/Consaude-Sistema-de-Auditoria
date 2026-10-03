// Arquivos originais de cada auditoria: utilitários puros (sem Firebase). Os arquivos novos ficam no R2
// (src/lib/r2Upload.js); o código de partes em base64 abaixo só lê as cópias antigas guardadas no Firestore.

/** Teto por arquivo guardado (MB). Deve acompanhar `MAX_UPLOAD_SIZE_MB` do servidor (padrão 20). */
export const ARQUIVO_MAX_MB = 20;
export const ARQUIVO_MAX_BYTES = ARQUIVO_MAX_MB * 1024 * 1024;

/** Identificador de cada arquivo dentro da auditoria → rótulo exibido. */
export const ARQUIVOS_AUDITORIA = { prod: "Relatório de Produção", rep: "Relatório de Repasse" };

function base64ParaBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Junta as partes base64 (já em ordem) de uma cópia antiga do Firestore nos bytes originais. */
export function juntarPartes(partes) {
  const blocos = partes.map(base64ParaBytes);
  const out = new Uint8Array(blocos.reduce((n, b) => n + b.length, 0));
  let pos = 0;
  for (const b of blocos) { out.set(b, pos); pos += b.length; }
  return out;
}

/** SHA-256 em hexadecimal, para registrar o que foi enviado e conferir cópias antigas. `null` se indisponível. */
export async function sha256Hex(bytes) {
  try {
    if (!globalThis.crypto?.subtle) return null;
    const h = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
    return [...h].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch { return null; }
}

export function formatarTamanho(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} KB`;
  return `${(n / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

function clicar(href, nome) {
  const a = document.createElement("a");
  a.href = href;
  if (nome) a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
}

/** Dispara o download de bytes no navegador com o nome original do arquivo. */
export function baixarBytes(bytes, nome, tipo) {
  const url = URL.createObjectURL(new Blob([bytes], { type: tipo || "application/octet-stream" }));
  clicar(url, nome);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Baixa por uma URL assinada que já responde com Content-Disposition: attachment e o nome original. */
export function baixarPorUrl(url) {
  clicar(url);
}
