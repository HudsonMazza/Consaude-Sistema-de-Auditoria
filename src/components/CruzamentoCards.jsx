// Cards do cruzamento com o Fechamento de Caixa e das guias de convênio não enviadas (resultados.cruzamento,
// montado em src/lib/cruzamento.js). Auditorias antigas não têm `cruzamento`: o relatório simplesmente não mostra estes cards.
//
// "Lançado por" = coluna "Editor financeiro" do Fechamento de Caixa: quem registrou o atendimento. A tela não diz
// "responsável pela guia" de propósito — o relatório não mostra quem ficou fisicamente com ela.
import React, { useEffect, useState } from 'react';
import {
  Card, Count, Badge, DataTable, Pagination, SearchField, FilterChips, Callout, Accordion, StatStrip, Icon,
  sortRows, formatBRL, formatNumber, formatPercent, titleCase, useViewport,
} from './ds/index.js';
import { TIPOS_LANCADOR, FAIXAS_GUIA } from '../lib/cruzamento.js';

const fold = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');
const plural = (n, um, varios) => `${formatNumber(n)} ${Math.round(n) === 1 ? um : varios}`;
const FAIXA_TONE = { atrasada: 'danger', em_lote: 'warning', no_prazo: 'muted' };
/** Rótulo curto da situação dentro da tabela (o completo, FAIXAS_GUIA, vai no title e na exportação). */
const FAIXA_CURTA = { atrasada: 'Atrasada', em_lote: 'Em lote', no_prazo: 'No prazo' };
const CONFIANCA_TXT = {
  ambigua: 'Dois atendimentos iguais do paciente no mesmo dia: não dá para separar quem lançou cada um.',
  provavel: 'Casado pelo paciente e pela data, sem o valor bater.',
  sem: 'Não há lançamento deste paciente nesta data no Fechamento de Caixa.',
};

/** Nome(s) de quem lançou, com o tipo (atendente, o próprio profissional…). Vazio quando o Caixa não foi enviado. */
export function LancadoPor({ itens = [], confianca, compact = false }) {
  if (confianca === 'sem_caixa' || confianca === 'sem_codigo') return <span className="cs-faint">—</span>;
  if (!itens.length) return <span className="cs-faint" title={CONFIANCA_TXT.sem}>Sem registro no Caixa</span>;
  return (
    <span className="cs-cell-main cs-lancado" title={CONFIANCA_TXT[confianca]}>
      <span className="cs-cell-main__title">
        {itens.map((l) => titleCase(l.nome)).join(' ou ')}
        {confianca === 'ambigua' && <> <Badge tone="outline" size="sm">um dos dois</Badge></>}
      </span>
      {!compact && (
        <span className="cs-cell-main__sub">
          {[...new Set(itens.map((l) => TIPOS_LANCADOR[l.tipo] || 'Atendente'))].join(' · ')}{itens.some((l) => l.faturamento) ? ' · também faturamento' : ''}
        </span>
      )}
    </span>
  );
}

function usePaged(rows, deps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  useEffect(() => { setPage(1); }, [...deps, pageSize]);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  return { pageRows: rows.slice((current - 1) * pageSize, current * pageSize), current, pageSize, setPage, setPageSize };
}

/** Guias de convênio sem "Quem enviou" na Produção: o dinheiro que ainda pode ser cobrado do convênio. */
export function GuiasNaoEnviadasCard({ cruzamento }) {
  const { compact } = useViewport();
  const g = cruzamento?.guiasNaoEnviadas;
  const [query, setQuery] = useState('');
  const [faixa, setFaixa] = useState('all');
  const [sort, setSort] = useState(null);
  const itens = g?.itens || [];
  const q = fold(query.trim());
  const visiveis = itens.filter((x) => (faixa === 'all' || x.faixa === faixa)
    && (!q || [x.paciente, x.convenio, x.medico, ...(x.guias || []), ...(x.lancadoPor || []).map((l) => l.nome)].some((v) => fold(v).includes(q))));
  const columns = [
    { key: 'data', header: 'Atendimento', sortable: true, sortValue: (x) => String(x.data).split('/').reverse().join(''), render: (x) => (
      <span className="cs-cell-main"><span className="cs-cell-main__title">{x.data}</span><span className="cs-cell-main__sub">{x.dias != null ? `${plural(x.dias, 'dia', 'dias')} sem envio` : '—'}</span></span>) },
    { key: 'paciente', header: 'Paciente', sortable: true, sortValue: (x) => fold(x.paciente), render: (x) => (
      <span className="cs-cell-main"><span className="cs-cell-main__title" title={x.paciente}>{titleCase(x.paciente)}</span>
        <span className="cs-cell-main__sub cs-truncate" title={x.procedimentos?.join(', ')}>{titleCase(x.medico)} · {x.procedimentos?.[0] || '—'}</span></span>) },
    { key: 'convenio', header: 'Convênio · guia', priority: 2, sortable: true, sortValue: (x) => fold(x.convenio), render: (x) => (
      <span className="cs-cell-main"><span className="cs-cell-main__title">{x.convenio}</span><span className="cs-cell-main__sub">{x.guias?.length ? `Guia ${x.guias.join(', ')}` : 'Sem número de guia'}{x.guiaParcial ? ' · parte da guia já foi enviada' : ''}</span></span>) },
    { key: 'valor', header: 'Valor', align: 'right', sortable: true, sortValue: (x) => x.valor, render: (x) => formatBRL(x.valor) },
    { key: 'faixa', header: 'Situação', sortable: true, sortValue: (x) => ({ atrasada: 0, em_lote: 1, no_prazo: 2 })[x.faixa], render: (x) => (
      <Badge tone={FAIXA_TONE[x.faixa]} size="sm" title={`${FAIXAS_GUIA[x.faixa]}${x.limiteDias != null ? `. Maior prazo de envio já visto neste convênio: ${x.limiteDias} dias` : ''}`}>{FAIXA_CURTA[x.faixa]}</Badge>) },
    { key: 'lancado', header: 'Lançado por', sortable: true, sortValue: (x) => fold(x.lancadoPor?.[0]?.nome || 'zzz'), render: (x) => <LancadoPor itens={x.lancadoPor} confianca={x.confianca} /> },
  ];
  const sorted = sortRows(visiveis, columns, sort);
  const { pageRows, current, pageSize, setPage, setPageSize } = usePaged(sorted, [query, faixa, sort]);
  if (!g) return null;
  const f = g.faixas;
  const fora = g.foraDoEnvio;

  return (
    <Card flush title={<>Guias de convênio não enviadas <Count>{formatNumber(g.total.n)}</Count></>}
      subtitle={`Atendimentos de convênio sem “Quem enviou” na Produção: a guia não chegou ao faturamento.${cruzamento.dataReferencia ? ` Dias contados até ${cruzamento.dataReferencia}, o envio mais recente do arquivo.` : ''}`}>
      <div className="cs-card-toolbar">
        <StatStrip compact={compact} items={[
          // Contagem no rótulo: a legenda do StatStrip fica na linha do valor e não cabe ao lado de valores em reais.
          { label: `Valor a faturar · ${formatNumber(g.total.n)}`, value: formatBRL(g.total.valor), icon: 'banknote' },
          { label: `Atrasadas · ${formatNumber(f.atrasada.n)}`, value: formatBRL(f.atrasada.valor), icon: 'triangle-alert', tone: 'danger' },
          { label: `Em lote · ${formatNumber(f.em_lote.n)}`, value: formatBRL(f.em_lote.valor), icon: 'clock' },
          { label: `No prazo · ${formatNumber(f.no_prazo.n)}`, value: formatBRL(f.no_prazo.valor), icon: 'calendar' },
        ]} />
        {!cruzamento.comCaixa && g.total.n > 0 && (
          <Callout tone="info" icon="user-check" title="Quem lançou cada guia">
            Envie o Fechamento de Caixa do mesmo período em Nova auditoria para ver quem registrou cada um destes atendimentos.
          </Callout>
        )}
        {g.total.n > 0 && (
          <>
            <div className="cs-toolbar">
              <div className="cs-toolbar__grow" style={compact ? { flexBasis: '100%', maxWidth: 'none' } : { maxWidth: 320 }}>
                <SearchField placeholder="Buscar paciente, convênio ou pessoa" label="Buscar guia" value={query} onChange={setQuery} />
              </div>
              {!compact && <div className="cs-toolbar__end"><span className="cs-count-line" aria-live="polite">Exibindo <b>{formatNumber(visiveis.length)}</b> de <b>{formatNumber(itens.length)}</b></span></div>}
            </div>
            <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px' }}>
              <FilterChips label="Situação da guia" value={faixa} onChange={setFaixa} options={[
                { id: 'all', label: 'Todas', count: itens.length },
                { id: 'atrasada', label: 'Atrasadas', count: f.atrasada.n, icon: 'triangle-alert' },
                { id: 'em_lote', label: 'Em lote', count: f.em_lote.n, icon: 'clock' },
                { id: 'no_prazo', label: 'Dentro do prazo', count: f.no_prazo.n, icon: 'calendar' },
              ]} />
            </div>
          </>
        )}
      </div>
      {g.total.n === 0 ? (
        <div style={{ padding: '0 20px 20px' }}><Callout tone="success" title="Todas as guias de convênio foram enviadas">Nenhum atendimento de convênio ficou sem envio ao faturamento.</Callout></div>
      ) : (
        <DataTable caption="Guias de convênio não enviadas" rows={pageRows} rowKey={(x) => x.codigo} columns={columns} sort={sort} onSortChange={setSort}
          empty={<div style={{ padding: 20 }} className="cs-faint">Nenhuma guia com esses filtros.</div>}
          mobile={{
            title: (x) => titleCase(x.paciente),
            value: (x) => formatBRL(x.valor),
            meta: (x) => <span>{x.data} · {x.convenio}{x.lancadoPor?.length ? ` · ${x.lancadoPor.map((l) => titleCase(l.nome)).join(' ou ')}` : ''}</span>,
            tags: (x) => <Badge tone={FAIXA_TONE[x.faixa]} size="sm">{FAIXAS_GUIA[x.faixa]}</Badge>,
          }}
          footer={sorted.length > 10 ? <Pagination page={current} pageSize={pageSize} total={sorted.length} compact={compact} onPage={setPage} onPageSize={setPageSize} /> : null} />
      )}
      {(fora.linhas > 0 || g.conveniosSemEnvio?.length > 0 || g.truncado > 0) && <div className="cs-card-note">
        {fora.linhas > 0 && <p><Icon name="info" size={14} /> Convênios faturados pelo próprio médico ficam de fora ({plural(fora.linhas, 'linha', 'linhas')}, {formatBRL(fora.valor)}). A lista fica em Configurações.</p>}
        {g.conveniosSemEnvio?.length > 0 && (
          <p><Icon name="circle-help" size={14} /> Convênios sem nenhuma guia enviada neste período: {g.conveniosSemEnvio.map((c) => `${c.convenio} (${c.linhas})`).join(', ')}. Se o próprio médico fatura algum deles, inclua-o em Configurações.</p>
        )}
        {g.truncado > 0 && <p><Icon name="triangle-alert" size={14} /> A lista guardada mostra {formatNumber(itens.length)} de {formatNumber(g.total.n)} atendimentos. O total considera todos.</p>}
      </div>}
    </Card>
  );
}

/** Quem lançou: volume, guias não enviadas (com a taxa sobre as guias que a pessoa lançou) e divergências. */
export function RankingLancadoresCard({ cruzamento }) {
  const { compact } = useViewport();
  const [sort, setSort] = useState(null);
  const [tipo, setTipo] = useState('all');
  const ranking = cruzamento?.ranking || [];
  const porTipo = (t) => ranking.filter((r) => r.tipo === t).length;
  const visiveis = ranking.filter((r) => tipo === 'all' || r.tipo === tipo);
  const columns = [
    { key: 'nome', header: 'Lançado por', sortable: true, sortValue: (r) => fold(r.nome), render: (r) => (
      <span className="cs-cell-main"><span className="cs-cell-main__title">{titleCase(r.nome)}</span>
        <span className="cs-cell-main__sub">{TIPOS_LANCADOR[r.tipo] || 'Atendente'}{r.faturamento ? ' · também faturamento' : ''}</span></span>) },
    { key: 'lanc', header: 'Lançamentos', align: 'right', priority: 2, sortable: true, sortValue: (r) => r.lancamentos, render: (r) => formatNumber(r.lancamentos) },
    { key: 'guias', header: 'Guias não enviadas', align: 'right', sortable: true, sortValue: (r) => r.guiasNaoEnviadas, render: (r) => (r.guiasNaoEnviadas
      ? <span className="cs-cell-main" style={{ alignItems: 'flex-end' }}><span className="cs-cell-main__title">{formatNumber(Math.round(r.guiasNaoEnviadas))} · {formatBRL(r.valorGuias)}</span>
          <span className="cs-cell-main__sub">{r.guiasAtrasadas >= 1 ? plural(Math.round(r.guiasAtrasadas), 'atrasada', 'atrasadas') : 'nenhuma atrasada'}</span></span>
      : <span className="cs-faint">—</span>) },
    { key: 'taxa', header: 'Taxa', align: 'right', sortable: true, sortValue: (r) => r.taxaGuias ?? -1, render: (r) => (r.taxaGuias == null
      ? <span className="cs-faint">—</span>
      : <span title={`${formatNumber(Math.round(r.guiasNaoEnviadas))} de ${formatNumber(Math.round(r.guiasLancadas))} guias de convênio que lançou`}>{formatPercent(r.taxaGuias)}</span>) },
    { key: 'div', header: 'Divergências', align: 'right', priority: 2, sortable: true, sortValue: (r) => r.valorDivergencias, render: (r) => (r.divergencias
      ? `${formatNumber(Math.round(r.divergencias))} · ${formatBRL(r.valorDivergencias)}` : <span className="cs-faint">—</span>) },
    { key: 'faltas', header: 'Faltas · cancel.', align: 'right', priority: 3, sortable: true, sortValue: (r) => r.faltas + r.cancelamentos, render: (r) => `${formatNumber(r.faltas)} · ${formatNumber(r.cancelamentos)}` },
  ];
  const sorted = sortRows(visiveis, columns, sort);
  const { pageRows, current, pageSize, setPage, setPageSize } = usePaged(sorted, [sort, tipo]);
  if (!cruzamento?.comCaixa || !ranking.length) return null;
  const cob = cruzamento.cobertura || {};
  const pctCasado = cob.atendimentos ? ((cob.exata + cob.provavel) / cob.atendimentos) * 100 : 0;

  return (
    <Card flush title={<>Quem lançou <Count>{formatNumber(ranking.length)}</Count></>}
      subtitle="Pessoas que registraram os atendimentos no Fechamento de Caixa (coluna “Editor financeiro”). A taxa é a parte das guias de convênio lançadas pela pessoa que não foi enviada.">
      <div className="cs-card-toolbar">
        <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px' }}>
          <FilterChips label="Tipo" value={tipo} onChange={setTipo} options={[
            { id: 'all', label: 'Todos', count: ranking.length },
            { id: 'atendente', label: 'Atendentes', count: porTipo('atendente') },
            { id: 'profissional', label: 'Profissionais', count: porTipo('profissional') },
            { id: 'secretaria', label: 'Secretárias', count: porTipo('secretaria') },
            { id: 'sistema', label: 'Contas do sistema', count: porTipo('sistema') },
          ].filter((o) => o.id === 'all' || o.count > 0)} />
        </div>
      </div>
      <DataTable caption="Quem lançou" rows={pageRows} rowKey={(r) => r.nome} columns={columns} sort={sort} onSortChange={setSort}
        mobile={{
          title: (r) => titleCase(r.nome),
          value: (r) => (r.valorGuias ? formatBRL(r.valorGuias) : '—'),
          meta: (r) => <span>{TIPOS_LANCADOR[r.tipo] || 'Atendente'} · {plural(r.lancamentos, 'lançamento', 'lançamentos')}{r.taxaGuias != null ? ` · taxa ${formatPercent(r.taxaGuias)}` : ''}</span>,
        }}
        footer={sorted.length > 10 ? <Pagination page={current} pageSize={pageSize} total={sorted.length} compact={compact} onPage={setPage} onPageSize={setPageSize} /> : null} />
      <div className="cs-card-note">
        <p><Icon name="info" size={14} /> {formatPercent(pctCasado)} dos atendimentos da Produção foram encontrados no Fechamento de Caixa{cob.ambigua ? `; ${plural(cob.ambigua, 'ficou', 'ficaram')} entre duas pessoas (atendimentos iguais no mesmo dia) e conta meio para cada uma` : ''}.</p>
        <p><Icon name="circle-help" size={14} /> “Lançado por” é quem registrou o atendimento no sistema. Confirme com a equipe antes de cobrar alguém pela guia.</p>
      </div>
    </Card>
  );
}

/** Guias de um mesmo paciente usadas em dias diferentes (séries de terapia, exames em dias separados). */
export function GuiasMultiDiaCard({ cruzamento }) {
  const m = cruzamento?.guiasMultiDia;
  if (!m?.total) return null;
  const ENVIO = { total: 'Enviada', parcial: 'Enviada em parte', nenhum: 'Não enviada' };
  const items = m.itens.map((g, i) => ({
    id: `g${i}`,
    icon: g.envio === 'total' ? 'file-check' : 'file-x',
    title: `${g.convenio} · guia ${g.guia}`,
    subtitle: `${titleCase(g.paciente)} · ${plural(g.nDatas, 'data', 'datas')}${cruzamento.comCaixa ? ` · ${plural(g.nLancadores, 'pessoa lançou', 'pessoas lançaram')}` : ''} · ${ENVIO[g.envio]}`,
    content: (
      <ul className="cs-atend-list">
        {g.atendimentos.map((a) => (
          <li key={a.codigo} className="cs-atend">
            <span className="cs-atend__head"><b>{a.data}</b> · {titleCase(a.medico)}
              <Badge tone={a.enviado ? 'success' : 'warning'} size="sm">{a.enviado ? 'Enviado' : 'Não enviado'}</Badge></span>
            {cruzamento.comCaixa && <span className="cs-atend__by">Lançado por <LancadoPor itens={a.lancadoPor} confianca={a.confianca} compact /></span>}
          </li>
        ))}
      </ul>
    ),
  }));
  return (
    <Card title={<>Guias usadas em mais de um dia <Count>{formatNumber(m.total)}</Count></>} icon="calendar"
      subtitle={`A mesma guia atendida em datas diferentes${cruzamento.comCaixa ? `, em ${plural(m.comLancadoresDiferentes, 'caso', 'casos')} lançada por pessoas diferentes` : ''}. ${m.comEnvioIncompleto ? `${plural(m.comEnvioIncompleto, 'tem', 'têm')} algum atendimento sem envio: confira primeiro.` : 'Todas foram enviadas por completo.'}`}>
      <Accordion items={items} />
      {m.suspeitasNumeracao > 0 && (
        <p className="cs-faint" style={{ fontSize: 12, marginTop: 12 }}>
          {plural(m.suspeitasNumeracao, 'número de guia aparece', 'números de guia aparecem')} em pacientes diferentes no mesmo convênio. Provável erro de digitação; ficaram fora desta lista.
        </p>
      )}
    </Card>
  );
}
