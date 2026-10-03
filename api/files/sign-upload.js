import { randomUUID } from "node:crypto";
import { requireActiveUser, send } from "../lib/auth.js";
import { createUploadUrl } from "../lib/r2.js";
import { firestoreUrl, objectKey, validateUpload } from "../lib/files.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const validation = validateUpload(body);
  if (validation.error) return send(res, 400, { error: validation.error });
  const id = randomUUID();
  const r2Key = objectKey(user.uid, body.originalName);
  try {
    const write = await fetch(firestoreUrl(user.projectId, `files/${id}`), {
      method: "PATCH", headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: {
        userId: { stringValue: user.uid }, r2Key: { stringValue: r2Key }, originalName: { stringValue: String(body.originalName) },
        contentType: { stringValue: validation.contentType }, sizeBytes: { integerValue: String(body.sizeBytes) }, status: { stringValue: "pending" },
        createdAt: { timestampValue: new Date().toISOString() },
      } }),
    });
    if (!write.ok) throw new Error("metadata-write");
    const uploadUrl = await createUploadUrl({ key: r2Key, contentType: validation.contentType });
    return send(res, 200, { fileId: id, uploadUrl, contentType: validation.contentType, expiresIn: 300 });
  } catch (err) {
    return send(res, 502, { error: "Não foi possível preparar o upload. Tente novamente." });
  }
}
