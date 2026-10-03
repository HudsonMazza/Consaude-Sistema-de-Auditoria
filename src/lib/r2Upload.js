const CONTENT_TYPES = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
};

async function request(path, token, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Não foi possível enviar o arquivo.");
  return body;
}

/** Envia diretamente ao R2; as credenciais nunca chegam ao navegador. */
export async function uploadSpreadsheet(file, getIdToken) {
  if (!getIdToken) throw new Error("Faça login para enviar os arquivos.");
  const ext = file.name.split(".").pop().toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) throw new Error("Formato inválido. Envie .xlsx, .xls ou .csv.");
  const token = await getIdToken();
  const signed = await request("/api/files/sign-upload", token, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalName: file.name, contentType, sizeBytes: file.size }),
  });
  const put = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": signed.contentType }, body: file });
  if (!put.ok) throw new Error("Falha ao enviar o arquivo ao armazenamento seguro.");
  await request("/api/files/confirm-upload", token, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileId: signed.fileId }),
  });
  return signed.fileId;
}
