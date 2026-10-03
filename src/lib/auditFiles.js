// Arquivos originais de cada auditoria: utilitários puros (sem Firebase) para guardar e baixar o arquivo exatamente
// como foi enviado. O Firestore limita cada documento a ~1 MiB, então o conteúdo (base64) é dividido em partes.

/** Tamanho de cada parte em caracteres base64. Múltiplo de 4: cada parte decodifica sozinha. */
export const PARTE_BASE64 = 700_000;
/** Teto por arquivo (bytes). Acima disso a auditoria roda normalmente, mas o arquivo não é guardado. */
export const ARQUIVO_MAX_BYTES = 8 * 1024 * 1024;

/** Identificador de cada arquivo dentro da auditoria → rótulo exibido. */
export const ARQUIVOS_AUDITORIA = { prod: "Relatório de Produção", rep: "Relatório de Repasse" };

export function bytesParaBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function base64ParaBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Divide o base64 em partes de até `tamanho` caracteres (ordem preservada). */
export function dividirEmPartes(b64, tamanho = PARTE_BASE64) {
  const partes = [];
  for (let i = 0; i < b64.length; i += tamanho) partes.push(b64.slice(i, i + tamanho));
  return partes.length ? partes : [""];
}

/** Junta as partes (já em ordem) de volta nos bytes originais. */
export function juntarPartes(partes) {
  const blocos = partes.map(base64ParaBytes);
  const out = new Uint8Array(blocos.reduce((n, b) => n + b.length, 0));
  let pos = 0;
  for (const b of blocos) { out.set(b, pos); pos += b.length; }
  return out;
}

/** SHA-256 em hexadecimal, para conferir na hora do download que o arquivo é idêntico ao enviado. `null` se indisponível. */
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

/** Dispara o download de bytes no navegador com o nome original do arquivo. */
export function baixarBytes(bytes, nome, tipo) {
  const url = URL.createObjectURL(new Blob([bytes], { type: tipo || "application/octet-stream" }));
  const a = document.createElement("a");
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
