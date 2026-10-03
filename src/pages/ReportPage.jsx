// Relatório de auditoria + detalhe do médico (Drawer). Mesmos dados e ações do ResultsScreen anterior, com o fluxo de
// revisão explícito: status escolhido (sem ciclo), "Desfazer", fila de médicos no painel (anterior/próximo, J/K),
// filtros por status e por direção, estado de salvamento visível e "Revisão concluída".
import React, { useEffect, useState } from 'react';
import {
  Button, IconButton, Badge, Count, Card, HeroKpi, HeroChip, KpiGroup, KpiCard, SegmentedMeter, DataTable, Pagination,
  StatusBadge, ResultBadge, DirectionTag, DiffValue, SearchField, FilterChips, EmptyState, ActionMenu, Drawer, Callout, BorderBeam,
  SegmentedControl, Spinner, Icon, sortRows, formatBRL, formatNumber, formatPercent, titleCase, useViewport, isTypingTarget, cx,
} from '../components/ds/index.js';
import { signedDiff, signedPatientDiff, brlToNumber, splitDateTime, capitalize, copyText } from '../lib/display.js';
import { useToast } from '../components/Toaster.jsx';
import AuditFilesCard from '../components/AuditFilesCard.jsx';

const COPY_FAIL = { tone: 'error', title: 'Não foi possível copiar', text: 'O navegador bloqueou a área de transferência. Selecione o texto e copie manualmente.' };

const ORDER = ['pendente', 'revisado', 'corrigido'];
const STATUS_OPTIONS = [
  { id: 'pendente', label: 'Pendente', icon: 'clock' },
  { id: 'revisado', label: 'Revisado', icon: 'eye' },
  { id: 'corrigido', label: 'Corrigido', icon: 'circle-check' },
];
const STATUS_LABEL = { pendente: 'Pendente', revisado: 'Revisado', corrigido: 'Corrigido' };

const hhmm = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const ddmmyyyy = (d) => d.toLocaleDateString('pt-BR');
const pacientes = (n) => `${formatNumber(n)} ${n === 1 ? 'paciente' : 'pacientes'}`;

/** Estado do salvamento dos status de revisão. Região viva: anuncia "Salvando…", "Salvo às…" e falhas. */
function ReviewSaveState({ saveState }) {
  const { status = 'idle', savedAt, persisted, onRetry } = saveState || {};
  let kind = 'info';
  let body;
  if (!persisted || status === 'blocked') {
    body = <><Icon name="info" /><span>O status de revisão vale para esta sessão.</span></>;
  } else if (status === 'pending' || status === 'saving') {
    kind = 'saving';
    body = <><Spinner size={14} /><span>Salvando…</span></>;
  } else if (status === 'error') {
    kind = 'error';
    body = <><Icon name="circle-alert" /><span>Não foi possível salvar o status.</span><Button variant="link" size="sm" onClick={onRetry}>Tentar de novo</Button></>;
  } else if (status === 'saved' && savedAt) {
    kind = 'saved';
    body = <><Icon name="circle-check" /><span>Salvo às {hhmm(savedAt)}</span></>;
  } else {
    body = <><Icon name="database" /><span>O status de revisão fica salvo nesta auditoria.</span></>;
  }
  return <div className={cx('cs-savestate', `cs-savestate--${kind}`)} role="status">{body}</div>;
}

export default function ReportPage({ selectedMedico, setSelectedMedico, resultados, exportFormat = 'PDF', onExportExcel: exportExcelRaw, onExportPDF: exportPDFRaw, onShare, onNewAudit, onGenerateAI, aiLoading, statuses, setStatuses, saveState, reviewChangedAt }) {
  const { compact } = useViewport();
  const toast = useToast();
  const divs      = resultados?.divergencias ?? [];
  const insights  = resultados?.insights     ?? [];

  const getStatus = (id) => statuses[id] ?? 'pendente';
  /** Define o status escolhido (sem ciclo) e oferece "Desfazer". */
  const setStatus = (row, next) => {
    const prev = getStatus(row.id);
    if (prev === next) return;
    setStatuses((s) => ({ ...s, [row.id]: next }));
    toast({
      key: 'review-status', tone: 'success', title: `Marcado como ${STATUS_LABEL[next].toLowerCase()}`, text: titleCase(row.medico),
      action: { label: 'Desfazer', onClick: () => setStatuses((s) => ({ ...s, [row.id]: prev })) },
    });
  };

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dirFilter, setDirFilter] = useState('all');
  const [copiedInsight, setCopiedInsight] = useState(null);
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  // Fila de revisão do painel: a lista filtrada/ordenada no momento em que o médico foi aberto.
  const [queue, setQueue] = useState([]);
  // Busca sem diferenciar acento nem maiúsculas ("joao" acha "João" e vice-versa)
  const fold = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');
  const normalizedQuery = fold(query.trim());
  const dirOf = (row) => (signedDiff(row) >= 0 ? 'rep' : 'prod');
  const visibleDivs = divs.filter((row) => {
    const matchesQuery = !normalizedQuery || fold(row.medico).includes(normalizedQuery);
    const matchesStatus = statusFilter === 'all' || getStatus(row.id) === statusFilter;
    const matchesDir = dirFilter === 'all' || dirOf(row) === dirFilter;
    return matchesQuery && matchesStatus && matchesDir;
  });
  const copyInsight = async (text, i) => {
    if (!(await copyText(text))) { toast(COPY_FAIL); return; }
    setCopiedInsight(i);
    setTimeout(() => setCopiedInsight(null), 1500);
  };
  useEffect(() => { setPage(1); }, [query, statusFilter, dirFilter, pageSize, sort]);

  if (!resultados) {
    return (
      <Card>
        <EmptyState icon="file-search" title="Nenhuma auditoria processada."
          actions={<Button variant="primary" icon="plus" onClick={onNewAudit}>Nova auditoria</Button>}>
          Faça upload dos arquivos e inicie a auditoria para ver os resultados aqui.
        </EmptyState>
      </Card>
    );
  }

  const by = (s) => divs.filter((d) => getStatus(d.id) === s).length;
  const reviewed = by('revisado') + by('corrigido');
  const reviewDone = divs.length > 0 && reviewed === divs.length;
  const byDir = (dir) => divs.filter((d) => dirOf(d) === dir).length;
  const total = Number(resultados.valorTotalRaw);
  const heroValue = Number.isFinite(total) ? formatBRL(total) : resultados.valorTotal;
  const processed = splitDateTime(resultados.processadoEm);
  // Linhas sem nome de médico não entram no cruzamento (antes sumiam sem aviso)
  const sm = resultados.linhasSemMedico;
  const semMedicoParte = (x, nome) => (x?.linhas ? `${formatNumber(x.linhas)} ${x.linhas === 1 ? 'linha' : 'linhas'} no ${nome} (${formatBRL(x.valor)})` : null);
  const semMedicoPartes = sm ? [semMedicoParte(sm.prod, 'relatório de Produção'), semMedicoParte(sm.rep, 'relatório de Repasse')].filter(Boolean) : [];
  const semMedico = semMedicoPartes.length
    ? `${semMedicoPartes.join(' e ')} não têm nome de médico e não entraram no cruzamento. Confira se a planilha tem células mescladas ou linhas de subtotal.`
    : null;
  const pctMedicos = resultados.totalMedicos ? (resultados.medicosComDivergencia / resultados.totalMedicos) * 100 : 0;

  // Exportações são assíncronas (bibliotecas carregadas sob demanda): avisa se falharem.
  const guard = (fn) => () => Promise.resolve(fn?.()).catch(() => toast({ tone: 'error', title: 'Não foi possível exportar', text: 'Tente novamente em instantes.' }));
  const onExportExcel = guard(exportExcelRaw);
  const onExportPDF = guard(exportPDFRaw);
  const excelDefault = exportFormat === 'XLSX';
  const onExportDefault = excelDefault ? onExportExcel : onExportPDF;
  const exportDefaultLabel = excelDefault ? 'Exportar Excel' : 'Exportar PDF';

  const onCopySummary = async () => {
    const ok = await Promise.resolve(onShare?.()).catch(() => false);
    toast(ok ? { tone: 'success', title: 'Resumo copiado', text: 'Cole onde precisar.' } : COPY_FAIL);
  };
  // Formato padrão (Configurações) vem primeiro e é a ação direta do botão Exportar.
  const excelItem = { label: 'Excel (.xlsx)', icon: 'file-spreadsheet', variant: 'export', onSelect: onExportExcel };
  const pdfItem = { label: 'PDF', icon: 'file-text', onSelect: onExportPDF };
  const exportItems = excelDefault ? [excelItem, pdfItem] : [pdfItem, excelItem];
  const more = [
    ...(compact ? exportItems.map((it) => ({ ...it, label: it === excelItem ? 'Exportar Excel' : 'Exportar PDF' })) : []),
    { label: 'Copiar resumo', icon: 'copy', onSelect: onCopySummary },
    { label: 'Nova auditoria', icon: 'plus', onSelect: onNewAudit },
  ];

  const columns = [
    { key: 'medico', header: 'Médico', sortable: true, sortValue: (d) => String(d.medico || ''), render: (d) => (
      <span className="cs-cell-main"><span className="cs-cell-main__title" title={d.medico}>{titleCase(d.medico)}</span>
        <span className="cs-cell-main__sub">{d.detalhes?.length ? pacientes(d.detalhes.length) : 'Sem detalhamento'}</span></span>) },
    { key: 'producao', header: 'Produção', align: 'right', sortable: true, priority: 2, sortValue: (d) => brlToNumber(d.producao), render: (d) => d.producao },
    { key: 'repasse', header: 'Repasse', align: 'right', sortable: true, priority: 2, sortValue: (d) => brlToNumber(d.repasse), render: (d) => d.repasse },
    { key: 'diff', header: 'Diferença', align: 'right', sortable: true, sortValue: (d) => signedDiff(d), render: (d) => <DiffValue value={signedDiff(d)} /> },
    { key: 'items', header: 'Itens', align: 'center', sortable: true, sortValue: (d) => d.detalhes?.length || 0, render: (d) => (d.detalhes?.length ? <Count>{d.detalhes.length}</Count> : <span className="cs-faint">—</span>) },
    { key: 'status', header: 'Status', sortable: true, sortValue: (d) => ORDER.indexOf(getStatus(d.id)), render: (d) => <StatusBadge status={getStatus(d.id)} /> },
  ];
  const sorted = sortRows(visibleDivs, columns, sort);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const pageRows = sorted.slice((current - 1) * pageSize, current * pageSize);
  const openDoctor = (row) => { setQueue(sorted.map((d) => d.id)); setSelectedMedico({ ...row, status: getStatus(row.id) }); };
  const clearFilters = () => { setQuery(''); setStatusFilter('all'); setDirFilter('all'); };
  // Itens do menu "…" da linha: cada status é uma escolha explícita; o atual aparece marcado e desativado.
  const statusItems = (d) => {
    const cur = getStatus(d.id);
    return [{ heading: 'Status de revisão' }, ...STATUS_OPTIONS.map((o) => ({
      label: `Marcar como ${o.label.toLowerCase()}`, icon: o.icon, disabled: cur === o.id, hint: cur === o.id ? 'Atual' : undefined, onSelect: () => setStatus(d, o.id),
    }))];
  };

  // Fila do painel: a lista do momento em que foi aberto (marcar um médico não o tira da fila, mesmo com filtro).
  const queueIds = selectedMedico && queue.includes(selectedMedico.id) ? queue : sorted.map((d) => d.id);
  const queuePos = selectedMedico ? queueIds.indexOf(selectedMedico.id) : -1;
  const goTo = (i) => {
    const row = divs.find((d) => d.id === queueIds[i]);
    if (row) setSelectedMedico({ ...row, status: getStatus(row.id) });
  };

  const saveLine = <ReviewSaveState saveState={saveState} />;
  const changed = reviewChangedAt instanceof Date ? reviewChangedAt : null;

  return (
    <>
      <div className="cs-pagehead">
        <div className="cs-pagehead__titles">
          <span className="cs-pagehead__eyebrow"><Icon name="file-search" size={14} />Relatório de auditoria</span>
          <h1 className="cs-pagehead__title">{capitalize(resultados.referencia) || 'Sem referência'} <ResultBadge divergences={Number(resultados.totalDivergencias) || 0} /></h1>
          <div className="cs-pagehead__meta">
            <span><Icon name="calendar" />Processada em {processed.date}{processed.time ? ` às ${processed.time}` : ''}</span>
            <span style={{ minWidth: 0, maxWidth: '100%' }}><Icon name="file-spreadsheet" /><span className="cs-truncate" title={`${resultados.file1Name} × ${resultados.file2Name}`}>{resultados.file1Name} · {resultados.file2Name}</span></span>
          </div>
        </div>
        <div className="cs-pagehead__actions">
          {!compact && (
            <span className="cs-split">
              <Button variant="secondary" icon="download" onClick={onExportDefault} title={`Exportar em ${excelDefault ? 'Excel' : 'PDF'} (formato padrão)`}>{exportDefaultLabel}</Button>
              <ActionMenu label="Escolher formato de exportação" title="Exportar como" items={exportItems}
                trigger={(p) => <IconButton icon="chevron-down" label="Escolher formato de exportação" variant="secondary" {...p} />} />
            </span>
          )}
          <Button variant="ia" onClick={onGenerateAI} disabled={aiLoading} loading={aiLoading}>
            {aiLoading && <BorderBeam tone="ia" />}
            {aiLoading ? <span className="cs-shimmer cs-shimmer--ia">Gerando relatório IA…</span> : 'Relatório IA'}
          </Button>
          <ActionMenu items={more} label="Mais ações da auditoria" title="Ações da auditoria"
            trigger={(p) => <IconButton icon="ellipsis" label="Mais ações" variant="secondary" round {...p} />} />
        </div>
      </div>

      <div className="cs-grid cs-grid--stretch">
        <div className="cs-span-4 cs-md-6">
          <HeroKpi label="Valor divergente total" icon="banknote" value={heroValue}
            chip={<HeroChip icon="triangle-alert">{formatNumber(Number(resultados.totalDivergencias) || 0)} {Number(resultados.totalDivergencias) === 1 ? 'divergência' : 'divergências'}</HeroChip>}
            meta={<span>em {formatNumber(resultados.medicosComDivergencia)} de {formatNumber(resultados.totalMedicos)} médicos analisados</span>}
            actions={<Button variant="light" size="sm" icon="copy" onClick={onCopySummary}>Copiar resumo</Button>} />
        </div>
        <Card className="cs-span-5 cs-md-12" title="Resumo">
          <KpiGroup columns={compact ? 2 : 3}>
            <KpiCard label="Médicos" value={formatNumber(Number(resultados.totalMedicos) || 0)} icon="stethoscope" hint="analisados" />
            <KpiCard label="Com divergência" value={formatNumber(Number(resultados.medicosComDivergencia) || 0)} icon="triangle-alert" tone="danger" hint={`${formatPercent(pctMedicos)} dos médicos`} />
            <KpiCard label="Divergências" value={formatNumber(Number(resultados.totalDivergencias) || 0)} icon="list-checks" hint="itens a revisar" />
            {compact && <KpiCard label="Revisão" value={`${formatNumber(reviewed)} de ${formatNumber(divs.length)}`} icon="circle-check" tone="success" hint={`${formatNumber(by('corrigido'))} corrigidos`} />}
          </KpiGroup>
          {compact && divs.length > 0 && saveLine}
        </Card>
        {!compact && (
          <Card className="cs-span-3 cs-md-6">
            <SegmentedMeter title="Progresso da revisão" segments={22}
              value={divs.length ? (by('corrigido') / divs.length) * 100 : 0}
              secondary={divs.length ? (reviewed / divs.length) * 100 : 0}
              valueLabel={`${formatNumber(reviewed)} de ${formatNumber(divs.length)}`}
              label={`Progresso da revisão: ${by('corrigido')} corrigidos, ${by('revisado')} revisados, ${by('pendente')} pendentes`}
              legend={[{ label: 'Corrigidos', swatch: 'chart-1', value: by('corrigido') }, { label: 'Revisados', swatch: 'chart-2', value: by('revisado') }, { label: 'Pendentes', swatch: 'track', value: by('pendente') }]} />
            {divs.length > 0 && saveLine}
          </Card>
        )}
      </div>

      {reviewDone && (
        <Callout tone="success" className="cs-callout--done" title="Revisão concluída"
          action={<Button variant="primary" icon="download" onClick={onExportDefault}>{exportDefaultLabel}</Button>}>
          {divs.length === 1 ? 'O médico com divergência está revisado ou corrigido.' : `Os ${formatNumber(divs.length)} médicos com divergência estão revisados ou corrigidos.`}
          {changed ? ` Último status em ${ddmmyyyy(changed)} às ${hhmm(changed)}.` : ''}
        </Callout>
      )}

      {semMedico && (
        <Callout tone="warning" title="Linhas sem nome de médico ficaram de fora">
          {semMedico}
        </Callout>
      )}

      <Card flush title={<>Médicos com divergências <Count>{formatNumber(divs.length)}</Count></>}
        subtitle="Diferença = Repasse − Produção. Abra um médico para ver os pacientes e marcar a revisão.">
        {divs.length > 0 && (
          <div className="cs-card-toolbar">
            <div className="cs-toolbar">
              <div className="cs-toolbar__grow" style={compact ? { flexBasis: '100%', maxWidth: 'none' } : { maxWidth: 320 }}>
                <SearchField placeholder="Buscar médico" label="Buscar médico" value={query} onChange={setQuery} shortcut={compact ? undefined : '/'} />
              </div>
              {!compact && <div className="cs-toolbar__end"><span className="cs-count-line" aria-live="polite">Exibindo <b>{formatNumber(visibleDivs.length)}</b> de <b>{formatNumber(divs.length)}</b></span></div>}
            </div>
            <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px' }}>
              <FilterChips label="Status de revisão" value={statusFilter} onChange={setStatusFilter} options={[
                { id: 'all', label: 'Todos', count: divs.length },
                { id: 'pendente', label: 'Pendentes', count: by('pendente'), icon: 'clock' },
                { id: 'revisado', label: 'Revisados', count: by('revisado'), icon: 'eye' },
                { id: 'corrigido', label: 'Corrigidos', count: by('corrigido'), icon: 'circle-check' },
              ]} />
              <span className="cs-chips__sep" aria-hidden="true" />
              {/* Direção: opcional (nenhum marcado = as duas). Marcar um desmarca o outro. */}
              <FilterChips multiple label="Direção da diferença" value={dirFilter === 'all' ? [] : [dirFilter]}
                onChange={(v) => setDirFilter(v.length ? v[v.length - 1] : 'all')} options={[
                  { id: 'rep', label: 'Repasse maior', count: byDir('rep'), icon: 'arrow-up-right' },
                  { id: 'prod', label: 'Produção maior', count: byDir('prod'), icon: 'arrow-down-left' },
                ]} />
            </div>
            {compact && <span className="cs-count-line" aria-live="polite">Exibindo <b>{formatNumber(visibleDivs.length)}</b> de <b>{formatNumber(divs.length)}</b></span>}
          </div>
        )}
        {divs.length === 0 ? (
          <EmptyState icon="circle-check" title="Nenhuma divergência encontrada.">Os relatórios de produção e repasse estão em plena conformidade.</EmptyState>
        ) : (
          <DataTable caption="Médicos com divergências" rows={pageRows} rowKey={(d) => d.id} columns={columns} sort={sort} onSortChange={setSort}
            selectedKey={selectedMedico?.id} onRowClick={openDoctor}
            empty={<EmptyState icon="search-x" title="Nenhum médico encontrado" actions={<Button variant="secondary" icon="rotate-ccw" onClick={clearFilters}>Limpar filtros</Button>}>Ajuste a busca ou os filtros de status e direção.</EmptyState>}
            primaryAction={(d) => ({ label: 'Detalhar', iconEnd: 'chevron-right', ariaLabel: 'Detalhar ' + titleCase(d.medico), onClick: () => openDoctor(d) })}
            rowActions={statusItems}
            mobile={{
              title: (d) => titleCase(d.medico),
              value: (d) => formatBRL(signedDiff(d), { signed: true }),
              meta: (d) => <><span>{d.detalhes?.length ? pacientes(d.detalhes.length) : 'Sem detalhamento'}</span></>,
              tags: (d) => <><DirectionTag direction={dirOf(d)} short /><StatusBadge status={getStatus(d.id)} size="sm" /></>,
            }}
            footer={sorted.length > 10 ? <Pagination page={current} pageSize={pageSize} total={sorted.length} compact={compact} onPage={setPage} onPageSize={setPageSize} /> : null} />
        )}
      </Card>

      <Card title="Análise inteligente" icon="list-checks" subtitle={`Pontos de atenção identificados automaticamente · ${processed.date}${processed.time ? ' ' + processed.time : ''}`}>
        {insights.length === 0 ? (
          <EmptyState compact icon="list-checks" title="Sem análise nesta auditoria">A análise aparece aqui quando a opção “Gerar análise inteligente” está ativa no processamento.</EmptyState>
        ) : (
          <ul className="cs-insights">
            {insights.map((insight, index) => (
              <li key={index} className="cs-insight">
                <span className="cs-insight__dot" aria-hidden="true" />
                <span>{insight}</span>
                <IconButton icon={copiedInsight === index ? 'check' : 'copy'} size="sm" label={copiedInsight === index ? 'Copiado' : 'Copiar insight'} onClick={() => copyInsight(insight, index)} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {resultados._histId && <AuditFilesCard auditId={resultados._histId} />}

      {selectedMedico && (
        <DoctorDrawer medico={selectedMedico} status={getStatus(selectedMedico.id)} onStatus={(next) => setStatus(selectedMedico, next)}
          saveLine={saveLine} position={queuePos} total={queueIds.length}
          onPrev={queuePos > 0 ? () => goTo(queuePos - 1) : null}
          onNext={queuePos > -1 && queuePos < queueIds.length - 1 ? () => goTo(queuePos + 1) : null}
          onClose={() => setSelectedMedico(null)} onCopied={(ok) => toast(ok ? { tone: 'success', title: 'Item copiado' } : COPY_FAIL)} />
      )}
    </>
  );
}

function DoctorDrawer({ medico, status, onStatus, saveLine, position, total, onPrev, onNext, onClose, onCopied }) {
  const { compact } = useViewport();
  const signed = signedDiff(medico);
  const rep = signed >= 0;
  const detalhes = medico.detalhes || [];
  const freq = detalhes.reduce((a, d) => { a[d.tipo] = (a[d.tipo] || 0) + 1; return a; }, {});
  // Conciliação: a soma dos itens por paciente (Repasse − Produção) explica a diferença do médico?
  const itemsSum = detalhes.reduce((a, d) => a + signedPatientDiff(d), 0);
  const gap = signed - itemsSum;
  const showRecon = detalhes.length > 0 && Math.round(Math.abs(gap) * 100) > 0;

  // J = próximo médico, K = anterior (fora de campos de texto).
  const nav = React.useRef({ onPrev, onNext });
  nav.current = { onPrev, onNext };
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === 'j' && nav.current.onNext) { e.preventDefault(); nav.current.onNext(); }
      if (k === 'k' && nav.current.onPrev) { e.preventDefault(); nav.current.onPrev(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const hasPos = position > -1 && total > 0;
  // Nas pontas o botão fica focável (aria-disabled) para o foco não cair no <body>.
  const navButton = (dir) => {
    const fn = dir === 'prev' ? onPrev : onNext;
    const key = dir === 'prev' ? 'K' : 'J';
    return (
      <Button variant="secondary" icon={dir === 'prev' ? 'chevron-left' : undefined} iconEnd={dir === 'next' ? 'chevron-right' : undefined}
        aria-disabled={!fn || undefined} aria-keyshortcuts={key} title={`${dir === 'prev' ? 'Médico anterior' : 'Próximo médico'} (${key})`}
        onClick={() => fn && fn()}>
        {dir === 'prev' ? 'Anterior' : 'Próximo'}{!compact && <kbd className="cs-kbd" aria-hidden="true">{key}</kbd>}
      </Button>
    );
  };

  return (
    <Drawer onClose={onClose} eyebrow="Detalhe do médico" title={<span title={medico.medico}>{titleCase(medico.medico)}</span>} scrollKey={medico.id}
      subtitle={detalhes.length ? `${formatNumber(detalhes.length)} ${detalhes.length === 1 ? 'item divergente' : 'itens divergentes'} por paciente` : 'Detalhamento das divergências por paciente'}
      footer={hasPos && total > 1 ? (
        <div className="cs-drawer__nav" role="group" aria-label="Navegar entre médicos">
          {navButton('prev')}
          <span className="cs-drawer__pos" aria-live="polite">{formatNumber(position + 1)} de {formatNumber(total)}</span>
          {navButton('next')}
        </div>
      ) : null}>
      <div className="cs-drawer__status">
        <span className="cs-drawer__status-label" aria-hidden="true">Status de revisão</span>
        <SegmentedControl label="Status de revisão" block value={status} onChange={onStatus} options={STATUS_OPTIONS} />
        {saveLine}
      </div>
      <div className="cs-sumgrid">
        <div className="cs-sum"><span className="cs-sum__label">Produção</span><span className="cs-sum__value">{medico.producao}</span></div>
        <div className="cs-sum"><span className="cs-sum__label">Repasse</span><span className="cs-sum__value">{medico.repasse}</span></div>
        <div className={rep ? 'cs-sum cs-sum--emph' : 'cs-sum cs-sum--emph-prod'}><span className="cs-sum__label">Diferença</span><span className="cs-sum__value">{formatBRL(signed, { signed: true })}</span></div>
      </div>
      <Callout tone="neutral" icon={rep ? 'arrow-up-right' : 'arrow-down-left'} title={rep ? 'Repasse maior que a produção' : 'Produção maior que o repasse'}>
        {rep ? `${formatBRL(Math.abs(signed))} pagos a mais. Confirme com o faturamento antes de corrigir.` : `${formatBRL(Math.abs(signed))} pagos a menos. Avalie complemento de repasse.`}
      </Callout>
      {detalhes.length > 0 && (
        <div className="cs-tipos" role="group" aria-label="Tipos de divergência">
          {Object.entries(freq).map(([tipo, qtd]) => <Badge key={tipo} tone="outline" icon="tag" size="sm">{tipo} ({qtd})</Badge>)}
        </div>
      )}
      <div className="cs-stack" style={{ gap: 12 }}>
        <h3 className="cs-card__title" style={{ fontSize: 14, lineHeight: '20px' }}>Itens por paciente {detalhes.length > 0 && <Count>{detalhes.length}</Count>}</h3>
        {showRecon && (
          <p className="cs-recon">Itens por paciente somam <b>{formatBRL(itemsSum, { signed: true })}</b>; diferença sem detalhe: <b>{formatBRL(gap, { signed: true })}</b>.</p>
        )}
        {!detalhes.length ? (
          <EmptyState compact icon="inbox" title="Sem detalhamento por paciente">
            Esta auditoria não tem itens por paciente. Isso acontece quando a comparação por paciente está desligada ou quando as planilhas não têm coluna de paciente.
          </EmptyState>
        ) : (
          <ul className="cs-plist">
            {detalhes.map((detail, index) => {
              const d = signedPatientDiff(detail);
              return (
                <li className="cs-prow" key={index}>
                  <span className="cs-prow__name cs-truncate" title={detail.paciente}>{titleCase(detail.paciente)}<span className="cs-faint" style={{ display: 'block', fontSize: 12, lineHeight: '16px', fontWeight: 400 }}>{detail.tipo}</span></span>
                  <IconButton icon="copy" size="sm" label={`Copiar item de ${titleCase(detail.paciente)}`}
                    onClick={() => copyText(`Paciente: ${detail.paciente} | Produção: ${detail.producao} | Repasse: ${detail.repasse} | Diferença: ${detail.diferenca} | Tipo: ${detail.tipo}`).then(onCopied)} />
                  <div className="cs-prow__vals">
                    <span>Produção<b>{brlToNumber(detail.producao) ? detail.producao : '—'}</b></span>
                    <span>Repasse<b>{brlToNumber(detail.repasse) ? detail.repasse : '—'}</b></span>
                    <span>Diferença<b>{formatBRL(d, { signed: true })}</b></span>
                  </div>
                  <div className="cs-prow__tags"><DirectionTag direction={d >= 0 ? 'rep' : 'prod'} short={compact} /></div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
