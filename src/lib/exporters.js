// Movido de auditoria-medica.jsx sem alteração de comportamento.
// O conteúdo dos arquivos exportados (Excel e PDF) não deve mudar com o redesign.
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── ENGINE: EXPORT ───────────────────────────────────────────────────────────

export function exportExcel(res) {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([
    ["AUDITORIA DE PRODUÇÃO MÉDICA"],
    [],
    ["Gerado em:",         res.processadoEm],
    ["Referência:",        res.referencia],
    ["Arquivo Produção:",  res.file1Name],
    ["Arquivo Repasse:",   res.file2Name],
    [],
    ["RESUMO EXECUTIVO"],
    ["Médicos analisados",             res.totalMedicos],
    ["Médicos com divergência",        res.medicosComDivergencia],
    ["Total divergências (pacientes)", res.totalDivergencias],
    ["Valor total divergente",         res.valorTotal],
    [],
    ["INSIGHTS"],
    ...res.insights.map((i) => ["•", i]),
  ]);
  XLSX.utils.book_append_sheet(wb, ws1, "Resumo");

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["Médico", "Total Produção", "Total Repasse", "Diferença", "Status"],
    ...res.divergencias.map((d) => [d.medico, d.producao, d.repasse, d.diferenca, d.status]),
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, "Médicos");

  const ws3rows = [["Médico", "Paciente", "Produção", "Repasse", "Diferença", "Tipo de Divergência"]];
  res.divergencias.forEach((d) =>
    d.detalhes.forEach((p) =>
      ws3rows.push([d.medico, p.paciente, p.producao, p.repasse, p.diferenca, p.tipo])
    )
  );
  const ws3 = XLSX.utils.aoa_to_sheet(ws3rows);
  XLSX.utils.book_append_sheet(wb, ws3, "Pacientes");

  XLSX.writeFile(wb, `auditoria-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportPDF(res) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Auditoria de Produção Médica", 14, 17);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(res.processadoEm, W - 14, 17, { align: "right" });

  let y = 36;
  doc.setTextColor(15, 23, 42);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO EXECUTIVO", 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const metricPairs = [
    [`Médicos analisados: ${res.totalMedicos}`,       `Médicos com divergência: ${res.medicosComDivergencia}`],
    [`Total divergências: ${res.totalDivergencias}`,  `Valor divergente: ${res.valorTotal}`],
  ];
  metricPairs.forEach(([a, b]) => {
    doc.text(a, 14, y);
    doc.text(b, W / 2, y);
    y += 6;
  });
  y += 4;

  if (res.divergencias.length) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("MÉDICOS COM DIVERGÊNCIA", 14, y);
    autoTable(doc, {
      startY: y + 3,
      head:   [["Médico", "Produção", "Repasse", "Diferença"]],
      body:   res.divergencias.map((d) => [d.medico, d.producao, d.repasse, d.diferenca]),
      styles:            { fontSize: 8, cellPadding: 2.5 },
      headStyles:        { fillColor: [99, 102, 241], textColor: 255 },
      alternateRowStyles:{ fillColor: [248, 250, 252] },
      margin:            { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (res.insights.length) {
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ANÁLISE INTELIGENTE", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    res.insights.forEach((ins) => {
      const lines = doc.splitTextToSize(`• ${ins}`, W - 28);
      if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
      doc.text(lines, 14, y);
      y += lines.length * 5 + 3;
    });
  }

  doc.save(`auditoria-${new Date().toISOString().slice(0, 10)}.pdf`);
}
