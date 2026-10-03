import { requireActiveUser, readBody, send } from "../_lib/auth.js";
import { deleteFile } from "../_lib/r2.js";
import { deleteDocument, getAccessibleFile } from "../_lib/files.js";

// Apaga o objeto do bucket e os metadados (dono ou admin). Chamado ao excluir a auditoria.
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = readBody(req);
  if (!body) return send(res, 400, { error: "Requisição inválida." });
  const fileId = String(body.fileId || "");
  const doc = await getAccessibleFile(user, fileId);
  if (!doc) return send(res, 404, { error: "Arquivo não encontrado.", code: "not_found" });
  try {
    await deleteFile(doc.fields.r2Key.stringValue);
    if (!(await deleteDocument(user, `files/${encodeURIComponent(fileId)}`))) throw new Error("metadata-delete");
    return send(res, 200, { ok: true });
  } catch { return send(res, 502, { error: "Não foi possível excluir o arquivo. Tente novamente." }); }
}
