import { randomUUID } from "node:crypto";
import { requireActiveUser, readBody, send } from "../_lib/auth.js";
import { createUploadUrl, deleteFile } from "../_lib/r2.js";
import { deleteDocument, fileDocId, firestoreUrl, getDocument, keyBelongsTo, objectKey, validAuditId, validateUpload } from "../_lib/files.js";

// Assina o upload de UM arquivo original (Produção ou Repasse) de uma auditoria já salva.
// O arquivo é identificado por auditoria + tipo, então cada auditoria guarda no máximo um de cada.
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = readBody(req);
  if (!body) return send(res, 400, { error: "Requisição inválida." });
  if (!validAuditId(body.auditId)) return send(res, 400, { error: "Auditoria inválida." });
  const validation = validateUpload(body);
  if (validation.error) return send(res, validation.tooLarge ? 413 : 400, { error: validation.error, code: validation.tooLarge ? "too_large" : "invalid" });

  try {
    // Só o dono da auditoria anexa arquivos a ela (lido com o token do usuário: as Security Rules também valem).
    const audit = await getDocument(user, `audits/${body.auditId}`);
    if (audit?.fields?.userId?.stringValue !== user.uid) return send(res, 404, { error: "Auditoria não encontrada.", code: "not_found" });

    const id = fileDocId(body.auditId, body.kind);
    const existing = await getDocument(user, `files/${id}`);
    if (existing) {
      // Arquivo já confirmado é imutável. Um envio que ficou pela metade ("pending") é descartado e recomeçado.
      if (existing.fields?.status?.stringValue === "uploaded") return send(res, 409, { error: "Esta auditoria já tem este arquivo guardado.", code: "exists" });
      const oldKey = existing.fields?.r2Key?.stringValue;
      if (keyBelongsTo(oldKey, user.uid)) await deleteFile(oldKey).catch(() => {});
      if (!(await deleteDocument(user, `files/${id}`))) throw new Error("metadata-reset");
    }

    const r2Key = objectKey(user.uid, body.originalName);
    const fields = {
      userId: { stringValue: user.uid }, auditId: { stringValue: body.auditId }, kind: { stringValue: body.kind },
      r2Key: { stringValue: r2Key }, originalName: { stringValue: String(body.originalName) },
      contentType: { stringValue: validation.contentType }, sizeBytes: { integerValue: String(body.sizeBytes) },
      status: { stringValue: "pending" }, createdAt: { timestampValue: new Date().toISOString() },
      ...(body.sha256 ? { sha256: { stringValue: String(body.sha256) } } : {}),
    };
    // exists=false: nunca sobrescreve um documento que já exista (concorrência entre dois envios).
    const write = await fetch(`${firestoreUrl(user.projectId, `files/${id}`)}?currentDocument.exists=false`, {
      method: "PATCH", headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields }),
    });
    if (!write.ok) throw new Error("metadata-write");
    const uploadUrl = await createUploadUrl({ key: r2Key, contentType: validation.contentType, sizeBytes: body.sizeBytes });
    return send(res, 200, { fileId: id, uploadUrl, contentType: validation.contentType, expiresIn: 300 });
  } catch {
    return send(res, 502, { error: "Não foi possível preparar o upload. Tente novamente." });
  }
}
