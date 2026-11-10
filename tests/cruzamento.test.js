import test from "node:test";
import assert from "node:assert/strict";
import {
  prepararAtendimentos, compararAtendimentos, analisarCruzamento, insightsCruzamento, detectCaixaColumns, validateCaixa,
  convenioDoMedico, parseProcsCaixa, procBate, normProc, analiseEquipe, escopoNaoFaturado,
} from "../src/lib/cruzamento.js";
import { parseConvenios, normalizePreferences } from "../src/lib/preferences.js";
import { resumoParaIA, sanitizeResumo, buildPrompt } from "../src/lib/aiPrompt.js";

// Linhas no formato dos relatórios do Sistema Amigo (nomes fictícios).
const P = (o) => ({
  "Data Atendimento": "02/09/2026", "Código Atendimento": "1", Paciente: "ANA SOUZA", Profissional: "DR. RICARDO ALVES", Executante: "DR. RICARDO ALVES",
  "Grupo de Convênio": "FATURADO", "Conv. cadastrado": "AMIL", "Forma de Pagamento": "AMIL", "Tipo Atendimento": "CONSULTA - CONVÊNIO",
  Item: "CONSULTA ESPECIALISTA", Quantidade: 1, "Valor do item R$": 100, "Desconto R$": 0, "Valor total do item R$": 100,
  "Número da guia": "5001", "Número lote": "9", "Quem enviou": "GABRIEL FATURAMENTO", "Data envio": "10/09/2026", ...o,
});
const R = (o) => ({
  "Data Atend": "02/09/2026", "Cód. atendimento": "1", Paciente: "ANA SOUZA", "Forma de Pagamento": "AMIL", "Profissional Executante": "DR. RICARDO ALVES",
  "Procedimento/Matmed": "CONSULTA ESPECIALISTA - CONVÊNIO", Faturado: 100, Desconto: 0, Líquido: 100, ...o,
});
const C = (o) => ({
  "Data Transação": "02/09/2026", "Data Atendimento": "02/09/2026", Paciente: "ANA SOUZA", Executante: "DR. RICARDO ALVES",
  "Editor financeiro": "BEATRIZ MONTEIRO", "Qtd / Procedimento": "1 - CONSULTA ESPECIALISTA", "Forma de Pagamento": "AMIL", "Valor R$": 100, ...o,
});
const pCols = { medicoCol: "Profissional", pacienteCol: "Paciente", valorCol: "Valor total do item R$" };
const rCols = { medicoCol: "Profissional Executante", pacienteCol: "Paciente", valorCol: "Líquido" };

test("convênios faturados pelo médico casam por palavras iniciais, com ou sem ponto", () => {
  const lista = ["UNIMED DR.", "UNIMED DRA."];
  assert.equal(convenioDoMedico("UNIMED DR. BRENO", lista), true);
  assert.equal(convenioDoMedico("UNIMED DRA. ALESSANDRA", lista), true);
  assert.equal(convenioDoMedico("Unimed Dr Breno", lista), true);
  assert.equal(convenioDoMedico("UNIMED BELEM", lista), false);
  assert.equal(convenioDoMedico("UNIMED DRAX", lista), false);
  assert.equal(convenioDoMedico("CASSI DRA. NELMA", ["cassi dra nelma"]), true);
  assert.equal(convenioDoMedico("AMIL", []), false);
});

test("procedimentos do Caixa: texto agregado vira itens; nomes batem sem o sufixo da tabela", () => {
  const procs = parseProcsCaixa("1 - Teste de Histamina, 2 - Testes cutâneo-alérgicos para fungos - CONVÊNIO");
  assert.deepEqual(procs.map((p) => p.q), [1, 2]);
  assert.equal(procs[1].nome, "Testes cutâneo-alérgicos para fungos - CONVÊNIO");
  assert.equal(procBate(normProc("CONSULTA CARDIOLOGIA - CONVÊNIO"), normProc("CONSULTA CARDIOLOGIA")), true);
  assert.equal(procBate(normProc("20102038 - Mapa 24 horas"), normProc("MAPA 24 HORAS - CONVÊNIO")), true);
  assert.equal(procBate(normProc("HOLTER"), normProc("CONSULTA")), false);
});

test("atendimentos divergentes: motivo de cada código, inclusive quando as diferenças do paciente se anulam", () => {
  const prod = [
    P({ "Código Atendimento": "1", "Forma de Pagamento": "Pendente", "Grupo de Convênio": "", "Valor total do item R$": 250, "Valor do item R$": 250 }),
    P({ "Código Atendimento": "2", "Desconto R$": 40, "Valor total do item R$": 60 }),
    P({ "Código Atendimento": "3", Paciente: "BRUNO DIAS", "Valor total do item R$": 100.004 }),
    P({ "Código Atendimento": "4", Paciente: "CLARA MELO", "Valor total do item R$": 150, "Valor do item R$": 100 }),
    P({ "Código Atendimento": "5", Paciente: "CLARA MELO", "Valor total do item R$": 50, "Valor do item R$": 100 }),
  ];
  const rep = [R({ "Cód. atendimento": "2" }), R({ "Cód. atendimento": "3", Paciente: "BRUNO DIAS", Líquido: 99.5 }), R({ "Cód. atendimento": "4", Paciente: "CLARA MELO" }), R({ "Cód. atendimento": "5", Paciente: "CLARA MELO" })];
  const prep = prepararAtendimentos(prod, rep);
  assert.equal(prep.porCodigo, true);
  const det = compararAtendimentos(prod, rep, pCols, rCols, prep);
  const ana = det.find((d) => d.paciente === "ANA SOUZA");
  assert.deepEqual(ana.atendimentos.map((a) => a.motivo).sort(), ["AUSENTE_REPASSE_PENDENTE", "DESCONTO_SO_PRODUCAO"]);
  assert.equal(ana.tipo, "Vários motivos");
  assert.equal(det.find((d) => d.paciente === "BRUNO DIAS").atendimentos[0].motivo, "CENTAVOS");
  // Clara: +50 num código e −50 no outro. Some do total do paciente, mas os dois atendimentos aparecem.
  const clara = det.find((d) => d.paciente === "CLARA MELO");
  assert.equal(clara.diferencaRaw, 0);
  assert.equal(clara.atendimentos.length, 2);
});

test("linha sem código não some do detalhe: vira um lançamento sem código por paciente", () => {
  const prod = [P({ "Código Atendimento": "1" })];
  const rep = [R({ "Cód. atendimento": "1" }), R({ "Cód. atendimento": "", Líquido: -50 })];
  const prep = prepararAtendimentos(prod, rep);
  const det = compararAtendimentos(prod, rep, pCols, rCols, prep);
  assert.equal(det.length, 1);
  assert.equal(det[0].atendimentos[0].semCodigo, true);
  assert.equal(det[0].atendimentos[0].motivo, "SEM_CODIGO");
  assert.equal(det[0].diferencaSigned, 50); // fecha com a diferença do médico (100 − 50)
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: rep, caixaRows: [C({})], caixaCols: detectCaixaColumns([C({})]), divergencias: [{ detalhes: det }] });
  assert.equal(det[0].atendimentos[0].confianca, "sem_codigo");
  assert.ok(cz);
});

test("insight de quem mais lançou guias usa só as guias (não o ranking que soma divergências)", () => {
  const cz = { comCaixa: true, guiasNaoEnviadas: { total: { n: 0 } }, ranking: [
    { nome: "PESSOA A", guiasNaoEnviadas: 35.5, valorGuias: 4000, valorDivergencias: 900, taxaGuias: 18 },
    { nome: "PESSOA B", guiasNaoEnviadas: 57, valorGuias: 4100, valorDivergencias: 0, taxaGuias: 13 },
  ] };
  const txt = insightsCruzamento(cz).join(" ");
  assert.match(txt, /Pessoa B, com 57/);
});

test("sem Código de atendimento nas duas planilhas, o app volta para a comparação pelo nome", () => {
  const prep = prepararAtendimentos([{ Médico: "X", Paciente: "A", Valor: 1 }], [R({})]);
  assert.equal(prep.porCodigo, false);
});

test("Fechamento de Caixa: colunas próprias e aviso quando não é o relatório certo", () => {
  const cols = detectCaixaColumns([C({})]);
  assert.equal(cols.atendenteCol, "Editor financeiro");
  assert.equal(cols.dataCol, "Data Atendimento");
  assert.deepEqual(validateCaixa([C({})], cols), []);
  const errs = validateCaixa([{ Médico: "X", Valor: 1 }], detectCaixaColumns([{ Médico: "X", Valor: 1 }]));
  assert.match(errs[0], /Editor financeiro/);
});

test("lançado por: exata, ambígua (dois atendimentos iguais no mesmo dia) e sem registro no Caixa", () => {
  const prod = [
    P({ "Código Atendimento": "1", "Forma de Pagamento": "Pendente", "Grupo de Convênio": "" }),
    P({ "Código Atendimento": "2", Paciente: "BRUNO DIAS", "Forma de Pagamento": "Pendente", "Grupo de Convênio": "" }),
    P({ "Código Atendimento": "3", Paciente: "BRUNO DIAS", "Forma de Pagamento": "Pendente", "Grupo de Convênio": "" }),
    P({ "Código Atendimento": "4", Paciente: "CLARA MELO", "Forma de Pagamento": "Pendente", "Grupo de Convênio": "" }),
  ];
  const caixa = [
    C({ "Editor financeiro": "BEATRIZ MONTEIRO" }),
    C({ Paciente: "BRUNO DIAS", "Editor financeiro": "CAIO PRADO" }),
    C({ Paciente: "BRUNO DIAS", "Editor financeiro": "DEBORA REIS" }),
  ];
  const prep = prepararAtendimentos(prod, []);
  const divs = [{ medico: "DR. RICARDO ALVES", detalhes: compararAtendimentos(prod, [], pCols, rCols, prep) }];
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: [], caixaRows: caixa, caixaCols: detectCaixaColumns(caixa), divergencias: divs });
  const at = Object.fromEntries(divs[0].detalhes.flatMap((p) => p.atendimentos).map((a) => [a.codigo, a]));
  assert.equal(at["1"].confianca, "exata");
  assert.deepEqual(at["1"].lancadoPor.map((l) => l.nome), ["BEATRIZ MONTEIRO"]);
  assert.equal(at["2"].confianca, "ambigua");
  assert.equal(at["2"].lancadoPor.length, 2);
  assert.equal(at["4"].confianca, "sem");
  assert.equal(cz.cobertura.divergencias.total, 4);
});

test("sem o Caixa, as guias não enviadas saem do mesmo jeito, só sem quem lançou", () => {
  const prod = [P({ "Quem enviou": "", "Data envio": "", "Número lote": "" }), P({ "Código Atendimento": "2" })];
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: [R({})], divergencias: [] });
  assert.equal(cz.comCaixa, false);
  assert.equal(cz.guiasNaoEnviadas.total.n, 1);
  assert.equal(cz.guiasNaoEnviadas.itens[0].confianca, "sem_caixa");
  assert.deepEqual(cz.ranking, []);
});

test("guias não enviadas: faixas, convênios do médico de fora, PIX de fora, lote = faturado e envio inválido ignorado no prazo", () => {
  const prod = [
    // Histórico do AMIL: maior prazo válido = 8 dias (02/09 → 10/09). O envio anterior ao atendimento é ignorado.
    P({ "Código Atendimento": "10", "Data Atendimento": "02/09/2026", "Data envio": "10/09/2026" }),
    P({ "Código Atendimento": "11", "Data Atendimento": "20/09/2026", "Data envio": "01/01/2026", "Número da guia": "5011" }),
    // Data de referência = 30/09 (envio mais recente válido).
    P({ "Código Atendimento": "12", "Data Atendimento": "22/09/2026", "Data envio": "30/09/2026", "Número da guia": "5012" }),
    P({ "Código Atendimento": "20", "Data Atendimento": "05/09/2026", "Quem enviou": "", "Data envio": "", "Número lote": "", "Número da guia": "6001", "Valor total do item R$": 80 }),
    P({ "Código Atendimento": "21", "Data Atendimento": "26/09/2026", "Quem enviou": "", "Data envio": "", "Número lote": "", "Número da guia": "6002" }),
    P({ "Código Atendimento": "22", "Data Atendimento": "03/09/2026", "Quem enviou": "", "Data envio": "", "Número lote": "77", "Número da guia": "6003" }),
    P({ "Código Atendimento": "30", "Forma de Pagamento": "UNIMED DR. BRENO", "Quem enviou": "", "Data envio": "", "Número lote": "" }),
    P({ "Código Atendimento": "31", "Forma de Pagamento": "Pix", "Quem enviou": "", "Data envio": "", "Número lote": "" }),
  ];
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: [], divergencias: [], opcoes: { conveniosMedico: ["UNIMED DR"] } });
  const g = cz.guiasNaoEnviadas;
  assert.equal(cz.dataReferencia, "30/09/2026");
  // O 22 tem "Número lote" sem "Quem enviou": já está faturado e fica fora do escopo.
  assert.deepEqual(g.itens.map((x) => [x.codigo, x.faixa]).sort(), [["20", "atrasada"], ["21", "no_prazo"]]);
  assert.equal(g.itens.find((x) => x.codigo === "20").dias, 25);
  assert.equal(g.itens.find((x) => x.codigo === "20").limiteDias, 8);
  assert.equal(g.foraDoEnvio.linhas, 1);
  assert.equal(g.total.n, 2);
  assert.equal(g.faixas.em_lote.n, 0);
  assert.equal(g.faixas.atrasada.valor, 80);
});

test("guia parcial só conta com um único paciente; número repetido entre pacientes é suspeita de numeração", () => {
  const prod = [
    P({ "Código Atendimento": "1", "Número da guia": "777", "Data Atendimento": "01/09/2026" }),
    P({ "Código Atendimento": "2", "Número da guia": "777", "Data Atendimento": "08/09/2026", "Quem enviou": "", "Data envio": "", "Número lote": "" }),
    P({ "Código Atendimento": "3", "Número da guia": "12", Paciente: "BRUNO DIAS", "Data Atendimento": "01/09/2026" }),
    P({ "Código Atendimento": "4", "Número da guia": "12", Paciente: "CLARA MELO", "Data Atendimento": "09/09/2026", "Quem enviou": "", "Data envio": "", "Número lote": "" }),
  ];
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: [], divergencias: [] });
  const porCod = Object.fromEntries(cz.guiasNaoEnviadas.itens.map((x) => [x.codigo, x]));
  assert.equal(porCod["2"].guiaParcial, true);
  assert.equal(porCod["4"].guiaParcial, undefined);
  assert.equal(cz.guiasMultiDia.total, 1);
  assert.equal(cz.guiasMultiDia.itens[0].envio, "parcial");
  assert.equal(cz.guiasMultiDia.suspeitasNumeracao, 1);
  // A lista de números repetidos guarda os pacientes e as datas, para conferir o cadastro.
  assert.equal(cz.guiasRepetidas.total, 1);
  assert.deepEqual(cz.guiasRepetidas.itens[0].pacientes, ["BRUNO DIAS", "CLARA MELO"]);
  assert.deepEqual(cz.guiasRepetidas.itens[0].datas, ["01/09/2026", "09/09/2026"]);
});

test("equipe: taxa por pessoa com base mínima, faixa da recepção, profissionais e faltas por médico", () => {
  const prod = [], caixa = [];
  // 5 atendentes com 20 guias cada: 1, 1, 2, 2 e 18 sem envio (a última fica acima do padrão).
  const naoEnviadas = { A: 1, B: 1, C: 2, D: 2, E: 18 };
  let cod = 0;
  for (const [letra, ne] of Object.entries(naoEnviadas)) {
    for (let i = 0; i < 20; i += 1) {
      cod += 1;
      const pac = `PAC ${letra}${i}`;
      prod.push(P({ "Código Atendimento": String(cod), Paciente: pac, "Número da guia": String(1000 + cod), ...(i < ne ? { "Quem enviou": "", "Data envio": "", "Número lote": "" } : {}) }));
      // Executantes variados: quem lança quase só para um médico seria classificada como secretária.
      const ex = ["DR. RICARDO ALVES", "DRA. LUCIA REIS", "DR. PAULO NUNES", "DRA. MARTA LINS"][i % 4];
      prod[prod.length - 1].Executante = ex; prod[prod.length - 1].Profissional = ex;
      caixa.push(C({ Paciente: pac, Executante: ex, "Editor financeiro": `ATENDENTE ${letra}` }));
    }
  }
  // Profissional lança o próprio atendimento e não envia a guia.
  prod.push(P({ "Código Atendimento": "900", Paciente: "PAC PROF", "Número da guia": "9900", "Quem enviou": "", "Data envio": "", "Número lote": "" }));
  caixa.push(C({ Paciente: "PAC PROF", "Editor financeiro": "DR. RICARDO ALVES" }));
  caixa.push(C({ Paciente: "FALTOSO", "Editor financeiro": "ATENDENTE A", Executante: "DRA. LUCIA REIS", "Forma de Pagamento": "Faltou" }));
  caixa.push(C({ Paciente: "CANCELA", "Editor financeiro": "ATENDENTE B", Executante: "DRA. LUCIA REIS", "Forma de Pagamento": "Cancelou" }));
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: [], caixaRows: caixa, caixaCols: detectCaixaColumns(caixa), divergencias: [] });
  const eq = analiseEquipe(cz);
  assert.equal(eq.taxa.faixaRecepcao.n, 5);
  assert.deepEqual(eq.taxa.acimaDoPadrao.map((r) => r.nome), ["ATENDENTE E"]);
  assert.equal(eq.taxa.acimaDoPadrao[0].taxa, 90);
  assert.ok(eq.taxa.fazemCerto.some((r) => r.nome === "ATENDENTE A"));
  // O profissional lançou só 1 guia: entra nos pontos cegos, mas não na taxa (base mínima de 10).
  assert.equal(eq.profissionais.guias, 1);
  assert.ok(!eq.taxa.porTaxa.some((r) => r.nome === "DR. RICARDO ALVES"));
  assert.equal(eq.faltas.faltas, 1);
  assert.equal(eq.faltas.cancelamentos, 1);
  assert.deepEqual(eq.faltas.porMedico.map((m) => [m.nome, m.faltas, m.cancelamentos]), [["DRA. LUCIA REIS", 1, 1]]);
  assert.ok(insightsCruzamento(cz).some((t) => /Taxa de guias sem envio da equipe/.test(t)));
  // Auditoria antiga (sem os campos novos) continua funcionando.
  const antigo = { ...cz, guiasRepetidas: undefined, faltas: undefined };
  const eqA = analiseEquipe(antigo);
  assert.equal(eqA.faltas.porMedico, null);
  assert.equal(eqA.faltas.faltas, 1);
  assert.equal(eqA.guiasRepetidas.completo, false);
  assert.equal(analiseEquipe({ ...cz, comCaixa: false }), null);
  // A IA recebe só números da equipe: nenhum nome de atendente, profissional ou paciente.
  const resumo = sanitizeResumo(JSON.parse(JSON.stringify(resumoParaIA({ cruzamento: cz }, eq))));
  const prompt = buildPrompt(resumo);
  assert.match(prompt, /taxa de guias de convenio sem envio da equipe/);
  assert.equal(resumo.equipe.acima, 1);
  for (const nome of ["ATENDENTE", "RICARDO", "LUCIA", "PAC ", "FALTOSO"]) assert.ok(!prompt.toUpperCase().includes(nome), nome);
});

test("ranking: taxa = não enviadas ÷ guias lançadas; profissional e conta do sistema identificados", () => {
  const prod = [], caixa = [];
  for (let i = 0; i < 4; i += 1) {
    const pac = `PACIENTE ${i}`;
    prod.push(P({ "Código Atendimento": String(i), Paciente: pac, ...(i === 0 ? { "Quem enviou": "", "Data envio": "", "Número lote": "" } : {}) }));
    caixa.push(C({ Paciente: pac }));
  }
  prod.push(P({ "Código Atendimento": "9", Paciente: "OUTRO", "Quem enviou": "", "Data envio": "", "Número lote": "" }));
  caixa.push(C({ Paciente: "OUTRO", "Editor financeiro": "DR. RICARDO ALVES" }));
  caixa.push(C({ Paciente: "SEM ATENDIMENTO", "Editor financeiro": "MEDICAL HUB", "Forma de Pagamento": "Cancelou" }));
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: [], caixaRows: caixa, caixaCols: detectCaixaColumns(caixa), divergencias: [] });
  const bea = cz.ranking.find((r) => r.nome === "BEATRIZ MONTEIRO");
  assert.equal(bea.tipo, "atendente");
  assert.equal(bea.guiasLancadas, 4);
  assert.equal(bea.guiasNaoEnviadas, 1);
  assert.equal(bea.taxaGuias, 25);
  assert.equal(cz.ranking.find((r) => r.nome === "DR. RICARDO ALVES").tipo, "profissional");
  const hub = cz.ranking.find((r) => r.nome === "MEDICAL HUB");
  assert.equal(hub.tipo, "sistema");
  assert.equal(hub.cancelamentos, 1);
  assert.ok(insightsCruzamento(cz).some((t) => /Beatriz Monteiro/.test(t)));
});

test("preferências: lista de convênios aceita texto livre, remove repetidos e mantém o padrão em registros antigos", () => {
  assert.deepEqual(parseConvenios("UNIMED DR., unimed dr.; CASSI DRA. NELMA\n "), ["UNIMED DR.", "CASSI DRA. NELMA"]);
  assert.deepEqual(normalizePreferences({ tolerancia: "0,01" }).conveniosMedico, ["UNIMED DR.", "UNIMED DRA."]);
  assert.deepEqual(normalizePreferences({ conveniosMedico: [] }).conveniosMedico, []);
});

test("escopo: só o não faturado (lote e Quem enviou vazios); o Repasse acompanha pelo código", () => {
  const NAO = { "Quem enviou": "", "Data envio": "", "Número lote": "" };
  const prod = [
    P({ "Código Atendimento": "1" }),                                   // faturado (lote + envio)
    P({ "Código Atendimento": "2", "Quem enviou": "", "Data envio": "" }), // só lote: faturado
    P({ "Código Atendimento": "3", "Número lote": "" }),                 // só envio: faturado
    P({ "Código Atendimento": "4", ...NAO }),                            // não faturado
    P({ "Código Atendimento": "5", "Grupo de Convênio": "PARTICULAR", "Forma de Pagamento": "Dinheiro", "Número lote": " - ", ...NAO }), // particular: nunca faturado
    P({ "Código Atendimento": "6" }), P({ "Código Atendimento": "6", Item: "ECG", ...NAO }), // atendimento com item ainda aberto: entra inteiro
  ];
  const rep = [R({ "Cód. atendimento": "1" }), R({ "Cód. atendimento": "2" }), R({ "Cód. atendimento": "4" }), R({ "Cód. atendimento": "6" }),
    R({ "Cód. atendimento": "99" }), R({ "Cód. atendimento": "" })];
  const e = escopoNaoFaturado(prod, rep);
  assert.equal(e.aplicado, true);
  assert.deepEqual(e.prod.map((r) => r["Código Atendimento"]), ["4", "5", "6", "6"]);
  assert.deepEqual(e.foraProd.map((r) => r["Código Atendimento"]), ["1", "2", "3"]);
  assert.equal(e.atendimentosFora, 3);
  // Sai do Repasse só o atendimento todo faturado; sem código ou fora da Produção continua (é divergência a conferir).
  assert.deepEqual(e.rep.map((r) => r["Cód. atendimento"]), ["4", "6", "99", ""]);
  assert.deepEqual(e.foraRep.map((r) => r["Cód. atendimento"]), ["1", "2"]);
});

test("escopo: sem colunas de faturamento ou sem código, nada muda e o motivo é informado", () => {
  const generica = [{ Médico: "X", Paciente: "A", Valor: 10 }];
  const a = escopoNaoFaturado(generica, generica);
  assert.equal(a.aplicado, false);
  assert.equal(a.motivo, "sem_colunas");
  assert.equal(a.prod, generica);
  const prod = [P({}), P({ "Código Atendimento": "2", "Quem enviou": "", "Data envio": "", "Número lote": "" })];
  const b = escopoNaoFaturado(prod, [{ Médico: "X", Paciente: "A", Valor: 10 }]);
  assert.equal(b.aplicado, false);
  assert.equal(b.motivo, "sem_codigo");
  assert.equal(b.prod.length, 2);
  // Tudo ainda aberto: escopo aplicado, nada sai.
  const c = escopoNaoFaturado([prod[1]], [R({ "Cód. atendimento": "2" })]);
  assert.equal(c.aplicado, true);
  assert.equal(c.foraProd.length + c.foraRep.length, 0);
});

test("guias de vários dias e números repetidos: só guias com algum atendimento ainda não faturado", () => {
  const prod = [
    P({ "Código Atendimento": "1", "Número da guia": "500", "Data Atendimento": "01/09/2026" }),
    P({ "Código Atendimento": "2", "Número da guia": "500", "Data Atendimento": "08/09/2026" }),
    P({ "Código Atendimento": "3", "Número da guia": "12", Paciente: "BRUNO DIAS", "Data Atendimento": "01/09/2026" }),
    P({ "Código Atendimento": "4", "Número da guia": "12", Paciente: "CLARA MELO", "Data Atendimento": "09/09/2026" }),
  ];
  const cz = analisarCruzamento({ prodTodas: prod, repTodas: [], divergencias: [] });
  assert.equal(cz.guiasMultiDia.total, 0);
  assert.equal(cz.guiasRepetidas.total, 0);
  assert.equal(cz.guiasNaoEnviadas.total.n, 0);
});

test("IA: o prompt diz que o escopo é só o não faturado", () => {
  const resumo = sanitizeResumo(JSON.parse(JSON.stringify(resumoParaIA({ escopo: { naoFaturado: true, foraProd: { linhas: 3 }, foraRep: { linhas: 2 } } }))));
  assert.match(buildPrompt(resumo), /AINDA NAO FATURADOS.*5 linhas ja faturadas/);
  assert.doesNotMatch(buildPrompt(sanitizeResumo(resumoParaIA({}))), /Escopo/);
});
