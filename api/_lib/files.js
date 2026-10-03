import { randomUUID } from "node:crypto";

export const CONTENT_TYPES = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
};

/** Cada auditoria guarda no máximo um arquivo por tipo: Produção (`prod`) e Repasse (`rep`). */
export const KINDS = ["prod", "rep"];

export function maxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB || 20);
  return (Number.isFinite(mb) && mb > 0 ? mb : 20) * 1024 * 1024;
}

/** Id do documento de metadados (e identificador do arquivo na API): um por auditoria e tipo. */
export function fileDocId(auditId, kind) {
  return `${auditId}_${kind}`;
}

const AUDIT_ID = /^[A-Za-z0-9]{1,64}$/;
export function validAuditId(id) {
  return typeof id === "string" && AUDIT_ID.test(id);
}

export function validateUpload({ originalName, contentType, sizeBytes, kind, sha256 }) {
  if (!KINDS.includes(kind)) return { error: "Tipo de arquivo inválido." };
  const name = String(originalName || "");
  const ext = name.split(".").pop()?.toLowerCase();
  if (!CONTENT_TYPES[ext]) return { error: "Formato inválido. Envie .xlsx, .xls ou .csv." };
  if (contentType && contentType !== CONTENT_TYPES[ext]) return { error: "O tipo do arquivo não corresponde à extensão informada." };
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) return { error: "O tamanho do arquivo é inválido." };
  if (sizeBytes > maxUploadBytes()) return { error: `Arquivo muito grande. Limite de ${Math.round(maxUploadBytes() / 1024 / 1024)} MB.`, tooLarge: true };
  if (sha256 !== undefined && !/^[0-9a-f]{64}$/.test(String(sha256))) return { error: "O hash do arquivo é inválido." };
  return { ext, contentType: CONTENT_TYPES[ext] };
}

export function objectKey(uid, originalName) {
  const now = new Date();
  const safeName = String(originalName)
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "").slice(0, 120) || "planilha";
  return `${uid}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeName}`;
}

/** A chave do objeto precisa começar com o uid do dono do arquivo: nunca assine/apague a chave de outro usuário. */
export function keyBelongsTo(r2Key, ownerUid) {
  return typeof r2Key === "string" && typeof ownerUid === "string" && ownerUid.length > 0
    && r2Key.startsWith(`${ownerUid}/`) && !r2Key.includes("..");
}

export function firestoreUrl(projectId, path) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${path}`;
}

/** Documento do Firestore lido com o token do próprio usuário (as Security Rules valem), ou null se não existir/sem acesso. */
export async function getDocument(user, path) {
  const response = await fetch(firestoreUrl(user.projectId, path), { headers: { Authorization: `Bearer ${user.token}` } });
  if (!response.ok) return null;
  return response.json();
}

/**
 * Metadados de um arquivo, se o usuário pode acessá-lo: o dono ou um admin. A chave do objeto precisa
 * pertencer ao dono registrado no documento (defesa em profundidade além das Security Rules).
 */
export async function getAccessibleFile(user, fileId) {
  const doc = await getDocument(user, `files/${encodeURIComponent(fileId)}`);
  const owner = doc?.fields?.userId?.stringValue;
  if (!owner) return null;
  if (owner !== user.uid && user.role !== "admin") return null;
  if (!keyBelongsTo(doc.fields?.r2Key?.stringValue, owner)) return null;
  return doc;
}

export async function deleteDocument(user, path) {
  const response = await fetch(firestoreUrl(user.projectId, path), { method: "DELETE", headers: { Authorization: `Bearer ${user.token}` } });
  return response.ok;
}
