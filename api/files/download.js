import { requireActiveUser, send } from "../lib/auth.js";
import { createDownloadUrl } from "../lib/r2.js";
import { getOwnedFile } from "../lib/files.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const doc = await getOwnedFile(user, String(body.fileId || ""));
  if (!doc || doc.fields?.status?.stringValue !== "uploaded") return send(res, 404, { error: "Arquivo não encontrado ou ainda não enviado." });
  try { return send(res, 200, { downloadUrl: await createDownloadUrl(doc.fields.r2Key.stringValue), expiresIn: 300 }); }
  catch { return send(res, 502, { error: "Não foi possível preparar o download. Tente novamente." }); }
}
