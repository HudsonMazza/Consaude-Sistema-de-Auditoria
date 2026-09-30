// Dados FICTÍCIOS só para o harness de desenvolvimento (dev-preview.html). Nomes inventados; valores ilustrativos.
// Nada aqui é importado pelo app de produção.
import { brl } from '../lib/engine.js';

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
    insights: divs.length ? [
      `${divs.length} de 42 médico(s) analisados (26%) apresentam divergências de faturamento.`,
      `Maior divergência individual: ${divs[0].medico} — ${divs[0].diferenca} de diferença.`,
      'Padrão mais frequente: "Maior no Repasse" com 9 ocorrência(s). Recomenda-se revisão sistemática deste tipo.',
      `O valor total divergente de ${brl(valorTotal)} impacta diretamente o fechamento financeiro. Prioridade máxima para o setor de faturamento.`,
    ] : [],
    processadoEm: '26/09/2026, 14:32:10', referencia, file1Name: 'producao_set-2026_clinica-integrada-sao-lucas.xlsx', file2Name: 'repasse_set-2026_clinica-integrada-sao-lucas.xlsx',
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
