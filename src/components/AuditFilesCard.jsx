// Arquivos originais da auditoria (Produção e Repasse) para download: exatamente como foram enviados, sem o filtro de PIX.
import React, { useEffect, useState } from 'react';
import { Card, Button, Icon, Spinner, Callout } from './ds/index.js';
import { useToast } from './Toaster.jsx';
import { listarArquivosAuditoria, baixarArquivoAuditoria } from '../audits';
import { ARQUIVOS_AUDITORIA, formatarTamanho } from '../lib/auditFiles.js';

export default function AuditFilesCard({ auditId }) {
  const toast = useToast();
  const [state, setState] = useState({ status: 'loading', files: {} });
  const [busy, setBusy] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', files: {} });
    listarArquivosAuditoria(auditId)
      .then((files) => { if (alive) setState({ status: 'ready', files }); })
      .catch(() => { if (alive) setState({ status: 'error', files: {} }); });
    return () => { alive = false; };
  }, [auditId, retry]);

  const download = async (chave) => {
    setBusy(chave);
    try { await baixarArquivoAuditoria(auditId, chave, state.files[chave]); }
    catch { toast({ tone: 'error', title: 'Não foi possível baixar o arquivo', text: 'Verifique sua conexão e tente de novo.' }); }
    finally { setBusy(null); }
  };

  const { status, files } = state;
  const has = Object.keys(files).length > 0;
  return (
    <Card title="Arquivos da auditoria" icon="file-spreadsheet"
      subtitle="Os arquivos originais enviados nesta auditoria, sem nenhuma alteração ou filtro. Use para conferir de onde vieram os resultados.">
      {status === 'loading' && <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner size={14} /><span>Carregando arquivos…</span></div>}
      {status === 'error' && (
        <Callout tone="warning" title="Não foi possível carregar os arquivos"
          action={<Button variant="secondary" size="sm" onClick={() => setRetry((n) => n + 1)}>Tentar de novo</Button>}>
          Verifique sua conexão e tente de novo.
        </Callout>
      )}
      {status === 'ready' && !has && (
        <p style={{ margin: 0 }}>Os arquivos desta auditoria não foram guardados (auditoria anterior a este recurso ou arquivo grande demais).</p>
      )}
      {status === 'ready' && has && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {Object.entries(ARQUIVOS_AUDITORIA).map(([chave, rotulo]) => {
            const f = files[chave];
            return (
              <li key={chave} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                  <Icon name="file-spreadsheet" />
                  <span style={{ minWidth: 0 }}>
                    <b>{rotulo}</b><br />
                    {f
                      ? <span className="cs-truncate" title={f.nome}>{f.nome} · {formatarTamanho(f.tamanho)}</span>
                      : <span>Não disponível</span>}
                  </span>
                </span>
                {f && <Button variant="secondary" size="sm" icon="download" loading={busy === chave} disabled={busy !== null} onClick={() => download(chave)}>Baixar</Button>}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
