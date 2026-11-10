// Dados FICTÍCIOS só para o harness de desenvolvimento (dev-preview.html). Nomes inventados; valores ilustrativos.
// Nada aqui é importado pelo app de produção.
import { brl, generateInsights } from '../lib/engine.js';
import { prepararAtendimentos, compararAtendimentos, analisarCruzamento, insightsCruzamento, detectCaixaColumns, escopoNaoFaturado } from '../lib/cruzamento.js';

const MEDICOS = [
  'RICARDO ALVES PEREIRA', 'MARIANA DOS SANTOS COSTA', 'JOÃO PEDRO DA SILVA', 'FERNANDA LIMA ROCHA', 'CARLOS EDUARDO MENDES',
  'PATRÍCIA GOMES DE OLIVEIRA', 'ANDRÉ LUIZ BARBOSA', 'JULIANA MARTINS FERREIRA', 'ROBERTO CARVALHO NUNES', 'CAMILA RIBEIRO DUARTE',
  'GUSTAVO HENRIQUE MOURA',
];
const PACIENTES = ['MARIA APARECIDA SOUZA', 'JOSÉ CARLOS DE ALMEIDA', 'ANA BEATRIZ TEIXEIRA', 'LUCAS GABRIEL PINTO', 'HELENA CRISTINA VIEIRA', 'PAULO ROBERTO DIAS'];
const TIPOS = ['Maior na Produção', 'Maior no Repasse', 'Ausente no Repasse', 'Ausente na Produção', 'Diferença de centavos', 'Quantidade de lançamentos diferente'];

function detalhes(seed, n) {
  return Array.from({ length: n }, (_, i) => {
    const pv = 180 + ((seed * 37 + i * 91) % 900);
    const tipo = TIPOS[(seed + i) % TIPOS.length];
    const rv = tipo === 'Ausente no Repasse' ? 0 : tipo === 'Ausente na Produção' ? pv : tipo === 'Maior na Produção' ? pv - 120 - i * 7 : tipo === 'Diferença de centavos' ? pv + 0.42 : pv + 95 + i * 11;
    const pv2 = tipo === 'Ausente na Produção' ? 0 : pv;
    const diff = pv2 - rv;
    return { paciente: PACIENTES[(seed + i) % PACIENTES.length], producao: brl(pv2), repasse: brl(rv), diferenca: brl(Math.abs(diff)), diferencaRaw: Math.abs(diff), tipo };
  }).sort((a, b) => b.diferencaRaw - a.diferencaRaw);
}

export function makeResultados({ referencia = 'setembro de 2026', n = MEDICOS.length, withDetails = true } = {}) {
  const divs = MEDICOS.slice(0, n).map((medico, i) => {
    const tp = 8200 + i * 1375.4;
    const tr = i % 3 === 0 ? tp - (420 + i * 211.7) : tp + (310 + i * 173.35);
    const diff = tp - tr;
    return {
      id: medico, medico, crm: '', producao: brl(tp), repasse: brl(tr), diferenca: brl(Math.abs(diff)), diferencaRaw: Math.abs(diff),
      diferencaSigned: diff, sentido: diff > 0 ? 'prod_maior' : 'rep_maior', status: 'pendente', detalhes: withDetails ? detalhes(i, 2 + (i % 4)) : [],
    };
  }).sort((a, b) => b.diferencaRaw - a.diferencaRaw);
  const valorTotal = divs.reduce((s, d) => s + d.diferencaRaw, 0);
  const totalDivs = divs.reduce((s, d) => s + (d.detalhes.length || 1), 0);
  return {
    totalMedicos: 42, medicosComDivergencia: divs.length, totalDivergencias: totalDivs, valorTotal: brl(valorTotal), valorTotalRaw: valorTotal,
    divergencias: divs,
    insights: divs.length ? generateInsights(divs, 42, valorTotal) : [],
    processadoEm: '26/09/2026, 14:32:10', referencia, file1Name: 'producao_set-2026_clinica-integrada-sao-lucas.xlsx', file2Name: 'repasse_set-2026_clinica-integrada-sao-lucas.xlsx',
  };
}

/**
 * Auditoria fictícia no formato do Sistema Amigo (Código de atendimento + Fechamento de Caixa), processada pelo
 * motor real: divergências por atendimento, "lançado por", guias não enviadas e ranking. Nomes inventados.
 */
export function makeResultadosAmigo() {
  const ATEND = ['BEATRIZ MONTEIRO ALVES', 'CAIO HENRIQUE PRADO', 'DÉBORA NASCIMENTO REIS', 'EDUARDO FONTES LIMA', 'FLÁVIA CUNHA MATOS'];
  const MEDS = ['RICARDO ALVES PEREIRA', 'MARIANA DOS SANTOS COSTA', 'JOÃO PEDRO DA SILVA', 'FERNANDA LIMA ROCHA'];
  const CONVS = ['BRADESCO SAÚDE', 'AMIL', 'CASSI', 'UNIMED DR. RICARDO'];
  const PACS = Array.from({ length: 36 }, (_, i) => `${['ANA', 'BRUNO', 'CLARA', 'DIEGO', 'ELISA', 'FÁBIO'][i % 6]} ${['SOUZA', 'MARTINS', 'TEIXEIRA', 'PINTO', 'VIEIRA', 'DIAS'][Math.floor(i / 6)]} ${['RAMOS', 'LOPES', 'MELO'][i % 3]}`);
  const prod = [], rep = [], caixa = [];
  for (let i = 0; i < 140; i += 1) {
    const dia = 1 + (i % 26);
    const data = `${String(dia).padStart(2, '0')}/09/2026`;
    const codigo = String(300000 + i);
    const med = MEDS[i % MEDS.length];
    const pac = PACS[(i * 7) % PACS.length];
    const conv = i % 5 === 0 ? 'Cartão' : CONVS[i % CONVS.length];
    const fat = conv !== 'Cartão';
    const valor = 120 + ((i * 37) % 280);
    const pendente = i % 47 === 3;
    const forma = pendente ? 'Pendente' : conv;
    const enviada = fat && conv !== CONVS[3] && (i % 9 !== 4);
    const desconto = i % 61 === 10 ? 40 : 0;
    prod.push({
      'Data Atendimento': data, 'Código Atendimento': codigo, Paciente: pac, Profissional: med, Executante: med,
      'Grupo de Convênio': fat && !pendente ? 'FATURADO' : 'PARTICULAR', 'Conv. cadastrado': fat ? conv : '', 'Forma de Pagamento': forma,
      'Tipo Atendimento': 'CONSULTA - CONVÊNIO', Item: i % 3 ? 'CONSULTA ESPECIALISTA' : 'ECOCARDIOGRAMA TRANSTORACICO', Quantidade: 1,
      'Valor do item R$': valor, 'Desconto R$': desconto, 'Valor total do item R$': valor - desconto,
      'Número da guia': fat ? String(880000 + i) : '', 'Número lote': enviada ? '41' : (i % 23 === 7 ? '44' : ''),
      'Quem enviou': enviada && !pendente ? 'GABRIEL FATURAMENTO SILVA' : '',
      'Data envio': enviada && !pendente ? (dia + 12 <= 30 ? `${String(dia + 12).padStart(2, '0')}/09/2026` : `${String(dia + 12 - 30).padStart(2, '0')}/10/2026`) : '',
    });
    if (!pendente) {
      rep.push({
        'Data Atend': data, 'Cód. atendimento': codigo, Paciente: pac, 'Forma de Pagamento': forma, 'Profissional Executante': med,
        'Procedimento/Matmed': 'CONSULTA ESPECIALISTA - CONVÊNIO', Faturado: valor, Desconto: 0, Líquido: valor,
      });
    }
    caixa.push({
      'Data Transação': data, 'Data Atendimento': data, Paciente: pac, Executante: med,
      'Editor financeiro': i % 11 === 6 ? med : ATEND[(i * 3) % ATEND.length], 'Qtd / Procedimento': `1 - ${i % 3 ? 'CONSULTA ESPECIALISTA' : 'ECOCARDIOGRAMA TRANSTORACICO'}`,
      'Forma de Pagamento': forma, 'Valor R$': valor - desconto,
    });
  }
  // Uma sessão de terapia em outro dia com a mesma guia de um atendimento já enviado (guia usada em dois dias).
  prod.push({ ...prod[1], 'Data Atendimento': '29/09/2026', 'Código Atendimento': '399999', 'Quem enviou': '', 'Data envio': '', 'Número lote': '' });
  rep.push({ ...rep.find((r) => r['Cód. atendimento'] === '300001'), 'Data Atend': '29/09/2026', 'Cód. atendimento': '399999' });
  caixa.push({ ...caixa[1], 'Data Transação': '29/09/2026', 'Data Atendimento': '29/09/2026', 'Editor financeiro': ATEND[4] });
  // Mesmo número de guia em outro paciente (erro de digitação) e faltas/cancelamentos lançados no caixa.
  prod.push({ ...prod[2], 'Código Atendimento': '399998', Paciente: PACS[35], 'Número da guia': prod[6]['Número da guia'], 'Conv. cadastrado': prod[6]['Conv. cadastrado'], 'Forma de Pagamento': prod[6]['Forma de Pagamento'] });
  for (let i = 0; i < 18; i += 1) {
    caixa.push({ 'Data Transação': `${String(1 + i).padStart(2, '0')}/09/2026`, 'Data Atendimento': `${String(1 + i).padStart(2, '0')}/09/2026`, Paciente: PACS[i],
      Executante: MEDS[i % 3], 'Editor financeiro': ATEND[i % ATEND.length], 'Qtd / Procedimento': '1 - CONSULTA ESPECIALISTA', 'Forma de Pagamento': i % 3 ? 'Cancelou' : 'Faltou', 'Valor R$': 0 });
  }
  const pCols = { medicoCol: 'Profissional', pacienteCol: 'Paciente', valorCol: 'Valor total do item R$' };
  const rCols = { medicoCol: 'Profissional Executante', pacienteCol: 'Paciente', valorCol: 'Líquido' };
  // Mesmo escopo do app: só o que ainda não foi faturado entra em Produção × Repasse.
  const escopo = escopoNaoFaturado(prod, rep);
  const prep = prepararAtendimentos(escopo.prod, escopo.rep);
  const divs = MEDS.map((medico) => {
    const pr = escopo.prod.filter((r) => r.Profissional === medico), rr = escopo.rep.filter((r) => r['Profissional Executante'] === medico);
    const tp = pr.reduce((s, r) => s + r['Valor total do item R$'], 0), tr = rr.reduce((s, r) => s + r.Líquido, 0);
    const diff = tp - tr;
    return { id: medico, medico, crm: '', producao: brl(tp), repasse: brl(tr), diferenca: brl(Math.abs(diff)), diferencaRaw: Math.abs(diff),
      diferencaSigned: diff, sentido: diff > 0 ? 'prod_maior' : 'rep_maior', status: 'pendente', detalhes: compararAtendimentos(pr, rr, pCols, rCols, prep) };
  }).filter((d) => Math.round(d.diferencaRaw * 100) > 0).sort((a, b) => b.diferencaRaw - a.diferencaRaw);
  const cruzamento = analisarCruzamento({ prodTodas: prod, repTodas: rep, caixaRows: caixa, caixaCols: detectCaixaColumns(caixa), divergencias: divs });
  const valorTotal = divs.reduce((s, d) => s + d.diferencaRaw, 0);
  return {
    totalMedicos: MEDS.length, medicosComDivergencia: divs.length, totalDivergencias: divs.reduce((s, d) => s + (d.detalhes.length || 1), 0),
    valorTotal: brl(valorTotal), valorTotalRaw: valorTotal, divergencias: divs,
    insights: [...generateInsights(divs, MEDS.length, valorTotal), ...insightsCruzamento(cruzamento)],
    processadoEm: '05/11/2026, 21:32:10', referencia: 'setembro de 2026', tolerancia: 0.01,
    file1Name: 'relatorio-producao-setembro.xlsx', file2Name: 'relatorio-repasse-setembro.xlsx', file3Name: 'relatorio-fechamento-de-caixa-diario-setembro.xlsx',
    cruzamento,
    escopo: { naoFaturado: true,
      foraProd: { linhas: escopo.foraProd.length, valor: escopo.foraProd.reduce((s, r) => s + r['Valor total do item R$'], 0), atendimentos: escopo.atendimentosFora },
      foraRep: { linhas: escopo.foraRep.length, valor: escopo.foraRep.reduce((s, r) => s + r.Líquido, 0) } },
  };
}

const REFS = ['setembro de 2026', 'Setembro/2026 — Plantões', 'agosto de 2026', 'Agosto/2026 — Unidade Marco', 'julho de 2026', 'junho de 2026', 'maio de 2026', 'abril de 2026', 'Abril/2026 — Plantões', 'março de 2026'];
const USERS = [['u-ana', 'ANA PAULA LIMA'], ['u-bruno', 'BRUNO CARVALHO'], ['u-diego', 'DIEGO MOREIRA']];

export function makeHistorico(now = new Date()) {
  return REFS.map((ref, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - Math.floor(i / 2), 26 - (i % 2) * 14, 9 + i, 12 + i * 3);
    const conforme = i === 1 || i === 6;
    const res = conforme ? makeResultados({ referencia: ref, n: 0 }) : makeResultados({ referencia: ref, n: 3 + (i % 8) });
    const [userId, userName] = USERS[i % USERS.length];
    return {
      id: 'a' + (30 - i), data: d.toLocaleDateString('pt-BR'), periodo: ref,
      arquivos: `producao_${i}_${ref.slice(0, 3).toLowerCase()}.xlsx / repasse_${i}_${ref.slice(0, 3).toLowerCase()}.csv`,
      divergencias: res.medicosComDivergencia, valor: res.valorTotal, resultados: res, userId, userName, createdAt: d,
      // Revisão salva: a mais recente concluída, a terceira pela metade, as outras sem status (auditorias antigas).
      ...(i === 0 ? { statuses: Object.fromEntries(res.divergencias.map((x, j) => [x.id, j % 2 ? 'corrigido' : 'revisado'])) } : {}),
      ...(i === 2 ? { statuses: Object.fromEntries(res.divergencias.slice(0, 2).map((x) => [x.id, 'revisado'])) } : {}),
      ...(i % 3 === 2 ? { aiReportHTML: '<!doctype html><title>Relatório IA fictício</title><p>Prévia</p>' } : {}),
    };
  });
}

export const ADMIN = { id: 'u-ana', name: 'Ana Paula Lima', email: 'ana.lima@clinicasaolucas.com.br', role: 'admin', cargo: 'Coordenadora de Auditoria' };
export const AUDITOR = { id: 'u-bruno', name: 'Bruno Carvalho', email: 'bruno.carvalho@clinicasaolucas.com.br', role: 'user', cargo: 'Analista de Faturamento' };

export const USER_LIST = [
  { ...ADMIN, createdAt: new Date(2026, 0, 12) },
  { ...AUDITOR, createdAt: new Date(2026, 1, 3) },
  { id: 'u-diego', name: 'Diego Moreira', email: 'diego.moreira.faturamento.unidade-marco@clinicasaolucas.com.br', role: 'user', cargo: 'Auditor', createdAt: new Date(2026, 2, 21) },
  { id: 'u-elisa', name: 'Elisa Fontes', email: 'elisa.fontes@clinicasaolucas.com.br', role: 'admin', cargo: 'Gerente financeira', createdAt: new Date(2026, 3, 9) },
  { id: 'u-fabio', name: 'Fábio Rezende', email: 'fabio.rezende@clinicasaolucas.com.br', role: 'user', cargo: '', mustChangePassword: true, createdAt: new Date(2026, 7, 30) },
  { id: 'u-gabi', name: 'Gabriela Torres', email: 'gabriela.torres@clinicasaolucas.com.br', role: 'user', cargo: 'Analista de Faturamento', disabled: true, createdAt: new Date(2025, 10, 2) },
  { id: 'u-hugo', name: 'Hugo Sampaio', email: 'hugo.sampaio@clinicasaolucas.com.br', role: 'user', cargo: 'Estagiário', createdAt: new Date(2026, 8, 1) },
];
