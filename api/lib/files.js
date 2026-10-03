import { randomUUID } from "node:crypto";

export const CONTENT_TYPES = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
};

export function maxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB || 20);
  return (Number.isFinite(mb) && mb > 0 ? mb : 20) * 1024 * 1024;
}

export function validateUpload({ originalName, contentType, sizeBytes }) {
  const name = String(originalName || "");
  const ext = name.split(".").pop()?.toLowerCase();
  if (!CONTENT_TYPES[ext]) return { error: "Formato inválido. Envie .xlsx, .xls ou .csv." };
  if (contentType && contentType !== CONTENT_TYPES[ext]) return { error: "O tipo do arquivo não corresponde à extensão informada." };
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) return { error: "O tamanho do arquivo é inválido." };
  if (sizeBytes > maxUploadBytes()) return { error: `Arquivo muito grande. Limite de ${Math.round(maxUploadBytes() / 1024 / 1024)} MB.` };
  return { ext, contentType: CONTENT_TYPES[ext] };
}

export function objectKey(uid, originalName) {
  const now = new Date();
  const safeName = String(originalName)
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "").slice(0, 120) || "planilha";
  return `${uid}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeName}`;
}

export function firestoreUrl(projectId, path) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${path}`;
}

export async function getOwnedFile(user, fileId) {
  const response = await fetch(firestoreUrl(user.projectId, `files/${encodeURIComponent(fileId)}`), { headers: { Authorization: `Bearer ${user.token}` } });
  if (!response.ok) return null;
  const doc = await response.json();
  return doc?.fields?.userId?.stringValue === user.uid ? doc : null;
}
