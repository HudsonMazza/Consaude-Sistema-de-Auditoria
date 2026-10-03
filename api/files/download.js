import { requireActiveUser, readBody, send } from "../_lib/auth.js";
import { createDownloadUrl } from "../_lib/r2.js";
import { getAccessibleFile } from "../_lib/files.js";

// Dono do arquivo ou admin. A URL assinada dura 5 minutos e baixa com o nome original da planilha.
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = readBody(req);
  if (!body) return send(res, 400, { error: "Requisição inválida." });
  const doc = await getAccessibleFile(user, String(body.fileId || ""));
  if (!doc || doc.fields?.status?.stringValue !== "uploaded") return send(res, 404, { error: "Arquivo não encontrado ou ainda não enviado.", code: "not_found" });
  try { return send(res, 200, { downloadUrl: await createDownloadUrl(doc.fields.r2Key.stringValue, doc.fields?.originalName?.stringValue), expiresIn: 300 }); }
  catch { return send(res, 502, { error: "Não foi possível preparar o download. Tente novamente." }); }
}
