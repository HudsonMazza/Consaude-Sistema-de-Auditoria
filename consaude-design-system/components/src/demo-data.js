// Fictional sample data used by the previews and reference screens. Names are invented; values are illustrative.
export const MONTHLY = [
  { label: 'Abr', values: [1, 2] },
  { label: 'Mai', values: [2, 2] },
  { label: 'Jun', values: [2, 3] },
  { label: 'Jul', values: [1, 3] },
  { label: 'Ago', values: [2, 3] },
  { label: 'Set', values: [1, 2], partial: true },
];
export const MONTHLY_SERIES = [{ name: 'Com divergência', color: 'chart-1' }, { name: 'Conformes', color: 'chart-2' }];

export const DIRECTION = { rep: { count: 128, value: 24310.40 }, prod: { count: 84, value: 14210.76 } };

export const AUDITS = [
  { id: 'a24', date: '26/09/2026', time: '14:32', ref: 'Setembro/2026', scope: 'Clínica inteira', files: ['producao_set-2026.xlsx', 'repasse_set-2026.xlsx'], auditor: 'ANA PAULA LIMA', divergences: 37, value: 13846.55, ia: false },
  { id: 'a23', date: '12/09/2026', time: '09:10', ref: 'Setembro/2026 — Plantões', scope: 'Plantões', files: ['plantoes_set.xlsx', 'repasse_plantoes_set.csv'], auditor: 'BRUNO CARVALHO', divergences: 0, value: 0, ia: false },
  { id: 'a22', date: '29/08/2026', time: '17:05', ref: 'Agosto/2026', scope: 'Clínica inteira', files: ['producao_ago-2026.xlsx', 'repasse_ago-2026.xlsx'], auditor: 'ANA PAULA LIMA', divergences: 28, value: 9402.10, ia: true },
  { id: 'a21', date: '18/08/2026', time: '11:47', ref: 'Agosto/2026 — Unidade Marco', scope: 'Unidade Marco', files: ['prod_marco_ago.xlsx', 'rep_marco_ago.xlsx'], auditor: 'DIEGO MARTINS', divergences: 0, value: 0, ia: false },
  { id: 'a20', date: '30/07/2026', time: '16:21', ref: 'Julho/2026', scope: 'Clínica inteira', files: ['producao_jul-2026.xlsx', 'repasse_jul-2026.xlsx'], auditor: 'ANA PAULA LIMA', divergences: 41, value: 8114.65, ia: true },
  { id: 'a19', date: '15/07/2026', time: '10:02', ref: 'Julho/2026 — Plantões', scope: 'Plantões', files: ['plantoes_jul.xlsx', 'repasse_plantoes_jul.csv'], auditor: 'BRUNO CARVALHO', divergences: 6, value: 1220.00, ia: false },
  { id: 'a18', date: '01/07/2026', time: '08:55', ref: 'Junho/2026', scope: 'Clínica inteira', files: ['producao_jun-2026.xlsx', 'repasse_jun-2026.xlsx'], auditor: 'ANA PAULA LIMA', divergences: 0, value: 0, ia: false },
  { id: 'a17', date: '03/06/2026', time: '15:38', ref: 'Maio/2026', scope: 'Clínica inteira', files: ['producao_mai-2026.xlsx', 'repasse_mai-2026.xlsx'], auditor: 'FELIPE ARANTES', divergences: 19, value: 5937.86, ia: true },
];

export const DOCTORS = [
  { id: 'd1', name: 'RICARDO ALVES PEREIRA', patients: 8, prod: 18420.00, rep: 20152.40, items: 5, status: 'pendente' },
  { id: 'd2', name: 'ANA BEATRIZ SOUZA LIMA', patients: 6, prod: 15310.00, rep: 13180.00, items: 4, status: 'revisado' },
  { id: 'd3', name: 'MARCOS VINÍCIUS ROCHA', patients: 9, prod: 9870.50, rep: 11640.50, items: 6, status: 'pendente' },
  { id: 'd4', name: 'JULIANA COSTA FERREIRA', patients: 5, prod: 12050.00, rep: 10986.25, items: 3, status: 'corrigido' },
  { id: 'd5', name: 'PAULO HENRIQUE NUNES', patients: 7, prod: 7430.00, rep: 8912.80, items: 4, status: 'pendente' },
  { id: 'd6', name: 'FERNANDA DIAS MOREIRA', patients: 3, prod: 6280.00, rep: 5390.00, items: 2, status: 'revisado' },
  { id: 'd7', name: 'LUCAS GABRIEL TEIXEIRA', patients: 4, prod: 11200.00, rep: 12544.60, items: 3, status: 'pendente' },
  { id: 'd8', name: 'CAMILA RIBEIRO ANDRADE', patients: 2, prod: 5025.00, rep: 4210.00, items: 2, status: 'revisado' },
  { id: 'd9', name: 'RAFAEL MONTEIRO BARROS', patients: 5, prod: 8790.00, rep: 9555.00, items: 3, status: 'corrigido' },
  { id: 'd10', name: 'PATRÍCIA GOMES CARDOSO', patients: 4, prod: 4420.00, rep: 3587.00, items: 3, status: 'revisado' },
  { id: 'd11', name: 'THIAGO MARTINS DO CARMO', patients: 3, prod: 6110.00, rep: 7130.00, items: 2, status: 'pendente' },
].map((d) => ({ ...d, diff: Math.round((d.rep - d.prod) * 100) / 100 }));

export const PATIENTS = [
  { id: 'p1', name: 'MARIA DE LOURDES SANTOS', date: '04/09/2026', proc: 'Consulta + ECG', prod: 1250.00, rep: 1850.00, type: 'Valor divergente' },
  { id: 'p2', name: 'JOSÉ CARLOS OLIVEIRA', date: '08/09/2026', proc: 'Ecocardiograma', prod: 0, rep: 480.00, type: 'Ausente na produção' },
  { id: 'p3', name: 'ANTÔNIA FERREIRA LIMA', date: '11/09/2026', proc: 'Holter 24h', prod: 320.00, rep: 640.00, type: 'Duplicado no repasse' },
  { id: 'p4', name: 'FRANCISCO ALVES NETO', date: '15/09/2026', proc: 'Teste ergométrico', prod: 890.00, rep: 1312.40, type: 'Valor divergente' },
  { id: 'p5', name: 'LUIZA HELENA PRADO', date: '22/09/2026', proc: 'Consulta', prod: 410.00, rep: 320.00, type: 'Valor divergente' },
].map((p) => ({ ...p, diff: Math.round((p.rep - p.prod) * 100) / 100 }));

export const TOP_IMPACT = [
  { id: 't1', name: 'RICARDO ALVES PEREIRA', meta: '4 auditorias · 26 itens', value: 7842.10 },
  { id: 't2', name: 'ANA BEATRIZ SOUZA LIMA', meta: '3 auditorias · 17 itens', value: 5316.40 },
  { id: 't3', name: 'MARCOS VINÍCIUS ROCHA', meta: '3 auditorias · 21 itens', value: 4180.00 },
  { id: 't4', name: 'JULIANA COSTA FERREIRA', meta: '2 auditorias · 9 itens', value: 3402.75 },
  { id: 't5', name: 'PAULO HENRIQUE NUNES', meta: '2 auditorias · 11 itens', value: 2961.20 },
];

export const USERS = [
  { id: 'u1', name: 'ANA PAULA LIMA', email: 'ana.lima@clinicasaolucas.com.br', role: 'Coordenadora de faturamento', profile: 'admin', status: 'ativo', created: '12/01/2026', me: true },
  { id: 'u2', name: 'BRUNO CARVALHO', email: 'bruno.carvalho@clinicasaolucas.com.br', role: 'Auditor', profile: 'auditor', status: 'ativo', created: '03/02/2026' },
  { id: 'u3', name: 'CAMILA ROCHA', email: 'camila.rocha@clinicasaolucas.com.br', role: 'Analista financeira', profile: 'auditor', status: 'senha-pendente', created: '21/09/2026' },
  { id: 'u4', name: 'DIEGO MARTINS', email: 'diego.martins@clinicasaolucas.com.br', role: 'Gerente administrativo', profile: 'admin', status: 'ativo', created: '12/01/2026' },
  { id: 'u5', name: 'EDUARDA FONSECA', email: 'eduarda.fonseca@clinicasaolucas.com.br', role: 'Auditora', profile: 'auditor', status: 'desativado', created: '08/03/2026' },
  { id: 'u6', name: 'FELIPE ARANTES', email: 'felipe.arantes@clinicasaolucas.com.br', role: 'Auditor', profile: 'auditor', status: 'ativo', created: '17/04/2026' },
  { id: 'u7', name: 'GABRIELA MOURA', email: 'gabriela.moura.faturamento@clinicasaolucas.com.br', role: 'Diretora financeira', profile: 'gestor', status: 'ativo', created: '02/05/2026' },
];

export const AI_STEPS = [
  { label: 'Consolidando divergências', state: 'done', end: '37 itens' },
  { label: 'Identificando riscos', state: 'active' },
  { label: 'Preparando plano de ação', state: 'pending' },
];
