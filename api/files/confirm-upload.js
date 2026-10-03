import { requireActiveUser, readBody, send } from "../_lib/auth.js";
import { deleteFile, headFile } from "../_lib/r2.js";
import { firestoreUrl, getAccessibleFile, maxUploadBytes } from "../_lib/files.js";

// Confirma o envio só depois de conferir no bucket que o objeto existe e tem o tamanho declarado.
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = readBody(req);
  if (!body) return send(res, 400, { error: "Requisição inválida." });
  const fileId = String(body.fileId || "");
  const doc = await getAccessibleFile(user, fileId);
  // Só quem enviou confirma; admin pode baixar/excluir, mas não confirmar o envio de outra pessoa.
  if (!doc || doc.fields.userId.stringValue !== user.uid) return send(res, 404, { error: "Arquivo não encontrado.", code: "not_found" });
  if (doc.fields?.status?.stringValue === "uploaded") return send(res, 200, { ok: true });
  const key = doc.fields.r2Key.stringValue;
  const declared = Number(doc.fields?.sizeBytes?.integerValue);
  try {
    const head = await headFile(key);
    if (!head) return send(res, 409, { error: "O arquivo ainda não chegou ao armazenamento. Tente enviar de novo." });
    if (head.sizeBytes !== declared || head.sizeBytes > maxUploadBytes()) {
      await deleteFile(key).catch(() => {}); // objeto fora do que foi validado: não fica no bucket
      return send(res, 422, { error: "O arquivo enviado não confere com o informado. Tente de novo." });
    }
    const response = await fetch(`${firestoreUrl(user.projectId, `files/${encodeURIComponent(fileId)}`)}?updateMask.fieldPaths=status&updateMask.fieldPaths=uploadedAt`, {
      method: "PATCH", headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { status: { stringValue: "uploaded" }, uploadedAt: { timestampValue: new Date().toISOString() } } }),
    });
    if (!response.ok) throw new Error("metadata-update");
    return send(res, 200, { ok: true });
  } catch { return send(res, 502, { error: "Upload concluído, mas não foi possível confirmar os metadados." }); }
}
