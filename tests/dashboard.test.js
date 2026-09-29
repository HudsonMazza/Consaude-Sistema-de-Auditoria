import test from "node:test";
import assert from "node:assert/strict";
import { matchesAuditScope, summarizeAudits } from "../src/dashboard.js";

const audits = [
  {
    id: "a1", userId: "ana", createdAt: new Date("2026-08-12"), divergencias: 2,
    resultados: { valorTotalRaw: 250, totalDivergencias: 3, divergencias: [{ medico: "Dra. Ana", diferencaRaw: 250, sentido: "rep_maior" }] },
  },
  {
    id: "a2", userId: "bruno", createdAt: new Date("2026-07-02"), divergencias: 0,
    resultados: { valorTotalRaw: 0, totalDivergencias: 0, divergencias: [] },
  },
  {
    id: "a3", userId: "ana", createdAt: new Date("2026-04-02"), divergencias: 1,
    resultados: { valorTotalRaw: 90, totalDivergencias: 1, divergencias: [{ medico: "Dr. Beto", diferencaRaw: 90, sentido: "prod_maior" }] },
  },
];

test("resume só auditorias do período e usuário selecionados", () => {
  const result = summarizeAudits(audits, { months: 3, userId: "ana", now: new Date("2026-09-28") });

  assert.equal(result.audits.length, 1);
  assert.deepEqual(result.metrics, {
    audits: 1,
    auditsWithDifferences: 1,
    totalDifferences: 3,
    divergentValue: 250,
    differenceRate: 100,
  });
  assert.equal(result.direction.rep_maior, 1);
  assert.equal(result.direction.prod_maior, 0);
});

test("agrupa série mensal e médicos prioritários", () => {
  const result = summarizeAudits(audits, { months: 6, now: new Date("2026-09-28") });

  assert.equal(result.months.length, 6);
  assert.equal(result.months.at(-2).audits, 1);
  assert.deepEqual(result.topDoctors[0], { name: "Dra. Ana", value: 250 });
});

test("escopo minhas auditorias do administrador usa id real", () => {
  assert.equal(matchesAuditScope({ userId: "ana" }, "mine", "ana"), true);
  assert.equal(matchesAuditScope({ userId: "bruno" }, "mine", "ana"), false);
  assert.equal(matchesAuditScope({ userId: "bruno" }, "all", "ana"), true);
});
