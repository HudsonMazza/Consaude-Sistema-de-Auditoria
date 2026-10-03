// Cliente das APIs /api/files/*: guarda e baixa os arquivos originais de cada auditoria no bucket privado R2.
// O navegador nunca vê credenciais: envia direto ao R2 por uma URL PUT assinada de 5 minutos, gerada pela API
// depois de validar a sessão. O ID token vem de `getIdToken` (Firebase Auth).

async function post(path, token, body) {
  let response;
  try {
    response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  } catch {
    throw Object.assign(new Error("Sem conexão com o servidor."), { code: "network" });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || "Não foi possível concluir a operação com o arquivo."), { code: data.code || "error", status: response.status });
  return data;
}

async function tokenDe(getIdToken) {
  const token = await getIdToken?.();
  if (!token) throw Object.assign(new Error("Faça login para acessar os arquivos."), { code: "auth" });
  return token;
}

/**
 * Envia o arquivo original (sem nenhuma alteração) de uma auditoria já salva. `kind`: "prod" | "rep".
 * Só confirma depois que a API conferiu o objeto no bucket.
 */
export async function enviarArquivoAuditoria({ auditId, kind, file, sha256, getIdToken }) {
  const token = await tokenDe(getIdToken);
  const signed = await post("/api/files/sign-upload", token, {
    auditId, kind, originalName: file.name, contentType: signedType(file.name), sizeBytes: file.size, ...(sha256 ? { sha256 } : {}),
  });
  if (!signed.uploadUrl || !signed.fileId) throw Object.assign(new Error("Resposta inválida do servidor."), { code: "error" });
  let put;
  try {
    put = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": signed.contentType }, body: file });
  } catch {
    throw Object.assign(new Error("Falha ao enviar o arquivo ao armazenamento seguro."), { code: "network" });
  }
  if (!put.ok) throw Object.assign(new Error("Falha ao enviar o arquivo ao armazenamento seguro."), { code: "upload" });
  await post("/api/files/confirm-upload", token, { fileId: signed.fileId });
  return signed.fileId;
}

const CONTENT_TYPES = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
};
function signedType(name) {
  return CONTENT_TYPES[String(name).split(".").pop().toLowerCase()];
}

/** URL curta (5 min) que baixa o arquivo com o nome original. */
export async function urlDeDownload(fileId, getIdToken) {
  const { downloadUrl } = await post("/api/files/download", await tokenDe(getIdToken), { fileId });
  return downloadUrl;
}

/** Apaga o arquivo do bucket e seus metadados. Arquivo que já não existe não é erro. */
export async function apagarArquivo(fileId, getIdToken) {
  try { await post("/api/files/delete", await tokenDe(getIdToken), { fileId }); }
  catch (err) { if (err.code !== "not_found") throw err; }
}
