// Relatório de auditoria + detalhe do médico (Drawer). Mesmos dados, filtros, status e ações do ResultsScreen anterior.
import React, { useEffect, useState } from 'react';
import {
  Button, IconButton, Badge, Count, Card, HeroKpi, HeroChip, KpiGroup, KpiCard, SegmentedMeter, DataTable, Pagination,
  StatusBadge, ResultBadge, DirectionTag, DiffValue, SearchField, FilterChips, EmptyState, ActionMenu, Drawer, Callout,
  Icon, sortRows, formatBRL, formatNumber, formatPercent, titleCase, useViewport,
} from '../components/ds/index.js';
import { signedDiff, signedPatientDiff, brlToNumber, splitDateTime, capitalize, copyText } from '../lib/display.js';

const COPY_FAIL = { tone: 'error', title: 'Não foi possível copiar', text: 'O navegador bloqueou a área de transferência. Selecione o texto e copie manualmente.' };
import { useToast } from '../components/Toaster.jsx';

const ORDER = ['pendente', 'revisado', 'corrigido'];
const NEXT_LABEL = { pendente: 'Marcar como revisado', revisado: 'Marcar como corrigido', corrigido: 'Voltar para pendente' };

export default function ReportPage({ selectedMedico, setSelectedMedico, resultados, exportFormat = 'PDF', onExportExcel: exportExcelRaw, onExportPDF: exportPDFRaw, onShare, onNewAudit, onGenerateAI, aiLoading, statuses, setStatuses }) {
  const { compact } = useViewport();
  const toast = useToast();
  const divs      = resultados?.divergencias ?? [];
  const insights  = resultados?.insights     ?? [];

  const getStatus = (id) => statuses[id] ?? "pendente";
  const cycleStatus = (id) => {
    const order = ["pendente","revisado","corrigido"];
    setStatuses((s) => ({ ...s, [id]: order[(order.indexOf(s[id]??order[0])+1)%order.length] }));
  };

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedInsight, setCopiedInsight] = useState(null);
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const visibleDivs = divs.filter((row) => {
    const matchesQuery = !normalizedQuery || String(row.medico || '').toLocaleLowerCase('pt-BR').includes(normalizedQuery);
    const matchesStatus = statusFilter === 'all' || getStatus(row.id) === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const copyInsight = async (text, i) => {
    if (!(await copyText(text))) { toast(COPY_FAIL); return; }
    setCopiedInsight(i);
    setTimeout(() => setCopiedInsight(null), 1500);
  };
  useEffect(() => { setPage(1); }, [query, statusFilter, pageSize, sort]);

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
  const total = Number(resultados.valorTotalRaw);
  const heroValue = Number.isFinite(total) ? formatBRL(total) : resultados.valorTotal;
  const processed = splitDateTime(resultados.processadoEm);
  const pctMedicos = resultados.totalMedicos ? (resultados.medicosComDivergencia / resultados.totalMedicos) * 100 : 0;

  // Exportações são assíncronas (bibliotecas carregadas sob demanda): avisa se falharem.
  const guard = (fn) => () => Promise.resolve(fn?.()).catch(() => toast({ tone: 'error', title: 'Não foi possível exportar', text: 'Tente novamente em instantes.' }));
  const onExportExcel = guard(exportExcelRaw);
  const onExportPDF = guard(exportPDFRaw);
  const excelDefault = exportFormat === 'XLSX';
  const onExportDefault = excelDefault ? onExportExcel : onExportPDF;

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
        <span className="cs-cell-main__sub">{d.detalhes?.length ? `${formatNumber(d.detalhes.length)} ${d.detalhes.length === 1 ? 'paciente' : 'pacientes'}` : 'Sem detalhamento'}</span></span>) },
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
  const openDoctor = (row) => setSelectedMedico({ ...row, status: getStatus(row.id) });
  const clearFilters = () => { setQuery(''); setStatusFilter('all'); };

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
              <Button variant="secondary" icon="download" onClick={onExportDefault} title={`Exportar em ${excelDefault ? 'Excel' : 'PDF'} (formato padrão)`}>{excelDefault ? 'Exportar Excel' : 'Exportar PDF'}</Button>
              <ActionMenu label="Escolher formato de exportação" title="Exportar como" items={exportItems}
                trigger={(p) => <IconButton icon="chevron-down" label="Escolher formato de exportação" variant="secondary" {...p} />} />
            </span>
          )}
          <Button variant="ia" onClick={onGenerateAI} disabled={aiLoading} loading={aiLoading}>{aiLoading ? 'Gerando relatório IA…' : 'Relatório IA'}</Button>
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
            <KpiCard label="Médicos" value={formatNumber(resultados.totalMedicos)} icon="stethoscope" hint="analisados" />
            <KpiCard label="Com divergência" value={formatNumber(resultados.medicosComDivergencia)} icon="triangle-alert" tone="danger" hint={`${formatPercent(pctMedicos)} dos médicos`} />
            <KpiCard label="Divergências" value={formatNumber(Number(resultados.totalDivergencias) || 0)} icon="list-checks" hint="itens a revisar" />
            {compact && <KpiCard label="Revisão" value={`${formatNumber(reviewed)} de ${formatNumber(divs.length)}`} icon="circle-check" tone="success" hint={`${formatNumber(by('corrigido'))} corrigidos`} />}
          </KpiGroup>
        </Card>
        {!compact && (
          <Card className="cs-span-3 cs-md-6">
            <SegmentedMeter title="Progresso da revisão" segments={22}
              value={divs.length ? (by('corrigido') / divs.length) * 100 : 0}
              secondary={divs.length ? (reviewed / divs.length) * 100 : 0}
              valueLabel={`${formatNumber(reviewed)} de ${formatNumber(divs.length)}`}
              label={`Progresso da revisão: ${by('corrigido')} corrigidos, ${by('revisado')} revisados, ${by('pendente')} pendentes`}
              legend={[{ label: 'Corrigidos', swatch: 'chart-1', value: by('corrigido') }, { label: 'Revisados', swatch: 'chart-2', value: by('revisado') }, { label: 'Pendentes', swatch: 'track', value: by('pendente') }]} />
          </Card>
        )}
      </div>

      <Card flush title={<>Médicos com divergências <Count>{formatNumber(divs.length)}</Count></>}
        subtitle="Diferença = Repasse − Produção. Abra um médico para ver os pacientes. O status de revisão vale para esta sessão.">
        {divs.length > 0 && (
          <div className="cs-card-toolbar">
            <div className="cs-toolbar">
              <div className="cs-toolbar__grow" style={compact ? { flexBasis: '100%', maxWidth: 'none' } : { maxWidth: 320 }}>
                <SearchField placeholder="Buscar médico" label="Buscar médico" value={query} onChange={setQuery} />
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
            </div>
            {compact && <span className="cs-count-line" aria-live="polite">Exibindo <b>{formatNumber(visibleDivs.length)}</b> de <b>{formatNumber(divs.length)}</b></span>}
          </div>
        )}
        {divs.length === 0 ? (
          <EmptyState icon="circle-check" title="Nenhuma divergência encontrada.">Os relatórios de produção e repasse estão em plena conformidade.</EmptyState>
        ) : (
          <DataTable caption="Médicos com divergências" rows={pageRows} rowKey={(d) => d.id} columns={columns} sort={sort} onSortChange={setSort}
            selectedKey={selectedMedico?.id} onRowClick={openDoctor}
            empty={<EmptyState icon="search-x" title="Nenhum médico encontrado" actions={<Button variant="secondary" icon="rotate-ccw" onClick={clearFilters}>Limpar filtros</Button>}>Ajuste a busca ou o filtro de status.</EmptyState>}
            primaryAction={(d) => ({ label: 'Detalhar', iconEnd: 'chevron-right', ariaLabel: 'Detalhar ' + titleCase(d.medico), onClick: () => openDoctor(d) })}
            rowActions={(d) => [{ label: NEXT_LABEL[getStatus(d.id)], icon: getStatus(d.id) === 'corrigido' ? 'rotate-ccw' : 'arrow-right', onSelect: () => cycleStatus(d.id) }]}
            mobile={{
              title: (d) => titleCase(d.medico),
              value: (d) => formatBRL(signedDiff(d), { signed: true }),
              meta: (d) => <><span>{d.detalhes?.length ? `${formatNumber(d.detalhes.length)} ${d.detalhes.length === 1 ? 'paciente' : 'pacientes'}` : 'Sem detalhamento'}</span></>,
              tags: (d) => <><DirectionTag direction={signedDiff(d) >= 0 ? 'rep' : 'prod'} short /><StatusBadge status={getStatus(d.id)} size="sm" /></>,
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

      {selectedMedico && (
        <DoctorDrawer medico={selectedMedico} status={getStatus(selectedMedico.id)} onCycle={() => cycleStatus(selectedMedico.id)}
          onClose={() => setSelectedMedico(null)} onCopied={(ok) => toast(ok ? { tone: 'success', title: 'Item copiado' } : COPY_FAIL)} />
      )}
    </>
  );
}

function DoctorDrawer({ medico, status, onCycle, onClose, onCopied }) {
  const { compact } = useViewport();
  const signed = signedDiff(medico);
  const rep = signed >= 0;
  const detalhes = medico.detalhes || [];
  const freq = detalhes.reduce((a, d) => { a[d.tipo] = (a[d.tipo] || 0) + 1; return a; }, {});
  const nextLabel = NEXT_LABEL[status];
  return (
    <Drawer onClose={onClose} eyebrow="Detalhe do médico" title={<span title={medico.medico}>{titleCase(medico.medico)}</span>} label={titleCase(medico.medico)}
      subtitle={detalhes.length ? `${formatNumber(detalhes.length)} ${detalhes.length === 1 ? 'item divergente' : 'itens divergentes'} por paciente` : 'Detalhamento das divergências por paciente'}
      footer={<Button variant="primary" iconEnd={status === 'corrigido' ? 'rotate-ccw' : 'arrow-right'} onClick={onCycle} block={compact}>{nextLabel}</Button>}>
      <div className="cs-row">
        <StatusBadge status={status} />
        <span className="cs-faint" style={{ fontSize: 12 }}>Pendente → Revisado → Corrigido</span>
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
        <div className="cs-tipos" aria-label="Tipos de divergência">
          {Object.entries(freq).map(([tipo, qtd]) => <Badge key={tipo} tone="outline" icon="tag" size="sm">{tipo} ({qtd})</Badge>)}
        </div>
      )}
      <div className="cs-stack" style={{ gap: 12 }}>
        <h3 className="cs-card__title" style={{ fontSize: 14, lineHeight: '20px' }}>Itens por paciente {detalhes.length > 0 && <Count>{detalhes.length}</Count>}</h3>
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
                  <div className="cs-prow__tags"><DirectionTag direction={d >= 0 ? 'rep' : 'prod'} short /></div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
