// Auditorias › Minhas auditorias (histórico) e › Nova auditoria (upload → comparação → processar).
// Filtros, escopo, ações e exclusão seguem exatamente a lógica do HistoryScreen/UploadScreen anteriores.
import React, { useEffect, useState } from 'react';
import { matchesAuditScope } from '../dashboard';
import { exportExcel, exportPDF } from '../lib/exporters.js';
import { getPreferences, getTolerance } from '../lib/preferences.js';
import {
  Button, Badge, Card, StatStrip, DataTable, Pagination, ResultBadge, Avatar, SearchField, FilterChips, SheetSelect,
  PageHeader, Tabs, EmptyState, ErrorState, ConfirmDialog, Dropzone, UploadProgress, TextField, Accordion, Checkbox,
  Callout, Icon, ActionBar, sortRows, formatBRL, formatNumber, formatPercent, titleCase, useViewport,
} from '../components/ds/index.js';
import { auditTime, auditValue, auditSortValue, capitalize } from '../lib/display.js';
import { openReport } from '../lib/reportViewer.js';
import { useToast } from '../components/Toaster.jsx';

export default function AuditsPage({ view, onShowList, onNewAudit, list, upload, exportOptions }) {
  const { compact } = useViewport();
  // Filtro de responsável (admin) fica aqui para o contador da aba acompanhar a lista exibida.
  const isAdmin = list.currentUser?.role === 'admin';
  const [scope, setScope] = useState(isAdmin ? 'mine' : list.currentUser?.id);
  const historyCount = list.status === 'ready'
    ? list.historico.filter((row) => !isAdmin || matchesAuditScope(row, scope, list.currentUser?.id)).length
    : undefined;
  return (
    <>
      <PageHeader title="Auditorias" subtitle="Cruze Produção × Repasse e acompanhe cada auditoria salva"
        primary={!compact && view === 'list' && <Button variant="primary" icon="plus" onClick={onNewAudit}>Nova auditoria</Button>} />
      <Tabs label="Auditorias" value={view} fill={compact}
        onChange={(id) => (id === 'new' ? onNewAudit() : onShowList())}
        tabs={[{ id: 'list', label: isAdmin ? 'Auditorias salvas' : 'Minhas auditorias', count: historyCount }, { id: 'new', label: 'Nova auditoria', icon: 'plus' }]} />
      {view === 'new' ? <NewAudit {...upload} onShowAudits={onShowList} /> : <AuditList {...list} scope={scope} setScope={setScope} onNewAudit={onNewAudit} exportOptions={exportOptions} />}
    </>
  );
}

// ─── LISTA (antigo HistoryScreen) ─────────────────────────────────────────────
function AuditList({ historico, onOpen, onDelete, onNewAudit, currentUser, status = 'ready', onRetry, exportOptions, scope, setScope }) {
  const toast = useToast();
  const { compact } = useViewport();
  const isAdmin = currentUser?.role === 'admin';
  const [confirmDel, setConfirmDel] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const auditors = [...new Map(historico.map(row => [row.userId, row.userName || 'Usuário sem nome'])).entries()]
    .filter(([id]) => id).map(([id, name]) => ({ id, name }));
  const scopedHistory = historico.filter(row => !isAdmin || matchesAuditScope(row, scope, currentUser?.id));
  const withDifferences = scopedHistory.filter(row => Number(row.divergencias) > 0);
  const compliant = scopedHistory.filter(row => Number(row.divergencias) === 0);
  const totalDifferences = scopedHistory.reduce((total, row) => total + (Number(row.divergencias) || 0), 0);
  const withAI = scopedHistory.filter(row => row.aiReportHTML);
  const visibleHistory = scopedHistory.filter((row) => {
    const matchesQuery = !normalizedQuery || [row.data, row.periodo, row.arquivos, row.userName]
      .some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(normalizedQuery));
    const matchesFilter = filter === 'all'
      || (filter === 'differences' && Number(row.divergencias) > 0)
      || (filter === 'compliant' && Number(row.divergencias) === 0)
      || (filter === 'ai' && row.aiReportHTML);
    return matchesQuery && matchesFilter;
  });
  const [sort, setSort] = useState(null);
  const columns = [
    { key: 'date', header: 'Data', sortable: true, sortValue: auditSortValue, render: (a) => <span className="cs-cell-main"><span className="cs-num">{a.data || '—'}</span>{auditTime(a) && <span className="cs-cell-main__sub cs-num">{auditTime(a)}</span>}</span> },
    { key: 'ref', header: 'Referência', sortable: true, sortValue: (a) => String(a.periodo || '').toLocaleLowerCase('pt-BR'), render: (a) => <span className="cs-cell-main"><span className="cs-cell-main__title">{capitalize(a.periodo) || '—'}</span></span> },
    { key: 'files', header: 'Arquivos', priority: 3, render: (a) => <span className="cs-cell-main" style={{ maxWidth: 240 }}>{String(a.arquivos || '—').split(' / ').map((f, i) => <span key={i} className="cs-mono cs-truncate" title={f} style={{ color: 'var(--ink-2)' }}>{f}</span>)}</span> },
    ...(isAdmin ? [{ key: 'auditor', header: 'Auditor', priority: 2, render: (a) => a.userName ? <span className="cs-cell-person"><Avatar name={a.userName} size="sm" /><span className="cs-truncate" title={a.userName}>{titleCase(a.userName)}</span></span> : <span className="cs-faint">—</span> }] : []),
    { key: 'res', header: 'Resultado', sortable: true, sortValue: (a) => Number(a.divergencias) || 0, render: (a) => <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}><ResultBadge divergences={Number(a.divergencias) || 0} />{a.aiReportHTML && <Badge tone="ia" icon="sparkles" size="sm" title="Relatório IA disponível">IA</Badge>}</span> },
    { key: 'value', header: 'Valor divergente', align: 'right', sortable: true, sortValue: auditValue, render: (a) => (auditValue(a) ? formatBRL(auditValue(a)) : <span className="cs-faint">—</span>) },
  ];
  const sortedAll = sortRows(visibleHistory, columns, sort);
  useEffect(() => { setPage(1); }, [query, filter, scope, pageSize, sort]);
  const pages = Math.max(1, Math.ceil(visibleHistory.length / pageSize));
  const current = Math.min(page, pages);
  const pageRows = sortedAll.slice((current - 1) * pageSize, current * pageSize);

  // Isolado num iframe sandbox: o HTML salvo no histórico não roda com a sessão de quem abre.
  const openAIReport = (row) => openReport(row.aiReportHTML, { title: `Relatório IA · ${capitalize(row.periodo) || 'Auditoria'}` });
  const refOf = (row) => capitalize(row.periodo) || row.data || 'Auditoria sem referência';
  const rowActions = (row) => {
    const items = [];
    if (row.resultados) {
      // Formato padrão (Configurações) primeiro.
      const run = (fn) => () => Promise.resolve(fn(row.resultados, exportOptions?.())).catch(() => toast({ tone: 'error', title: 'Não foi possível exportar', text: 'Tente novamente em instantes.' }));
      const excel = { label: 'Exportar Excel', icon: 'file-spreadsheet', variant: 'export', onSelect: run(exportExcel) };
      const pdf = { label: 'Exportar PDF', icon: 'file-text', onSelect: run(exportPDF) };
      items.push(...(getPreferences().formato === 'XLSX' ? [excel, pdf] : [pdf, excel]));
    }
    if (row.aiReportHTML) items.push({ label: 'Ver relatório IA', icon: 'sparkles', variant: 'ia', onSelect: () => openAIReport(row) });
    if (items.length) items.push({ separator: true });
    items.push({ label: 'Excluir auditoria', icon: 'trash-2', variant: 'danger', onSelect: () => setConfirmDel(row) });
    return items;
  };
  const clearFilters = () => { setQuery(''); setFilter('all'); };
  const scopeOptions = [
    { value: 'mine', label: 'Minhas auditorias' },
    { value: 'all', label: 'Auditorias da clínica' },
    ...auditors.filter(a => a.id !== currentUser?.id).map(a => ({ value: a.id, label: titleCase(a.name) })),
  ];
  const countLine = <span className="cs-count-line" aria-live="polite">Exibindo <b>{formatNumber(visibleHistory.length)}</b> de <b>{formatNumber(scopedHistory.length)}</b></span>;

  return (
    <>
      <StatStrip items={[
        { label: 'Auditorias salvas', value: status === 'loading' ? '–' : formatNumber(scopedHistory.length), icon: 'clipboard-check' },
        { label: 'Com divergências', value: status === 'loading' ? '–' : formatNumber(withDifferences.length), sub: scopedHistory.length ? formatPercent((withDifferences.length / scopedHistory.length) * 100) : undefined, icon: 'triangle-alert', tone: 'danger' },
        { label: 'Divergências', value: status === 'loading' ? '–' : formatNumber(totalDifferences), icon: 'list-checks' },
        { label: 'Relatórios IA', value: status === 'loading' ? '–' : formatNumber(withAI.length), icon: 'sparkles', tone: 'ia' },
      ]} />
      <Card flush>
        <div className="cs-card-toolbar cs-card-toolbar--top">
          <div className="cs-toolbar">
            <div className="cs-toolbar__grow" style={compact ? { maxWidth: 'none', flexBasis: '100%' } : undefined}>
              <SearchField placeholder={compact ? "Buscar auditoria" : "Buscar por período, arquivo ou auditor"} label="Buscar auditorias" value={query} onChange={setQuery} />
            </div>
            {isAdmin && !compact && <SheetSelect label="Filtrar auditorias por responsável" icon="user" width={220} value={scope} onChange={setScope} options={scopeOptions} />}
            {!compact && <div className="cs-toolbar__end">{countLine}</div>}
          </div>
          <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px' }}>
            {isAdmin && compact && <SheetSelect label="Responsável" icon="user" value={scope} onChange={setScope} options={scopeOptions} />}
            <FilterChips label="Filtrar auditorias" value={filter} onChange={setFilter} options={[
              { id: 'all', label: 'Todas', count: scopedHistory.length },
              { id: 'differences', label: 'Com divergências', count: withDifferences.length, icon: 'triangle-alert' },
              { id: 'compliant', label: 'Conformes', count: compliant.length, icon: 'circle-check' },
              { id: 'ai', label: 'Com relatório IA', count: withAI.length, icon: 'sparkles' },
            ]} />
          </div>
          {compact && countLine}
        </div>
        {status === 'error' ? (
          <ErrorState title="Não foi possível carregar o histórico" onRetry={onRetry} />
        ) : (
          <DataTable caption="Auditorias" rows={pageRows} loading={status === 'loading'} rowKey={(r) => r.id}
            empty={scopedHistory.length === 0
              ? <EmptyState icon="clipboard-check" title="Nenhuma auditoria encontrada." actions={<Button variant="primary" icon="plus" onClick={onNewAudit}>Nova auditoria</Button>}>Conclua uma nova auditoria ou escolha outro responsável.</EmptyState>
              : <EmptyState icon="search-x" title="Nenhuma auditoria encontrada" actions={<Button variant="secondary" icon="rotate-ccw" onClick={clearFilters}>Limpar filtros</Button>}>Ajuste a busca ou escolha outro filtro.</EmptyState>}
            columns={columns} sort={sort} onSortChange={setSort}
            primaryAction={(a) => (a.resultados ? { label: 'Abrir', iconEnd: 'chevron-right', ariaLabel: 'Abrir ' + refOf(a), onClick: () => onOpen(a) } : null)}
            rowActions={rowActions}
            onRowClick={(a) => { if (a.resultados) onOpen(a); }}
            mobile={{
              title: (a) => refOf(a),
              value: (a) => (auditValue(a) ? formatBRL(auditValue(a)) : '—'),
              meta: (a) => <><span className="cs-num">{a.data || '—'}{auditTime(a) ? ' · ' + auditTime(a) : ''}</span>{isAdmin && a.userName && <span>{titleCase(a.userName)}</span>}</>,
              tags: (a) => <><ResultBadge divergences={Number(a.divergencias) || 0} size="sm" />{a.aiReportHTML && <Badge tone="ia" icon="sparkles" size="sm">IA</Badge>}</>,
            }}
            footer={visibleHistory.length > 10 ? <Pagination page={current} pageSize={pageSize} total={visibleHistory.length} compact={compact} onPage={setPage} onPageSize={setPageSize} /> : null} />
        )}
      </Card>

      {confirmDel && (
        <ConfirmDialog onClose={() => setConfirmDel(null)}
          title={`Excluir a auditoria ${refOf(confirmDel)}?`}
          description="Esta ação remove o registro definitivamente para todos os usuários. Relatórios exportados anteriormente não serão afetados."
          confirmLabel="Excluir auditoria"
          onConfirm={() => { onDelete(confirmDel.id); setConfirmDel(null); }} />
      )}
    </>
  );
}

// ─── NOVA AUDITORIA (antigo UploadScreen) ─────────────────────────────────────
function FileErrors({ errors }) {
  if (!errors || !errors.length) return null;
  return (
    <Callout tone="danger" title="Não foi possível usar este arquivo">
      {errors.map((message, index) => <span key={index} style={{ display: 'block' }}>{message}</span>)}
    </Callout>
  );
}

function NewAudit({ file1, file2, setFile1, setFile2, handleFileSelect, configs, setConfigs, startAudit, uploadError, cols1, cols2, rows1, rows2, periodoAuditoria, setPeriodoAuditoria, periodoDetectado, onShowAudits }) {
  const { compact } = useViewport();
  // Um arquivo com erro de validação precisa ser trocado antes de processar de novo.
  const hasFileErrors = Boolean(uploadError?.prod?.length || uploadError?.rep?.length);
  const canStart = file1 && file2 && !hasFileErrors;
  const selectedCount = Number(Boolean(file1)) + Number(Boolean(file2));
  const cards = [
    { num: 1, title: 'Relatório de Produção', subtitle: 'O que cada médico produziu no período', file: file1, setFile: setFile1, cols: cols1, rows: rows1, err: uploadError?.prod },
    { num: 2, title: 'Relatório de Repasse', subtitle: 'O que foi pago a cada médico', file: file2, setFile: setFile2, cols: cols2, rows: rows2, err: uploadError?.rep },
  ];
  const options = [
    { key: 'ignorar', label: `Ignorar diferenças abaixo de ${formatBRL(getTolerance())}` },
    { key: 'comparaNome', label: 'Comparar pacientes pelo nome' },
    { key: 'ia', label: 'Gerar análise inteligente' },
  ];
  const optionsSummary = options.filter((o) => configs[o.key]).map((o) => o.label.replace(/^\w/, (c) => c.toLowerCase()));
  const missing = !file1 && !file2 ? 'os relatórios de Produção e Repasse' : !file1 ? 'o Relatório de Produção' : 'o Relatório de Repasse';
  // Um arquivo com erro de validação não conta como passo concluído
  const ok1 = file1 && !uploadError?.prod?.length;
  const ok2 = file2 && !uploadError?.rep?.length;
  const stepState = (i) => (i === 0 ? (ok1 ? 'done' : 'active') : i === 1 ? (ok2 ? 'done' : ok1 ? 'active' : 'pending') : canStart ? 'active' : 'pending');

  return (
    <div className="cs-grid">
      <div className="cs-span-8 cs-stack" style={{ gap: compact ? 16 : 20 }}>
        {uploadError?.geral && <Callout tone="danger" title="Não foi possível continuar">{uploadError.geral}</Callout>}
        <UploadProgress done={selectedCount} total={2} />
        <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: compact ? 12 : 20, alignItems: 'start' }}>
          {cards.map(({ num, title, subtitle, file, setFile, rows, err }) => (
            <Dropzone key={num} step={num} title={title} subtitle={subtitle} invalid={Boolean(err?.length)}
              file={file ? { name: file.name, size: file.size, rows } : null}
              onFile={(f) => handleFileSelect(f, setFile)}
              onReplace={(f) => handleFileSelect(f, setFile)}
              onRemove={() => setFile(null)}>
              <FileErrors errors={err} />
            </Dropzone>
          ))}
        </div>
        <Card>
          <TextField label="Referência da auditoria" optional value={periodoAuditoria} prefixIcon="calendar"
            onChange={(event) => setPeriodoAuditoria(event.target.value)}
            placeholder={periodoDetectado ? capitalize(periodoDetectado) : 'Ex.: Abril de 2025 ou 01–15/04/2025'}
            help={periodoDetectado
              ? `Detectado nos arquivos: ${capitalize(periodoDetectado)}. Preencha só se quiser usar outro período.`
              : (file1 || file2)
                ? `Não encontramos a data nos arquivos. Se ficar em branco, será usado o mês atual (${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}).`
                : 'Detectado a partir das datas dos arquivos. Aparece nos relatórios e exportações.'} />
        </Card>
        <Accordion items={[{
          id: 'opt', icon: 'sliders-horizontal', title: 'Opções de comparação',
          subtitle: optionsSummary.length ? capitalize(optionsSummary.join(' · ')) : 'Nenhuma opção ativa',
          content: (
            <div className="cs-stack" style={{ gap: 12 }}>
              {options.map(({ key, label }) => (
                <Checkbox key={key} label={label} checked={!!configs[key]}
                  onChange={() => setConfigs(current => ({ ...current, [key]:!current[key] }))} />
              ))}
            </div>
          ),
        }]} />
      </div>
      <Card className="cs-span-4" title="Como funciona" icon="circle-help">
        <ol className="cs-steps">
          {['Envie o relatório de Produção', 'Envie o relatório de Repasse', 'Processe e revise as divergências'].map((label, i) => {
            const st = stepState(i);
            return (
              <li key={label} className={`cs-step cs-step--${st === 'done' ? 'done' : st === 'active' ? 'active' : 'pending'}`} aria-current={st === 'active' ? 'step' : undefined}>
                <span className="cs-step__mark" style={st === 'active' ? { boxShadow: 'inset 0 0 0 1.5px var(--accent)', color: 'var(--accent-text)', fontWeight: 600, fontSize: 12 } : st === 'pending' ? { fontSize: 12 } : undefined}>
                  {st === 'done' ? <Icon name="check" strokeWidth={2.4} /> : i + 1}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
        <Callout tone="info" title="Formatos aceitos">.xlsx, .xls ou .csv com colunas de médico, paciente e valor. A primeira linha deve ser o cabeçalho. Limite de 50 MB por arquivo.</Callout>
      </Card>
      <div className="cs-span-12">
        <ActionBar icon={hasFileErrors ? 'circle-alert' : canStart ? 'circle-check' : 'info'}
          message={hasFileErrors ? 'Troque o arquivo indicado acima para processar a auditoria.'
            : canStart ? 'Tudo pronto. A auditoria será processada com as opções acima.'
            : <span>{!file1 && !file2 ? 'Faltam' : 'Falta'} {missing} para processar.</span>}>
          {!compact && <Button variant="ghost" onClick={onShowAudits}>Cancelar</Button>}
          <Button variant="primary" icon="refresh-cw" onClick={startAudit} disabled={!canStart}>Processar auditoria</Button>
        </ActionBar>
      </div>
    </div>
  );
}
