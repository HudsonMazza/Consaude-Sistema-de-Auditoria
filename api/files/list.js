import { requireActiveUser, send } from "../_lib/auth.js";
import { listFiles } from "../_lib/r2.js";

export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Método não permitido." }); }
  const user = await requireActiveUser(req, res); if (!user) return;
  try { return send(res, 200, { files: await listFiles(`${user.uid}/`) }); }
  catch { return send(res, 502, { error: "Não foi possível listar os arquivos. Tente novamente." }); }
}
