// Dashboard — mesmos dados e filtros de antes (summarizeAudits), no layout do design system.
import React, { useState } from 'react';
import { summarizeAudits } from '../dashboard';
import {
  Button, IconButton, Card, HeroKpi, KpiGroup, KpiCard, SegmentedMeter, Legend, BarChart, DonutChart, RankingList,
  DataTable, ResultBadge, SegmentedControl, SheetSelect, PageHeader, Callout, EmptyState, ErrorState, Skeleton,
  formatBRL, formatNumber, formatPercent, titleCase, useViewport,
} from '../components/ds/index.js';
import { auditTime, auditValue, auditMonthKey, hasDifferences, auditItemCount, capitalize } from '../lib/display.js';

const PERIODS = [{ id: '3', label: '3 meses' }, { id: '6', label: '6 meses' }, { id: '12', label: '12 meses' }];

export default function DashboardPage({ historico, currentUser, onNewAudit, onOpen, onShowAudits, status = 'ready', onRetry }) {
  const { compact } = useViewport();
  const isAdmin = currentUser?.role === 'admin';
  const [months, setMonths] = useState(6);
  const [scope, setScope] = useState(isAdmin ? 'all' : currentUser?.id);
  const [chartView, setChartView] = useState('chart');
  const auditors = [...new Map(historico.map(row => [row.userId, row.userName || 'Usuário sem nome'])).entries()]
    .filter(([id]) => id).map(([id, name]) => ({ id, name }));
  const summary = summarizeAudits(historico, { months, userId:isAdmin ? scope : currentUser?.id });
  const m = summary.metrics;
  const directionTotal = summary.direction.rep_maior + summary.direction.prod_maior;
  const latest = summary.audits.slice(0, 5);
  const conformes = m.audits - m.auditsWithDifferences;
  // Divide a contagem mensal de summarizeAudits entre "com divergência" e "conformes" (só exibição).
  const withDiffByMonth = summary.audits.reduce((acc, a) => { const k = auditMonthKey(a); if (k && hasDifferences(a)) acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const conformity = m.audits ? (conformes / m.audits) * 100 : 0;

  const scopeOptions = [
    { value: 'all', label: 'Clínica inteira' },
    { value: currentUser?.id, label: 'Minhas auditorias' },
    ...auditors.filter(a => a.id !== currentUser?.id).map(a => ({ value: a.id, label: `Auditor: ${titleCase(a.name)}` })),
  ];
  const periodSelect = <SheetSelect label="Período" icon="calendar" value={String(months)} onChange={(v) => setMonths(Number(v))} options={PERIODS.map(p => ({ value: p.id, label: `Últimos ${p.label}` }))} />;
  const scopeSelect = isAdmin ? <SheetSelect label="Auditorias" icon="building-2" width={220} value={scope} onChange={setScope} options={scopeOptions} /> : null;

  const header = (
    <PageHeader title="Dashboard"
      subtitle={`Volume e desvios das auditorias processadas · últimos ${months} meses`}
      extra={!compact && <>
        <SegmentedControl label="Período" value={String(months)} onChange={(v) => setMonths(Number(v))} options={PERIODS} />
        {scopeSelect}
      </>}
      primary={!compact && <Button variant="primary" icon="plus" onClick={onNewAudit}>Nova auditoria</Button>} />
  );
  const mobileFilters = compact && (
    <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': '16px', marginTop: -4 }}>
      {periodSelect}{scopeSelect}
    </div>
  );

  if (status === 'error') {
    return <>{header}<Card><ErrorState title="Não foi possível carregar as auditorias" onRetry={onRetry} /></Card></>;
  }
  if (status === 'loading') {
    return (
      <>
        {header}{mobileFilters}
        <div className="cs-grid cs-grid--stretch" aria-busy="true">
          {[4, 5, 3].map((span, i) => (
            <Card key={i} className={`cs-span-${span} cs-md-${i === 1 ? 12 : 6}`}>
              <div className="cs-stack"><Skeleton width="40%" /><Skeleton width="70%" height={28} /><Skeleton width="55%" /></div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {mobileFilters}
      <div className="cs-grid cs-grid--stretch">
        <div className="cs-span-4 cs-md-6">
          <HeroKpi label={`Valor divergente · ${months} meses`} icon="banknote" value={formatBRL(m.divergentValue)}
            meta={<span>{formatNumber(m.totalDifferences)} {m.totalDifferences === 1 ? 'divergência' : 'divergências'} em {formatNumber(m.audits)} {m.audits === 1 ? 'auditoria' : 'auditorias'}</span>}
            topAction={<IconButton icon="arrow-up-right" label="Ver auditorias" onClick={onShowAudits} />}
            actions={<>
              <Button variant="light" size="sm" iconEnd="arrow-right" disabled={!latest.length} onClick={() => onOpen(latest[0])}>Abrir última</Button>
              <Button variant="deep" size="sm" onClick={onShowAudits}>Ver auditorias</Button>
            </>} />
        </div>
        <Card className="cs-span-5 cs-md-12" title="Resumo do período" subtitle={`${formatNumber(m.audits)} ${m.audits === 1 ? 'auditoria processada' : 'auditorias processadas'}`}>
          <KpiGroup columns={compact ? 2 : 3}>
            <KpiCard label="Processadas" value={formatNumber(m.audits)} icon="clipboard-check" hint={months === 1 ? 'Último mês' : `Últimos ${months} meses`} />
            <KpiCard label="Com divergência" value={formatNumber(m.auditsWithDifferences)} icon="triangle-alert" tone="danger" hint={`${formatNumber(m.differenceRate)}% das auditorias`} />
            <KpiCard label="Divergências" value={formatNumber(m.totalDifferences)} icon="list-checks" hint="Registros para revisão" />
            {compact && <KpiCard label="Conformidade" value={m.audits ? formatPercent(conformity) : '—'} icon="scale" tone="success" hint={`${formatNumber(conformes)} de ${formatNumber(m.audits)} conformes`} />}
          </KpiGroup>
        </Card>
        {!compact && (
          <Card className="cs-span-3 cs-md-6">
            <SegmentedMeter title="Taxa de conformidade" value={conformity} valueLabel={m.audits ? formatPercent(conformity) : '—'} segments={20}
              label={`Taxa de conformidade: ${m.audits ? formatPercent(conformity) : 'sem auditorias'} das auditorias sem divergência`}
              legend={[{ label: 'Conformes', swatch: 'chart-1', value: formatNumber(conformes) }, { label: 'Com divergência', swatch: 'track', value: formatNumber(m.auditsWithDifferences) }]} />
          </Card>
        )}

        {summary.audits.length === 0 ? (
          <Card className="cs-span-12">
            <EmptyState icon="clipboard-check" title="Nenhuma auditoria neste período."
              actions={<Button variant="primary" icon="plus" onClick={onNewAudit}>Nova auditoria</Button>}>
              Altere os filtros ou inicie uma nova auditoria para ver análises aqui.
            </EmptyState>
          </Card>
        ) : (
          <>
            <Card className="cs-span-8" title="Auditorias por mês" subtitle="Conformes e com divergência, por data de processamento"
              actions={<SegmentedControl label="Visualização" value={chartView} onChange={setChartView} options={[{ id: 'chart', label: 'Gráfico', icon: 'chart-column' }, { id: 'table', label: 'Tabela', icon: 'list-checks' }]} />}>
              <Legend items={[{ label: 'Com divergência', swatch: 'chart-1' }, { label: 'Conformes', swatch: 'chart-2' }, { label: 'Mês em andamento', swatch: 'hatch' }]} />
              <BarChart view={chartView} height={compact ? 220 : 280} caption={`Auditorias processadas por mês, últimos ${months} meses`}
                series={[{ name: 'Com divergência', color: 'chart-1' }, { name: 'Conformes', color: 'chart-2' }]} totalLabel="Total"
                data={summary.months.map((item, i) => { const div = Math.min(withDiffByMonth[item.key] || 0, item.audits); return { label: capitalize(item.label), values: [div, item.audits - div], partial: i === summary.months.length - 1 }; })} />
            </Card>
            <Card className="cs-span-4 cs-md-6" title="Direção dos desvios" subtitle={`${formatNumber(directionTotal)} ${directionTotal === 1 ? 'médico com divergência' : 'médicos com divergência'}, contados por auditoria`}>
              {directionTotal ? (
                <DonutChart centerLabel={directionTotal === 1 ? 'médico' : 'médicos'} parts={[
                  { label: 'Repasse maior', icon: 'arrow-up-right', value: summary.direction.rep_maior, color: 'chart-3', sub: `${formatNumber(Math.round((summary.direction.rep_maior / directionTotal) * 100))}% · pago a mais` },
                  { label: 'Produção maior', icon: 'arrow-down-left', value: summary.direction.prod_maior, color: 'chart-1', sub: `${formatNumber(Math.round((summary.direction.prod_maior / directionTotal) * 100))}% · pago a menos` },
                ]} />
              ) : <EmptyState compact icon="circle-check" title="Sem divergências neste período" />}
              <Callout tone="neutral" icon="info">Repasse maior indica pagamento acima do produzido — priorize na revisão.</Callout>
            </Card>
            <Card className="cs-span-8" flush title="Últimas auditorias" subtitle="Abra um resultado para continuar a revisão ou exportar"
              actions={<Button variant="ghost" size="sm" iconEnd="arrow-right" onClick={onShowAudits}>Ver todas</Button>}>
              <DataTable caption="Últimas auditorias" rows={latest} rowKey={(a) => a.id}
                columns={[
                  { key: 'ref', header: 'Referência', render: (a) => <span className="cs-cell-main"><span className="cs-cell-main__title">{capitalize(a.periodo) || 'Sem referência'}</span>{isAdmin && a.userName && <span className="cs-cell-main__sub">{titleCase(a.userName)}</span>}</span> },
                  { key: 'date', header: 'Data', render: (a) => <span className="cs-cell-main"><span className="cs-num">{a.data || '—'}</span>{auditTime(a) && <span className="cs-cell-main__sub cs-num">{auditTime(a)}</span>}</span> },
                  { key: 'res', header: 'Resultado', render: (a) => <ResultBadge divergences={auditItemCount(a)} /> },
                  { key: 'value', header: 'Valor divergente', align: 'right', render: (a) => (auditValue(a) ? formatBRL(auditValue(a)) : <span className="cs-faint">—</span>) },
                ]}
                primaryAction={(a) => ({ label: 'Abrir', iconEnd: 'chevron-right', ariaLabel: 'Abrir ' + (a.periodo || 'auditoria'), onClick: () => onOpen(a) })}
                onRowClick={onOpen}
                mobile={{ title: (a) => capitalize(a.periodo) || 'Sem referência', value: (a) => (auditValue(a) ? formatBRL(auditValue(a)) : '—'), meta: (a) => <><span className="cs-num">{a.data || '—'}</span>{isAdmin && a.userName && <span>{titleCase(a.userName)}</span>}</>, tags: (a) => <ResultBadge divergences={auditItemCount(a)} size="sm" /> }} />
            </Card>
            <Card className="cs-span-4 cs-md-6" title="Maiores impactos" subtitle="Médicos com maior valor divergente">
              {summary.topDoctors.length
                ? <RankingList items={summary.topDoctors.map((d) => ({ id: d.name, name: d.name, value: d.value }))} />
                : <EmptyState compact icon="circle-check" title="Sem divergências neste período." />}
            </Card>
          </>
        )}
      </div>
    </>
  );
}
