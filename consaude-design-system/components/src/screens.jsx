// ConSaúde — reference screens composed only from the system's components. Same code renders desktop, tablet and mobile.
import { cx, Icon, Button, IconButton, Badge, Count, StatusBadge, ResultBadge, ProfileBadge, DirectionTag, DiffValue, Avatar, formatBRL, formatNumber, formatPercent, titleCase, useViewport, STATUS_FLOW } from './core.jsx';
import { Modal, ConfirmDialog, AiProgressModal, Drawer, ActionMenu, Toast, ToastStack } from './overlays.jsx';
import { Tabs, FilterChips, SelectChip, SegmentedControl, TextField, SearchField, Select, SelectField, MaskedField, CurrencyField, Checkbox, Accordion, Callout, EmptyState, Dropzone, UploadProgress, Field } from './forms.jsx';
import { Card, KpiCard, KpiGroup, HeroKpi, HeroChip, StatStrip, SegmentedMeter, Legend, BarChart, DonutChart, RankingList, DataTable, Pagination } from './data.jsx';
import { AppShell, PageHeader, ActionBar, SettingsSection } from './layout.jsx';
import { MONTHLY, MONTHLY_SERIES, DIRECTION, AUDITS, DOCTORS, PATIENTS, TOP_IMPACT, USERS, AI_STEPS } from './demo-data.js';
const React = window.React;
const { useState } = React;

const auditActions = (a) => [
  { label: 'Exportar Excel', icon: 'file-spreadsheet', variant: 'export' },
  { label: 'Exportar PDF', icon: 'file-text' },
  { label: a.ia ? 'Ver relatório IA' : 'Gerar relatório IA', icon: 'sparkles', variant: 'ia' },
  { separator: true },
  { label: 'Excluir auditoria', icon: 'trash-2', variant: 'danger' },
];

/* ═════════════ Dashboard ═════════════ */
export function DashboardScreen(props) {
  return (
    <AppShell active="dashboard" crumbs={[{ label: 'Início' }, { label: 'Dashboard' }]} title="Dashboard" {...props}>
      <DashboardBody />
    </AppShell>
  );
}
function DashboardBody() {
  const { compact } = useViewport();
  const [chartView, setChartView] = useState('chart');
  const recent = AUDITS.slice(0, 5);
  const totalDiv = DIRECTION.rep.count + DIRECTION.prod.count;
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral das auditorias da clínica · abril a setembro de 2026"
        extra={!compact && <>
          <SegmentedControl label="Período" defaultValue="6" options={[{ id: '3', label: '3 meses' }, { id: '6', label: '6 meses' }, { id: '12', label: '12 meses' }]} />
          <div style={{ width: 196 }}><Select aria-label="Auditorias" pill prefixIcon="building-2" options={[{ value: 'all', label: 'Clínica inteira' }, { value: 'me', label: 'Minhas auditorias' }, { value: 'bruno', label: 'Auditor: Bruno Carvalho' }]} /></div>
        </>}
        primary={!compact && <Button variant="primary" icon="plus">Nova auditoria</Button>} />
      {compact && (
        <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': '16px', marginTop: -4 }}>
          <SelectChip icon="calendar" value="6 meses" aria-label="Período: 6 meses" />
          <SelectChip icon="building-2" value="Clínica inteira" aria-label="Auditorias: clínica inteira" />
        </div>
      )}
      <div className="cs-grid cs-grid--stretch">
        <div className="cs-span-4 cs-md-6">
          <HeroKpi label="Valor divergente · 6 meses" icon="banknote" value={formatBRL(38521.16)}
            chip={<HeroChip icon="trending-up">8,2%</HeroChip>} meta={<span>vs. 6 meses anteriores · 212 divergências</span>}
            topAction={<IconButton icon="arrow-up-right" label="Ver auditorias com divergência" />}
            actions={<><Button variant="light" size="sm" iconEnd="arrow-right">Abrir última</Button><Button variant="deep" size="sm">Ver auditorias</Button></>} />
        </div>
        <Card className="cs-span-5 cs-md-12" title="Resumo do período" subtitle="24 auditorias processadas">
          <KpiGroup columns={compact ? 2 : 3}>
            <KpiCard label="Concluídas" value="24" icon="clipboard-check" delta={{ value: '+3', direction: 'up', good: true, label: 'vs. período anterior' }} hint="vs. 21 no período anterior" />
            <KpiCard label="Com divergência" value="9" icon="triangle-alert" tone="danger" hint="37,5% das auditorias" />
            <KpiCard label="Divergências" value="212" icon="list-checks" hint="média de 23,6 por auditoria" />
            {compact && <KpiCard label="Conformidade" value="62,5%" icon="scale" tone="success" hint="15 de 24 conformes" />}
          </KpiGroup>
        </Card>
        {!compact && (
          <Card className="cs-span-3 cs-md-6">
            <SegmentedMeter title="Taxa de conformidade" value={62.5} valueLabel="62,5%" segments={20} label="Taxa de conformidade: 62,5% das auditorias sem divergência"
              legend={[{ label: 'Conformes', swatch: 'chart-1', value: 15 }, { label: 'Com divergência', swatch: 'track', value: 9 }]} />
          </Card>
        )}
        <Card className="cs-span-8" title="Auditorias por mês" subtitle="Conformes e com divergência, por data de processamento"
          actions={<><SegmentedControl label="Visualização" value={chartView} onChange={setChartView} options={[{ id: 'chart', label: 'Gráfico', icon: 'chart-column' }, { id: 'table', label: 'Tabela', icon: 'list-checks' }]} /></>}>
          <Legend items={[{ label: 'Com divergência', swatch: 'chart-1' }, { label: 'Conformes', swatch: 'chart-2' }, { label: 'Mês em andamento', swatch: 'hatch' }]} />
          <BarChart data={MONTHLY} series={MONTHLY_SERIES} height={compact ? 220 : 290} view={chartView} caption="Auditorias por mês, abril a setembro de 2026" totalLabel="Total" />
        </Card>
        <Card className="cs-span-4 cs-md-6" title="Direção dos desvios" subtitle={`${formatNumber(totalDiv)} divergências · 6 meses`}>
          <DonutChart centerLabel="divergências" parts={[
            { label: 'Repasse maior', icon: 'arrow-up-right', value: DIRECTION.rep.count, color: 'chart-3', sub: `${formatBRL(DIRECTION.rep.value)} pagos a mais · 60%` },
            { label: 'Produção maior', icon: 'arrow-down-left', value: DIRECTION.prod.count, color: 'chart-1', sub: `${formatBRL(DIRECTION.prod.value)} pagos a menos · 40%` },
          ]} />
          <Callout tone="neutral" icon="info">Repasse maior indica pagamento acima do produzido — priorize na revisão.</Callout>
        </Card>
        <Card className="cs-span-8" flush title="Últimas auditorias" subtitle="5 mais recentes"
          actions={<><Button variant="ghost" size="sm" iconEnd="arrow-right">Ver todas</Button></>}>
          <DataTable caption="Últimas auditorias" rows={recent}
            columns={[
              { key: 'ref', header: 'Referência', render: (a) => <span className="cs-cell-main"><span className="cs-cell-main__title">{a.ref}</span><span className="cs-cell-main__sub">{titleCase(a.auditor)}</span></span> },
              { key: 'date', header: 'Data', render: (a) => <span className="cs-cell-main"><span className="cs-num">{a.date}</span><span className="cs-cell-main__sub cs-num">{a.time}</span></span> },
              { key: 'res', header: 'Resultado', render: (a) => <ResultBadge divergences={a.divergences} /> },
              { key: 'value', header: 'Valor divergente', align: 'right', render: (a) => (a.value ? formatBRL(a.value) : <span className="cs-faint">—</span>) },
            ]}
            primaryAction={(a) => ({ label: 'Abrir', iconEnd: 'chevron-right', ariaLabel: 'Abrir ' + a.ref })}
            onRowClick={() => {}}
            mobile={{ title: (a) => a.ref, value: (a) => (a.value ? formatBRL(a.value) : '—'), meta: (a) => <><span>{a.date}</span><span>{titleCase(a.auditor)}</span></>, tags: (a) => <ResultBadge divergences={a.divergences} size="sm" /> }} />
        </Card>
        <Card className="cs-span-4 cs-md-6" title="Maiores impactos" subtitle="Médicos com maior valor divergente" actions={<IconButton icon="arrow-up-right" label="Ver ranking completo" size="sm" />}>
          <RankingList items={TOP_IMPACT} onSelect={() => {}} />
        </Card>
      </div>
    </>
  );
}

/* ═════════════ Auditorias ═════════════ */
export function AuditoriasScreen({ tab = 'lista', openActionsFor, dragover, ...props }) {
  return (
    <AppShell active="auditorias" crumbs={[{ label: 'Início' }, { label: 'Auditorias' }]} title="Auditorias" {...props}>
      <AuditoriasBody tab={tab} openActionsFor={openActionsFor} dragover={dragover} />
    </AppShell>
  );
}
function AuditoriasBody({ tab: initial, openActionsFor, dragover }) {
  const { compact } = useViewport();
  const [tab, setTab] = useState(initial);
  return (
    <>
      <PageHeader title="Auditorias" subtitle="Cruze Produção × Repasse e acompanhe cada auditoria salva"
        primary={!compact && tab === 'lista' && <Button variant="primary" icon="plus" onClick={() => setTab('nova')}>Nova auditoria</Button>} />
      <Tabs label="Auditorias" value={tab} onChange={setTab} fill={compact} tabs={[{ id: 'lista', label: 'Minhas auditorias', count: 24 }, { id: 'nova', label: 'Nova auditoria', icon: 'plus' }]} />
      {tab === 'lista' ? <AuditList openActionsFor={openActionsFor} /> : <NewAudit dragover={dragover} />}
    </>
  );
}
function AuditList({ openActionsFor }) {
  const { compact } = useViewport();
  return (
    <>
      <StatStrip items={[
        { label: 'Auditorias salvas', value: '24', icon: 'clipboard-check' },
        { label: 'Com divergências', value: '9', sub: '37,5%', icon: 'triangle-alert', tone: 'danger' },
        { label: 'Divergências', value: '212', icon: 'list-checks' },
        { label: 'Relatórios IA', value: '6', icon: 'sparkles', tone: 'ia' },
      ]} />
      <Card flush>
        <div style={{ padding: compact ? '16px 16px 12px' : '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="cs-toolbar">
            <div className="cs-toolbar__grow" style={compact ? { maxWidth: 'none', flexBasis: '100%' } : undefined}><SearchField placeholder="Buscar referência, arquivo ou auditor" /></div>
            {!compact && <div style={{ width: 188 }}><Select aria-label="Escopo" options={[{ value: 'minhas', label: 'Minhas auditorias' }, { value: 'todas', label: 'Clínica inteira' }]} /></div>}
            {!compact && <div className="cs-toolbar__end"><span className="cs-count-line">Exibindo <b>8</b> de <b>24</b></span></div>}
          </div>
          <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px' }}>
            {compact && <SelectChip value="Minhas" icon="user" aria-label="Escopo: minhas auditorias" />}
            <FilterChips label="Filtrar auditorias" defaultValue="todas" options={[{ id: 'todas', label: 'Todas', count: 24 }, { id: 'div', label: 'Com divergências', count: 9, icon: 'triangle-alert' }, { id: 'ok', label: 'Conformes', count: 15, icon: 'circle-check' }, { id: 'ia', label: 'Com relatório IA', count: 6, icon: 'sparkles' }]} />
          </div>
          {compact && <span className="cs-count-line">Exibindo <b>8</b> de <b>24</b></span>}
        </div>
        <DataTable caption="Minhas auditorias" rows={AUDITS} defaultSort={null}
          columns={[
            { key: 'date', header: 'Data', sortable: true, sortValue: (a) => a.id, render: (a) => <span className="cs-cell-main"><span className="cs-num">{a.date}</span><span className="cs-cell-main__sub cs-num">{a.time}</span></span> },
            { key: 'ref', header: 'Referência', sortable: true, render: (a) => <span className="cs-cell-main"><span className="cs-cell-main__title">{a.ref}</span><span className="cs-cell-main__sub">{a.scope}</span></span> },
            { key: 'files', header: 'Arquivos', priority: 3, render: (a) => <span className="cs-cell-main" style={{ maxWidth: 220 }}>{a.files.map((f) => <span key={f} className="cs-mono cs-truncate" title={f} style={{ color: 'var(--ink-2)' }}>{f}</span>)}</span> },
            { key: 'auditor', header: 'Auditor', priority: 2, render: (a) => <span className="cs-cell-person"><Avatar name={a.auditor} size="sm" /><span className="cs-truncate">{titleCase(a.auditor)}</span></span> },
            { key: 'res', header: 'Resultado', sortable: true, sortValue: (a) => a.divergences, render: (a) => <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}><ResultBadge divergences={a.divergences} />{a.ia && <Badge tone="ia" icon="sparkles" size="sm" title="Relatório IA disponível">IA</Badge>}</span> },
            { key: 'value', header: 'Valor divergente', align: 'right', sortable: true, render: (a) => (a.value ? formatBRL(a.value) : <span className="cs-faint">—</span>) },
          ]}
          primaryAction={(a) => ({ label: 'Abrir', iconEnd: 'chevron-right', ariaLabel: 'Abrir ' + a.ref })}
          rowActions={auditActions} onRowClick={() => {}}
          mobile={{
            title: (a) => a.ref, value: (a) => (a.value ? formatBRL(a.value) : '—'),
            meta: (a) => <><span className="cs-num">{a.date}</span><span>{titleCase(a.auditor)}</span></>,
            tags: (a) => <><ResultBadge divergences={a.divergences} size="sm" />{a.ia && <Badge tone="ia" icon="sparkles" size="sm">IA</Badge>}</>,
          }}
          openActionsFor={openActionsFor}
          footer={<Pagination page={1} pageSize={8} total={24} compact={compact} onPageSize={() => {}} />} />
      </Card>
    </>
  );
}
function NewAudit({ dragover }) {
  const { compact } = useViewport();
  return (
    <div className="cs-grid">
      <div className="cs-span-8 cs-stack" style={{ gap: compact ? 16 : 20 }}>
        <UploadProgress done={1} total={2} />
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: compact ? 12 : 20 }}>
          <Dropzone step={1} title="Relatório de Produção" subtitle="O que cada médico produziu no período" file={{ name: 'producao_set-2026.xlsx', size: 184320, rows: 1284, columns: ['Médico', 'Paciente', 'Data', 'Procedimento', 'Valor'] }} />
          <Dropzone step={2} title="Relatório de Repasse" subtitle="O que foi pago a cada médico" state={dragover ? 'dragover' : undefined} />
        </div>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 16 }}>
            <TextField label="Referência da auditoria" optional placeholder="Ex.: Setembro/2026" defaultValue="Setembro/2026" help="Período ou competência. Aparece nos relatórios e exportações." prefixIcon="calendar" />
            <SelectField label="Escopo" options={[{ value: 'all', label: 'Clínica inteira' }, { value: 'plantao', label: 'Plantões' }, { value: 'marco', label: 'Unidade Marco' }]} help="Ajuda a filtrar auditorias depois." />
          </div>
        </Card>
        <Accordion items={[{
          id: 'opt', icon: 'sliders-horizontal', title: 'Opções de comparação', subtitle: 'Tolerância R$ 0,50 · por médico e paciente · ignora acentos',
          content: (
            <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 16 }}>
              <CurrencyField label="Tolerância desta auditoria" defaultValue={0.5} help="Diferenças até este valor contam como conformes. Padrão da clínica: R$ 0,50." />
              <SelectField label="Cruzar por" options={[{ value: 'mp', label: 'Médico + paciente + data' }, { value: 'm', label: 'Somente médico' }]} />
              <Checkbox defaultChecked label="Ignorar acentos e maiúsculas nos nomes" description="“JOSÉ” e “Jose” contam como a mesma pessoa." />
              <Checkbox label="Considerar glosas do repasse" description="Itens glosados entram como divergência." />
            </div>
          ),
        }]} />
      </div>
      <Card className="cs-span-4" title="Como funciona" icon="circle-help">
        <ol className="cs-steps">
          <li className="cs-step cs-step--done"><span className="cs-step__mark"><Icon name="check" strokeWidth={2.4} /></span>Envie o relatório de Produção</li>
          <li className="cs-step cs-step--active"><span className="cs-step__mark" style={{ boxShadow: 'inset 0 0 0 1.5px var(--accent)', color: 'var(--accent-text)', fontWeight: 600, fontSize: 12 }}>2</span>Envie o relatório de Repasse</li>
          <li className="cs-step"><span className="cs-step__mark" style={{ fontSize: 12 }}>3</span>Processe e revise as divergências</li>
        </ol>
        <Callout tone="info" title="Formatos aceitos">.xlsx, .xls ou .csv com colunas de médico, paciente, data e valor. A primeira linha deve ser o cabeçalho.</Callout>
      </Card>
      <div className="cs-span-12">
        <ActionBar icon="info" message={<span>Falta o <b style={{ color: 'var(--ink)' }}>Relatório de Repasse</b> para processar.</span>}>
          {!compact && <Button variant="ghost">Cancelar</Button>}
          <Button variant="primary" icon="refresh-cw" disabled>Processar auditoria</Button>
        </ActionBar>
      </div>
    </div>
  );
}

/* ═════════════ Relatório ═════════════ */
export function RelatorioScreen({ drawer = false, ai = false, confirm = false, ...props }) {
  const [open, setOpen] = useState(drawer);
  return (
    <AppShell active="auditorias" crumbs={[{ label: 'Auditorias' }, { label: 'Setembro/2026' }]} title="Setembro/2026" back={{ label: 'Voltar para auditorias' }} {...props}>
      <RelatorioBody openDoctor={() => setOpen(true)} selected={open ? 'd1' : null} />
      {open && <DoctorDrawer onClose={() => setOpen(false)} />}
      {ai && <AiProgressModal steps={AI_STEPS} progress={46} onBackground={() => {}} autoFocus={false} />}
      {confirm && <ConfirmDialog autoFocus={false} onClose={() => {}} title="Excluir a auditoria Setembro/2026?" description="Os 37 itens divergentes, os status de revisão e o relatório IA desta auditoria serão apagados. Os arquivos originais não são afetados." confirmLabel="Excluir auditoria" />}
    </AppShell>
  );
}
function RelatorioBody({ openDoctor, selected }) {
  const { compact } = useViewport();
  const total = DOCTORS.reduce((a, d) => a + Math.abs(d.diff), 0);
  const items = DOCTORS.reduce((a, d) => a + d.items, 0);
  const by = (s) => DOCTORS.filter((d) => d.status === s).length;
  const more = [
    ...(compact ? [{ label: 'Exportar Excel', icon: 'file-spreadsheet', variant: 'export' }, { label: 'Exportar PDF', icon: 'file-text' }] : []),
    { label: 'Copiar resumo', icon: 'copy' }, { label: 'Nova auditoria', icon: 'plus' }, { separator: true }, { label: 'Excluir auditoria', icon: 'trash-2', variant: 'danger' },
  ];
  return (
    <>
      <div className="cs-pagehead">
        <div className="cs-pagehead__titles">
          <span className="cs-pagehead__eyebrow"><Icon name="file-search" size={14} />Relatório de auditoria</span>
          <h1 className="cs-pagehead__title">Setembro/2026 <ResultBadge divergences={items} /></h1>
          <div className="cs-pagehead__meta">
            <span><Icon name="calendar" />Processada em 26/09/2026 às 14:32</span>
            <span><Icon name="file-spreadsheet" /><span className="cs-truncate">producao_set-2026.xlsx · repasse_set-2026.xlsx</span></span>
            <span><Icon name="user" />Ana Paula Lima</span>
          </div>
        </div>
        <div className="cs-pagehead__actions">
          {!compact && <ActionMenu label="Exportar" items={[{ label: 'Excel (.xlsx)', icon: 'file-spreadsheet', variant: 'export', hint: 'padrão' }, { label: 'PDF', icon: 'file-text' }]}
            trigger={(p) => <Button variant="secondary" icon="download" iconEnd="chevron-down" {...p}>Exportar</Button>} />}
          <Button variant="ia">Relatório IA</Button>
          <ActionMenu items={more} label="Mais ações da auditoria" title="Ações da auditoria" trigger={(p) => <IconButton icon="ellipsis" label="Mais ações" variant="secondary" round {...p} />} />
        </div>
      </div>
      <div className="cs-grid cs-grid--stretch">
        <div className="cs-span-4 cs-md-6">
          <HeroKpi label="Valor divergente total" icon="banknote" value={formatBRL(total)} chip={<HeroChip icon="triangle-alert">{items} divergências</HeroChip>}
            meta={<span>em 11 de 42 médicos analisados</span>}
            actions={<><Button variant="light" size="sm" icon="copy">Copiar resumo</Button></>} />
        </div>
        <Card className="cs-span-5 cs-md-12" title="Resumo">
          <KpiGroup columns={compact ? 2 : 3}>
            <KpiCard label="Médicos analisados" value="42" icon="stethoscope" />
            <KpiCard label="Com divergência" value="11" icon="triangle-alert" tone="danger" hint="26,2% dos médicos" />
            <KpiCard label="Total de divergências" value={String(items)} icon="list-checks" hint="itens a revisar" />
            {compact && <KpiCard label="Revisão" value="6 de 11" icon="circle-check" tone="success" hint="2 corrigidos" />}
          </KpiGroup>
        </Card>
        {!compact && (
          <Card className="cs-span-3 cs-md-6">
            <SegmentedMeter title="Progresso da revisão" value={(by('corrigido') / 11) * 100} secondary={((by('corrigido') + by('revisado')) / 11) * 100} segments={22} valueLabel={`${by('corrigido') + by('revisado')} de 11`}
              label="Progresso da revisão: 2 corrigidos, 4 revisados, 5 pendentes"
              legend={[{ label: 'Corrigidos', swatch: 'chart-1', value: by('corrigido') }, { label: 'Revisados', swatch: 'chart-2', value: by('revisado') }, { label: 'Pendentes', swatch: 'track', value: by('pendente') }]} />
          </Card>
        )}
      </div>
      <Card flush title={<>Médicos com divergências <Count>{DOCTORS.length}</Count></>} subtitle="Diferença = Repasse − Produção. Clique na linha para ver os pacientes."
        actions={!compact && <div style={{ width: 208 }}><Select aria-label="Ordenar" size="sm" prefixIcon="arrow-up-down" options={[{ value: 'diff', label: 'Maior diferença' }, { value: 'name', label: 'Nome (A–Z)' }, { value: 'items', label: 'Mais itens' }]} /></div>}>
        <div style={{ padding: compact ? '0 16px 12px' : '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div className="cs-toolbar__grow" style={compact ? { flexBasis: '100%', maxWidth: 'none' } : { maxWidth: 320 }}><SearchField placeholder="Buscar médico" /></div>
          <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px', flex: compact ? '1 1 100%' : undefined, minWidth: 0 }}>
            <FilterChips label="Status de revisão" defaultValue="todos" options={[{ id: 'todos', label: 'Todos', count: 11 }, { id: 'pendente', label: 'Pendentes', count: by('pendente'), icon: 'clock' }, { id: 'revisado', label: 'Revisados', count: by('revisado'), icon: 'eye' }, { id: 'corrigido', label: 'Corrigidos', count: by('corrigido'), icon: 'circle-check' }]} />
          </div>
        </div>
        <DataTable caption="Médicos com divergências" rows={[...DOCTORS].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))} selectedKey={selected} onRowClick={openDoctor}
          columns={[
            { key: 'name', header: 'Médico', sortable: true, render: (d) => <span className="cs-cell-main"><span className="cs-cell-main__title" title={d.name}>{titleCase(d.name)}</span><span className="cs-cell-main__sub">{d.patients} pacientes</span></span> },
            { key: 'prod', header: 'Produção', align: 'right', sortable: true, priority: 2, render: (d) => formatBRL(d.prod) },
            { key: 'rep', header: 'Repasse', align: 'right', sortable: true, priority: 2, render: (d) => formatBRL(d.rep) },
            { key: 'diff', header: 'Diferença', align: 'right', sortable: true, sortValue: (d) => Math.abs(d.diff), render: (d) => <DiffValue value={d.diff} /> },
            { key: 'items', header: 'Itens', align: 'center', sortable: true, render: (d) => <Count>{d.items}</Count> },
            { key: 'status', header: 'Status', sortable: true, render: (d) => <StatusBadge status={d.status} /> },
          ]}
          primaryAction={(d) => ({ label: 'Detalhar', iconEnd: 'chevron-right', ariaLabel: 'Detalhar ' + titleCase(d.name), onClick: openDoctor })}
          rowActions={(d) => [{ label: d.status === 'corrigido' ? 'Voltar para pendente' : 'Avançar status', icon: 'arrow-right' }, { label: 'Copiar resumo do médico', icon: 'copy' }]}
          mobile={{ title: (d) => titleCase(d.name), value: (d) => formatBRL(d.diff, { signed: true }), meta: (d) => <><span>{d.patients} pacientes</span><span>{d.items} itens</span></>, tags: (d) => <><DirectionTag direction={d.diff >= 0 ? 'rep' : 'prod'} short /><StatusBadge status={d.status} size="sm" /></> }} />
      </Card>
    </>
  );
}
export function DoctorDrawer({ onClose, doctor = DOCTORS[0] }) {
  const { compact } = useViewport();
  const rep = doctor.diff >= 0;
  const next = STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(doctor.status) + 1, 2)];
  return (
    <Drawer onClose={onClose} autoFocus={false} eyebrow="Detalhe do médico" title={titleCase(doctor.name)} subtitle={`${doctor.patients} pacientes · ${doctor.items} itens divergentes`}
      footer={<><Button variant="secondary" icon="copy">{compact ? 'Copiar' : 'Copiar resumo'}</Button><Button variant="primary" iconEnd="arrow-right">{compact ? 'Marcar ' : 'Marcar como '}{next === 'revisado' ? 'revisado' : 'corrigido'}</Button></>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <StatusBadge status={doctor.status} />
        <span className="cs-faint" style={{ fontSize: 12 }}>Pendente → Revisado → Corrigido</span>
      </div>
      <div className="cs-sumgrid">
        <div className="cs-sum"><span className="cs-sum__label">Produção</span><span className="cs-sum__value">{formatBRL(doctor.prod)}</span></div>
        <div className="cs-sum"><span className="cs-sum__label">Repasse</span><span className="cs-sum__value">{formatBRL(doctor.rep)}</span></div>
        <div className={cx('cs-sum', rep ? 'cs-sum--emph' : 'cs-sum--emph-prod')}><span className="cs-sum__label">Diferença</span><span className="cs-sum__value">{formatBRL(doctor.diff, { signed: true })}</span></div>
      </div>
      <Callout tone="neutral" icon={rep ? 'arrow-up-right' : 'arrow-down-left'} title={rep ? 'Repasse maior que a produção' : 'Produção maior que o repasse'}>
        {rep ? `${formatBRL(doctor.diff)} pagos a mais. Confirme com o faturamento antes de corrigir.` : `${formatBRL(-doctor.diff)} pagos a menos. Avalie complemento de repasse.`}
      </Callout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <h3 className="cs-card__title" style={{ fontSize: 14, lineHeight: '20px' }}>Itens por paciente <Count>{PATIENTS.length}</Count></h3>
          <Button variant="ghost" size="sm" icon="copy">Copiar todos</Button>
        </div>
        <ul className="cs-plist">
          {PATIENTS.map((p) => (
            <li className="cs-prow" key={p.id}>
              <span className="cs-prow__name cs-truncate" title={p.name}>{titleCase(p.name)}<span className="cs-faint" style={{ display: 'block', fontSize: 12, lineHeight: '16px', fontWeight: 400 }}>{p.date} · {p.proc}</span></span>
              <IconButton icon="copy" size="sm" label={`Copiar item de ${titleCase(p.name)}`} />
              <div className="cs-prow__vals">
                <span>Produção<b>{p.prod ? formatBRL(p.prod) : '—'}</b></span>
                <span>Repasse<b>{formatBRL(p.rep)}</b></span>
                <span>Diferença<b>{formatBRL(p.diff, { signed: true })}</b></span>
              </div>
              <div className="cs-prow__tags"><DirectionTag direction={p.diff >= 0 ? 'rep' : 'prod'} short /><Badge tone="outline" size="sm">{p.type}</Badge></div>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
}

/* ═════════════ Usuários ═════════════ */
export function UsuariosScreen({ openActionsFor, ...props }) {
  return (
    <AppShell active="usuarios" crumbs={[{ label: 'Administração' }, { label: 'Usuários e acessos' }]} title="Usuários" {...props}>
      <UsuariosBody openActionsFor={openActionsFor} />
    </AppShell>
  );
}
function UsuariosBody({ openActionsFor }) {
  const { compact } = useViewport();
  const userActions = (u) => [
    ...(compact ? [{ label: 'Editar', icon: 'pencil' }] : []),
    u.status === 'senha-pendente' ? { label: 'Reenviar convite', icon: 'mail' } : { label: 'Redefinir senha', icon: 'key-round' },
    { separator: true },
    u.status === 'desativado' ? { label: 'Reativar acesso', icon: 'user-check' } : { label: 'Desativar acesso', icon: 'user-x', variant: 'danger', disabled: u.me },
  ];
  return (
    <>
      <PageHeader title="Usuários e acessos" subtitle="Quem acessa o ConSaúde e com qual perfil" primary={<Button variant="primary" icon="user-plus">Novo usuário</Button>} />
      <StatStrip items={[
        { label: 'Contas cadastradas', value: '7', icon: 'users' },
        { label: 'Acessos ativos', value: '5', icon: 'circle-check', tone: 'success' },
        { label: 'Administradores', value: '2', icon: 'shield-check', tone: 'accent' },
        { label: 'Requer atenção', value: '1', sub: 'senha pendente', icon: 'triangle-alert', tone: 'warning' },
      ]} />
      <Card flush>
        <div style={{ padding: compact ? '16px 16px 12px' : '20px 20px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div className="cs-toolbar__grow" style={compact ? { flexBasis: '100%', maxWidth: 'none' } : { maxWidth: 320 }}><SearchField placeholder="Buscar nome ou e-mail" /></div>
          <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px', flex: compact ? '1 1 100%' : undefined, minWidth: 0 }}>
            <FilterChips label="Filtrar usuários" defaultValue="todos" options={[{ id: 'todos', label: 'Todos', count: 7 }, { id: 'ativos', label: 'Ativos', count: 5 }, { id: 'admin', label: 'Administradores', count: 2 }, { id: 'senha', label: 'Senha pendente', count: 1 }, { id: 'off', label: 'Desativados', count: 1 }]} />
          </div>
        </div>
        <DataTable caption="Usuários" rows={USERS} openActionsFor={openActionsFor}
          columns={[
            { key: 'name', header: 'Usuário', sortable: true, render: (u) => (
              <span className="cs-cell-person">
                <Avatar name={u.name} off={u.status === 'desativado'} />
                <span className="cs-cell-main" style={{ minWidth: 0, maxWidth: 300 }}>
                  <span className="cs-cell-main__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{titleCase(u.name)}{u.me && <Badge tone="accent" size="sm">Sua conta</Badge>}</span>
                  <span className="cs-cell-main__sub cs-truncate" title={u.email}>{u.email}</span>
                </span>
              </span>) },
            { key: 'role', header: 'Cargo', priority: 2, render: (u) => <span className="cs-muted">{u.role}</span> },
            { key: 'profile', header: 'Perfil', sortable: true, render: (u) => <ProfileBadge profile={u.profile} /> },
            { key: 'status', header: 'Status', sortable: true, render: (u) => <StatusBadge status={u.status} /> },
            { key: 'created', header: 'Criado em', priority: 3, render: (u) => <span className="cs-num cs-muted">{u.created}</span> },
          ]}
          primaryAction={(u) => ({ label: 'Editar', icon: 'pencil', ariaLabel: 'Editar ' + titleCase(u.name) })}
          rowActions={userActions}
          mobile={{ title: (u) => titleCase(u.name), meta: (u) => <span className="cs-truncate" style={{ maxWidth: '100%' }}>{u.email}</span>, tags: (u) => <>{u.me && <Badge tone="accent" size="sm">Sua conta</Badge>}<ProfileBadge profile={u.profile} /><StatusBadge status={u.status} size="sm" /></> }} />
      </Card>
    </>
  );
}

/* ═════════════ Configurações ═════════════ */
export function ConfiguracoesScreen({ cnpjError, ...props }) {
  return (
    <AppShell active="configuracoes" crumbs={[{ label: 'Administração' }, { label: 'Configurações' }]} title="Configurações" {...props}>
      <ConfigBody cnpjError={cnpjError} />
    </AppShell>
  );
}
function ConfigBody({ cnpjError }) {
  const { compact } = useViewport();
  return (
    <>
      <PageHeader title="Configurações" subtitle="Dados da clínica e padrões aplicados às novas auditorias" />
      <Card>
        <SettingsSection title="Identificação da clínica" description="Aparece no cabeçalho dos relatórios exportados e do relatório IA.">
          <TextField className="cs-full" label="Nome da clínica" defaultValue="Clínica Integrada São Lucas" />
          <MaskedField mask="cnpj" label="CNPJ" defaultValue="12345678000190" error={cnpjError ? 'CNPJ inválido. Confira os 14 dígitos.' : undefined} />
          <TextField label="E-mail de relatórios" type="email" defaultValue="auditoria@clinicasaolucas.com.br" help="Recebe uma cópia de cada exportação." prefixIcon="mail" />
        </SettingsSection>
        <SettingsSection title="Preferências de auditoria" description="Valem para novas auditorias. As já processadas mantêm as regras usadas na época.">
          <CurrencyField label="Tolerância de divergência" defaultValue={0.5} help="Diferenças até este valor contam como conformes." />
          <Field label="Formato padrão de exportação" help="Usado no botão Exportar e no envio por e-mail.">
            <SegmentedControl label="Formato padrão de exportação" defaultValue="xlsx" block options={[{ id: 'xlsx', label: 'Excel', icon: 'file-spreadsheet' }, { id: 'pdf', label: 'PDF', icon: 'file-text' }]} />
          </Field>
          <div className="cs-full"><Callout tone="info" title="Como a tolerância funciona">Com R$ 0,50, uma diferença de R$ 0,30 entre Produção e Repasse não vira divergência. Use 0 para exigir valores idênticos.</Callout></div>
        </SettingsSection>
      </Card>
      <ActionBar icon="circle-alert" message="Você tem alterações não salvas.">
        {!compact && <Button variant="ghost">Descartar</Button>}
        <Button variant="primary" icon="check">Salvar configurações</Button>
      </ActionBar>
    </>
  );
}
