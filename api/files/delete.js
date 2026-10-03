import { requireActiveUser, send } from "../lib/auth.js";
import { deleteFile } from "../lib/r2.js";
import { firestoreUrl, getOwnedFile } from "../lib/files.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") { res.setHeader("Allow", "DELETE"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const fileId = String(body.fileId || "");
  const doc = await getOwnedFile(user, fileId);
  if (!doc) return send(res, 404, { error: "Arquivo não encontrado." });
  try {
    await deleteFile(doc.fields.r2Key.stringValue);
    const response = await fetch(firestoreUrl(user.projectId, `files/${encodeURIComponent(fileId)}`), { method: "DELETE", headers: { Authorization: `Bearer ${user.token}` } });
    if (!response.ok) throw new Error("metadata-delete");
    return send(res, 200, { ok: true });
  } catch { return send(res, 502, { error: "Não foi possível excluir o arquivo. Tente novamente." }); }
}
