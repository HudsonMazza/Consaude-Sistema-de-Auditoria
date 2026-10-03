import { requireActiveUser, send } from "../lib/auth.js";
import { firestoreUrl, getOwnedFile } from "../lib/files.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const fileId = String(body.fileId || "");
  const doc = await getOwnedFile(user, fileId);
  if (!doc) return send(res, 404, { error: "Arquivo não encontrado." });
  if (doc.fields?.status?.stringValue === "uploaded") return send(res, 200, { ok: true });
  try {
    const response = await fetch(`${firestoreUrl(user.projectId, `files/${encodeURIComponent(fileId)}`)}?updateMask.fieldPaths=status&updateMask.fieldPaths=uploadedAt`, {
      method: "PATCH", headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { status: { stringValue: "uploaded" }, uploadedAt: { timestampValue: new Date().toISOString() } } }),
    });
    if (!response.ok) throw new Error("metadata-update");
    return send(res, 200, { ok: true });
  } catch { return send(res, 502, { error: "Upload concluído, mas não foi possível confirmar os metadados." }); }
}
