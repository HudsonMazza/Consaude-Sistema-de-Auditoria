// Relatório IA: análise da OpenAI (prompt inalterado) + HTML autocontido no visual do design system ConSaúde.
import { brl, parseValue } from "./engine.js";

// ─── AI REPORT ───────────────────────────────────────────────────────────────

export async function fetchAIAnalysis(res, apiKey) {
  const pct  = Math.round((res.medicosComDivergencia / res.totalMedicos) * 100);
  const sobre = res.divergencias.filter(d => d.sentido === "rep_maior");
  const sub   = res.divergencias.filter(d => d.sentido === "prod_maior");
  const vS = sobre.reduce((s,d)=>s+d.diferencaRaw,0);
  const vU = sub.reduce((s,d)=>s+d.diferencaRaw,0);
  const tf = {}; res.divergencias.flatMap(d=>d.detalhes.map(p=>p.tipo)).forEach(t=>{tf[t]=(tf[t]||0)+1;});
  const top5 = res.divergencias.slice(0,5).map(d=>d.medico+": "+(d.sentido==="rep_maior"?"Rep":"Prod")+" maior em "+d.diferenca).join("; ");

  const prompt = "Voce e um auditor financeiro senior especialista em clinicas medicas no Brasil.\n"
    +"Analise os dados de auditoria abaixo e responda APENAS com JSON valido (sem markdown).\n\n"
    +"DADOS:\n"
    +"- Referencia: "+res.referencia+"\n"
    +"- "+res.totalMedicos+" medicos, "+res.medicosComDivergencia+" com divergencia ("+pct+"%)\n"
    +"- Valor divergente: "+res.valorTotal+"\n"
    +"- Repasse>Producao (sobrepagamento): "+sobre.length+" medicos, "+brl(vS)+"\n"
    +"- Producao>Repasse (subpagamento): "+sub.length+" medicos, "+brl(vU)+"\n"
    +"- Top casos: "+top5+"\n"
    +"- Tipos de divergencia: "+JSON.stringify(tf)+"\n\n"
    +"Responda EXATAMENTE neste JSON (todos campos obrigatorios, portugues, profissional):\n"
    +JSON.stringify({
      resumoExecutivo:"1-2 frases executivas",
      interpretacaoRisco:"1 frase sobre o nivel de risco",
      analisesPorTipo:[{tipo:"nome exato",interpretacao:"significado em 1-2 frases",prevencao:"como prevenir"}],
      planoDeAcao:[{acao:"acao concreta",prazo:"48 horas",responsavel:"Equipe de Faturamento",impacto:"impacto esperado",urgencia:"alta"}],
      insights:["observacao 1","observacao 2","observacao 3"],
      anomalias:["padrao 1","padrao 2"],
      recomendacoes:["recomendacao 1","recomendacao 2","recomendacao 3"],
      conclusao:"1-2 frases de conclusao"
    },null,2);

  const r = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({
      model:"gpt-4o",
      messages:[{role:"user",content:prompt}],
      response_format:{type:"json_object"},
      max_tokens:2500,
      temperature:0.25,
    }),
  });
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message??"Erro "+r.status+" na API OpenAI");}
  const d=await r.json();
  return JSON.parse(d.choices[0].message.content);
}

// ─── HTML DO RELATÓRIO (design system ConSaúde) ──────────────────────────────
// Arquivo autocontido: sem scripts externos (abre offline e cabe no histórico do Firestore).
// Tokens copiados de src/styles/tokens.css — mantenha os dois em sincronia.

const BRL_FMT = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const INT_FMT = new Intl.NumberFormat("pt-BR");
const PARTICLES = new Set(["de", "da", "do", "das", "dos", "e", "di", "du"]);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (n) => BRL_FMT.format(Math.abs(Number(n) || 0)).replace(/\s/g, " ");
const signedMoney = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + money(n);
const count = (n) => INT_FMT.format(Number(n) || 0);
const plural = (n, one, many) => `${count(n)} ${n === 1 ? one : many}`;
const pad = (n) => String(n).padStart(2, "0");
const capitalize = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "");

function titleCase(name = "") {
  return String(name ?? "").toLowerCase().split(/\s+/).filter(Boolean)
    .map((w, i) => (i > 0 && PARTICLES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
}
function initials(name = "") {
  const parts = String(name).split(/\s+/).filter((w) => w && !PARTICLES.has(w.toLowerCase()));
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}
function splitProcessed(text) {
  const [date, time = ""] = String(text || "").split(/,\s*/);
  return { date: date || "—", time: time.slice(0, 5) };
}

// Lucide (ISC), traço 1.75
const ICONS = {
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  up: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  down: '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  trend: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  list: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  expand: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
};
const icon = (name, size = 16) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

const RISK = [
  { max: 10, key: "baixo", label: "Baixo", tone: "success", range: "até 10%" },
  { max: 25, key: "medio", label: "Médio", tone: "warning", range: "10–25%" },
  { max: 50, key: "alto", label: "Alto", tone: "danger", range: "25–50%" },
  { max: Infinity, key: "critico", label: "Crítico", tone: "danger", range: "acima de 50%" },
];
const prioridade = (raw) => (raw > 500 ? { label: "Alta", tone: "danger" } : raw > 100 ? { label: "Média", tone: "warning" } : { label: "Baixa", tone: "neutral" });
const URGENCIA = { alta: { label: "Alta", tone: "danger" }, media: { label: "Média", tone: "warning" }, "média": { label: "Média", tone: "warning" }, baixa: { label: "Baixa", tone: "neutral" } };

const docDiff = (d) => { const raw = Number(d?.diferencaRaw) || 0; return d?.sentido === "rep_maior" ? raw : -raw; };
const patDiff = (p) => parseValue(p?.repasse) - parseValue(p?.producao);

function dirTag(n, { compact = false } = {}) {
  if (!n) return '<span class="tag tag--neutral">Conforme</span>';
  const rep = n > 0;
  return `<span class="tag tag--${rep ? "rep" : "prod"}">${icon(rep ? "up" : "down", 14)}${compact ? (rep ? "Repasse" : "Produção") : rep ? "Repasse maior" : "Produção maior"}</span>`;
}
const diffValue = (n) => `<span class="num diff ${n > 0 ? "is-rep" : n < 0 ? "is-prod" : ""}">${signedMoney(n)}</span>`;
const badge = (tone, text, ic) => `<span class="badge badge--${tone}">${ic ? icon(ic, 14) : ""}${esc(text)}</span>`;

const CSS = `
:root,[data-theme="dark"]{color-scheme:dark;--bg:#16171a;--surface:#1c1d21;--surface-2:#232429;--surface-3:#2a2b31;--line:#2b2c32;--line-strong:#737782;--ink:#f2f3f5;--ink-2:#a6a9b2;--ink-3:#9196a1;--accent:#3b82e0;--accent-fill:#1f63c8;--accent-text:#7db4ff;--accent-soft:#172a45;--on-accent:#fff;--accent-deep:#1a2b6b;--soft-blue:#c9e0fa;--success:#3fcf8e;--success-soft:#173026;--warning:#f5b94a;--warning-soft:#352b17;--danger:#f47a82;--danger-soft:#3a1e23;--ia:#b99bff;--ia-soft:#2c2544;--dir-rep:#f7954a;--dir-rep-soft:#3a2518;--dir-prod:#7db4ff;--dir-prod-soft:#172a45;--chart-track:#2e3036;--hero-bg:#1a2b6b;--shadow:0 0 0 1px var(--line)}
[data-theme="light"]{color-scheme:light;--bg:#f3f4f7;--surface:#fff;--surface-2:#f6f7fa;--surface-3:#eef0f5;--line:#e4e6ec;--line-strong:#858a96;--ink:#16171a;--ink-2:#4a4e59;--ink-3:#646978;--accent:#1e63c4;--accent-fill:#0b55b8;--accent-text:#0b55b8;--accent-soft:#e6f0fc;--accent-deep:#1a2b6b;--success:#137535;--success-soft:#e6f5eb;--warning:#8f5a06;--warning-soft:#fcf2dc;--danger:#b42331;--danger-soft:#fdecee;--ia:#7c3aed;--ia-soft:#f2ecfe;--dir-rep:#b4500e;--dir-rep-soft:#fdeee3;--dir-prod:#0b55b8;--dir-prod-soft:#e6f0fc;--chart-track:#e3e6ee;--hero-bg:#1a2b6b;--shadow:0 1px 2px rgba(22,23,26,.06),0 0 0 1px var(--line)}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:20px;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;font-feature-settings:"cv11"}
.ic{flex-shrink:0;display:inline-block;vertical-align:middle}
.num{font-variant-numeric:tabular-nums;white-space:nowrap}
.wrap{max-width:1200px;margin:0 auto;padding:0 32px}
/* topbar */
.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.brand img{width:36px;height:36px;object-fit:contain;flex-shrink:0}
.brand__mark{width:36px;height:36px;border-radius:10px;background:var(--accent-fill);color:#fff;display:grid;place-items:center}
.brand__name{font-size:17px;font-weight:600;line-height:22px;letter-spacing:-.01em}
.brand__name b{color:var(--accent-text);font-weight:600}
.brand__sub{font-size:12px;line-height:16px;color:var(--ink-3)}
.actions{display:flex;gap:8px;align-items:center}
.btn{font:inherit;font-weight:500;font-size:13px;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--line-strong);background:transparent;color:var(--ink);cursor:pointer;transition:background .12s}
.btn:hover{background:var(--surface-3)}
.btn--icon{width:36px;padding:0;justify-content:center}
.btn:focus-visible,summary:focus-visible{outline:2px solid var(--accent-text);outline-offset:2px}
/* header */
.head{padding:36px 0 24px}
.over{display:inline-flex;align-items:center;gap:6px;font-size:11px;line-height:16px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ia)}
h1{font-size:30px;line-height:38px;font-weight:600;letter-spacing:-.02em;margin:6px 0 8px}
.meta{display:flex;flex-wrap:wrap;gap:4px 16px;color:var(--ink-2);font-size:13px;line-height:18px}
.meta span{display:inline-flex;align-items:center;gap:6px}
/* grid */
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:20px;margin-bottom:20px}
.s12{grid-column:span 12}.s8{grid-column:span 8}.s7{grid-column:span 7}.s6{grid-column:span 6}.s5{grid-column:span 5}.s4{grid-column:span 4}
.card{background:var(--surface);border-radius:14px;box-shadow:var(--shadow);padding:20px;min-width:0}
.card__h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}
.card__t{font-size:16px;line-height:24px;font-weight:600;display:flex;align-items:center;gap:8px}
.card__d{font-size:13px;line-height:18px;color:var(--ink-2);margin-top:2px}
/* hero */
.hero{background:var(--hero-bg);color:#fff;border-radius:14px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;gap:20px;position:relative;overflow:hidden}
.hero::after{content:"";position:absolute;right:-60px;top:-80px;width:260px;height:260px;border-radius:50%;background:radial-gradient(closest-side,rgba(59,130,224,.45),transparent);pointer-events:none}
.hero__l{font-size:13px;color:var(--soft-blue)}
.hero__v{font-size:40px;line-height:48px;font-weight:600;letter-spacing:-.02em;margin-top:4px}
.hero__s{font-size:13px;color:var(--soft-blue);margin-top:4px}
.hero__row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;position:relative;z-index:1}
.pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:999px;background:var(--soft-blue);color:#1a2b6b;font-size:12px;font-weight:600;white-space:nowrap}
.hero__split{display:grid;grid-template-columns:1fr 1fr;gap:12px;position:relative;z-index:1}
.hero__tile{background:rgba(255,255,255,.08);border-radius:10px;padding:12px 14px}
.hero__tile .k{font-size:12px;color:var(--soft-blue);display:flex;align-items:center;gap:6px}
.hero__tile .v{font-size:18px;font-weight:600;margin-top:2px}
/* ai summary */
.ai{background:var(--ia-soft);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:12px}
.ai__h{display:flex;align-items:center;gap:8px;color:var(--ia);font-weight:600;font-size:13px}
.ai p{font-size:15px;line-height:24px;color:var(--ink)}
.ai .risk-line{font-size:13px;line-height:20px;color:var(--ink-2)}
/* kpis */
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.kpi{background:var(--surface-2);border-radius:10px;padding:14px 16px}
.kpi .k{font-size:12px;line-height:16px;color:var(--ink-2);font-weight:500}
.kpi .v{font-size:22px;line-height:28px;font-weight:600;margin-top:6px}
.kpi .s{font-size:12px;line-height:16px;color:var(--ink-3);margin-top:2px}
/* badges */
.badge,.tag{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border-radius:999px;font-size:12px;line-height:16px;font-weight:500;white-space:nowrap}
.badge--success{background:var(--success-soft);color:var(--success)}
.badge--warning{background:var(--warning-soft);color:var(--warning)}
.badge--danger{background:var(--danger-soft);color:var(--danger)}
.badge--neutral,.tag--neutral{background:var(--surface-3);color:var(--ink-2)}
.badge--ia{background:var(--ia-soft);color:var(--ia)}
.tag--rep{background:var(--dir-rep-soft);color:var(--dir-rep)}
.tag--prod{background:var(--dir-prod-soft);color:var(--dir-prod)}
.diff{font-weight:600}.diff.is-rep{color:var(--dir-rep)}.diff.is-prod{color:var(--dir-prod)}
/* direction */
.dirbar{display:flex;gap:2px;height:14px;border-radius:999px;overflow:hidden;background:var(--chart-track)}
.dirbar i{display:block;height:100%}
.dirbar .rep{background:var(--dir-rep)}.dirbar .prod{background:var(--accent)}
.dircols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.dircol{background:var(--surface-2);border-radius:10px;padding:14px 16px}
.dircol__h{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}
.dircol__v{font-size:20px;line-height:28px;font-weight:600}
.dircol__s{font-size:12px;color:var(--ink-3);margin-bottom:8px}
.mini{list-style:none}
.mini li{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid var(--line);font-size:13px}
.mini li span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-2)}
.mini .more{color:var(--ink-3);font-size:12px}
/* risk meter */
.meter{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:18px 0 8px}
.meter i{display:block;height:10px;border-radius:999px;background:var(--chart-track)}
.meter i.on.success{background:var(--success)}.meter i.on.warning{background:var(--warning)}.meter i.on.danger{background:var(--danger)}
.meter-l{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:11px;line-height:14px;color:var(--ink-3)}
.meter-l b{display:block;color:var(--ink-2);font-weight:500}
.meter-l .cur b{color:var(--ink);font-weight:600}
.riskv{display:flex;align-items:baseline;gap:10px}
.riskv .v{font-size:32px;line-height:40px;font-weight:600}
/* bars */
.bars{display:flex;flex-direction:column;gap:10px}
.bar{display:grid;grid-template-columns:minmax(120px,240px) 1fr 120px;gap:12px;align-items:center;font-size:13px}
.bar__n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-2)}
.bar__t{height:12px;border-radius:999px;background:var(--chart-track);overflow:hidden}
.bar__t i{display:block;height:100%;border-radius:999px}
.bar__t .rep{background:var(--dir-rep)}.bar__t .prod{background:var(--accent)}
.bar .num{text-align:right}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--ink-2)}
.legend span{display:inline-flex;align-items:center;gap:6px}
.legend i{width:10px;height:10px;border-radius:3px;display:inline-block}
.note{font-size:12px;color:var(--ink-3);margin-top:12px}
/* table */
.tbl{width:100%;border-collapse:separate;border-spacing:0;font-size:13px}
.tbl th{font-size:12px;line-height:16px;font-weight:500;color:var(--ink-2);text-align:left;padding:10px 12px;background:var(--surface-2);border-bottom:1px solid var(--line);white-space:nowrap}
.tbl th:first-child{border-top-left-radius:10px}.tbl th:last-child{border-top-right-radius:10px}
.tbl td{padding:12px;border-bottom:1px solid var(--line);vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}
.tbl tbody tr:hover td{background:var(--surface-3)}
.tbl .r{text-align:right}
.who{display:flex;align-items:center;gap:10px;min-width:0}
.av{width:32px;height:32px;border-radius:50%;background:var(--accent-soft);color:var(--accent-text);display:grid;place-items:center;font-size:12px;font-weight:600;flex-shrink:0}
.who b{font-weight:500;display:block}
.who small{font-size:12px;color:var(--ink-3)}
.muted{color:var(--ink-2)}
/* accordion */
.acc{border:1px solid var(--line);border-radius:10px;margin-bottom:8px;overflow:hidden;background:var(--surface)}
.acc summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:12px 16px}
.acc summary::-webkit-details-marker{display:none}
.acc summary:hover{background:var(--surface-3)}
.acc .grow{flex:1;min-width:0}
.acc .chev{color:var(--ink-3);transition:transform .2s}
.acc[open] .chev{transform:rotate(180deg)}
.acc__b{padding:4px 16px 16px}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.tile{background:var(--surface-2);border-radius:10px;padding:10px 12px}
.tile .k{font-size:12px;color:var(--ink-2)}.tile .v{font-size:15px;font-weight:600;margin-top:2px}
.empty{padding:16px;text-align:center;color:var(--ink-3);font-size:13px;background:var(--surface-2);border-radius:10px}
/* types */
.type{padding:14px 0;border-top:1px solid var(--line)}
.type:first-child{border-top:none;padding-top:0}
.type__h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
.type__n{font-weight:600}
.type__bar{height:8px;border-radius:999px;background:var(--chart-track);overflow:hidden;margin-bottom:8px}
.type__bar i{display:block;height:100%;background:var(--accent);border-radius:999px}
.type p{font-size:13px;line-height:20px;color:var(--ink-2)}
.type p b{color:var(--ink);font-weight:500}
/* action plan */
.step{display:grid;grid-template-columns:32px 1fr auto;gap:14px;align-items:start;padding:14px 0;border-top:1px solid var(--line)}
.step:first-child{border-top:none;padding-top:0}
.step__n{width:32px;height:32px;border-radius:50%;background:var(--accent-soft);color:var(--accent-text);display:grid;place-items:center;font-weight:600;font-size:13px}
.step__t{font-weight:500;line-height:20px}
.step__m{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:6px;font-size:12px;color:var(--ink-2)}
.step__m span{display:inline-flex;align-items:center;gap:5px}
/* lists */
.li{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line);font-size:13px;line-height:20px;color:var(--ink-2)}
.li:first-child{border-top:none;padding-top:0}
.li .ic{margin-top:2px}
.li--ia .ic{color:var(--ia)}.li--warn .ic{color:var(--warning)}.li--ok .ic{color:var(--success)}
.conc{margin-top:20px;background:var(--accent-soft);border-radius:10px;padding:16px;font-size:14px;line-height:22px}
.conc b{color:var(--accent-text);font-weight:600}
/* footer */
.foot{border-top:1px solid var(--line);margin-top:12px;padding:20px 0 40px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;font-size:12px;color:var(--ink-3)}
.foot .brand__name{font-size:14px}
.disclaimer{display:flex;gap:8px;align-items:flex-start;font-size:12px;color:var(--ink-3);margin-top:4px}
/* responsive */
@media (max-width:1023px){.s8,.s7,.s6,.s5,.s4{grid-column:span 12}.kpis{grid-template-columns:repeat(2,1fr)}}
@media (max-width:719px){
  .wrap{padding:0 16px}.top .wrap{height:56px}.brand__sub{display:none}.btn .lbl{display:none}.btn{width:40px;height:40px;padding:0;justify-content:center}
  h1{font-size:22px;line-height:28px}.head{padding:24px 0 16px}.grid{gap:12px;margin-bottom:12px}.card{padding:16px}
  .hero__v{font-size:30px;line-height:38px}.hero__row{flex-direction:column-reverse}.card__h{flex-wrap:wrap}.hero__split,.dircols,.tiles{grid-template-columns:1fr}
  .bar{grid-template-columns:1fr auto;gap:4px 12px}.bar__t{grid-column:1/-1;grid-row:2}
  .tbl thead{display:none}.tbl,.tbl tbody,.tbl tr,.tbl td{display:block;width:100%}
  .tbl tr{border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin-bottom:8px}
  .tbl td{border:none;padding:6px 0;display:flex;justify-content:space-between;gap:12px;text-align:right}
  .tbl td::before{content:attr(data-l);color:var(--ink-3);font-size:12px;text-align:left}
  .tbl td.first{display:block;text-align:left}.tbl td.first::before{content:none}
  .tbl tbody tr:hover td{background:none}
  .step{grid-template-columns:32px 1fr}.step .badge{grid-column:2;justify-self:start}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
@media print{
  :root,[data-theme]{color-scheme:light;--bg:#fff;--surface:#fff;--surface-2:#f6f7fa;--surface-3:#eef0f5;--line:#e4e6ec;--ink:#16171a;--ink-2:#4a4e59;--ink-3:#646978;--accent:#1e63c4;--accent-text:#0b55b8;--accent-soft:#e6f0fc;--success:#137535;--success-soft:#e6f5eb;--warning:#8f5a06;--warning-soft:#fcf2dc;--danger:#b42331;--danger-soft:#fdecee;--ia:#7c3aed;--ia-soft:#f2ecfe;--dir-rep:#b4500e;--dir-rep-soft:#fdeee3;--dir-prod:#0b55b8;--dir-prod-soft:#e6f0fc;--chart-track:#e3e6ee;--shadow:0 0 0 1px #e4e6ec}
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:12px}
  .top{position:static;backdrop-filter:none}.actions{display:none}
  .card,.hero,.ai,.acc,.step,.type{break-inside:avoid}
  .acc summary .chev{display:none}
  .wrap{max-width:none;padding:0}
  @page{margin:14mm}
}`;

const SCRIPT = `(function(){var d=document.documentElement;
function set(t){d.setAttribute("data-theme",t);try{localStorage.setItem("cs-report-theme",t)}catch(e){}var b=document.getElementById("tt");if(b){b.setAttribute("aria-label",t==="dark"?"Usar tema claro":"Usar tema escuro");b.innerHTML=t==="dark"?b.dataset.sun:b.dataset.moon}}
try{var s=localStorage.getItem("cs-report-theme");if(s)set(s)}catch(e){}
document.addEventListener("click",function(e){var t=e.target.closest("[data-act]");if(!t)return;var a=t.getAttribute("data-act");
if(a==="theme")set(d.getAttribute("data-theme")==="dark"?"light":"dark");
if(a==="print")window.print();
if(a==="expand"){var all=document.querySelectorAll("details.acc");var open=Array.prototype.some.call(all,function(x){return!x.open});all.forEach(function(x){x.open=open});t.querySelector(".lbl").textContent=open?"Recolher todos":"Expandir todos"}});
var prev=[];window.addEventListener("beforeprint",function(){prev=[];document.querySelectorAll("details.acc").forEach(function(x){prev.push(x.open);x.open=true})});
window.addEventListener("afterprint",function(){document.querySelectorAll("details.acc").forEach(function(x,i){x.open=!!prev[i]})});
set(d.getAttribute("data-theme")||"dark")})();`;

/**
 * Monta o HTML do relatório IA no visual do design system.
 * opts: { logoDataUrl, responsavel, theme: 'dark'|'light', now: Date }
 */
export function buildReportHTML(res, ai = {}, opts = {}) {
  const now = opts.now instanceof Date ? opts.now : new Date();
  const theme = opts.theme === "light" ? "light" : "dark";
  const divs = Array.isArray(res?.divergencias) ? res.divergencias : [];
  const totalMed = Number(res?.totalMedicos) || 0;
  const comDiv = Number(res?.medicosComDivergencia) || divs.length;
  const pct = totalMed ? Math.round((comDiv / totalMed) * 100) : 0;
  const risk = RISK.find((r) => pct < r.max) || RISK[RISK.length - 1];
  const riskIdx = RISK.indexOf(risk);

  const sobre = divs.filter((d) => d.sentido === "rep_maior");
  const sub = divs.filter((d) => d.sentido === "prod_maior");
  const vS = sobre.reduce((s, d) => s + (Number(d.diferencaRaw) || 0), 0);
  const vU = sub.reduce((s, d) => s + (Number(d.diferencaRaw) || 0), 0);
  const totalRaw = vS + vU;
  const shareS = totalRaw ? Math.round((vS / totalRaw) * 100) : 0;

  const tf = {};
  divs.flatMap((d) => (d.detalhes || []).map((p) => p.tipo)).forEach((t) => { if (t) tf[t] = (tf[t] || 0) + 1; });
  const tipos = Object.entries(tf).sort((a, b) => b[1] - a[1]);
  const totalTipos = tipos.reduce((s, [, n]) => s + n, 0);

  const ref = capitalize(res?.referencia || "Auditoria");
  const proc = splitProcessed(res?.processadoEm);
  const gerado = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} às ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const logo = opts.logoDataUrl
    ? `<img src="${esc(opts.logoDataUrl)}" alt="">`
    : `<span class="brand__mark">${icon("activity", 20)}</span>`;
  const brand = (sub = true) => `<div class="brand">${logo}<div><div class="brand__name">Con<b>Saúde</b></div>${sub ? '<div class="brand__sub">Auditoria financeira</div>' : ""}</div></div>`;

  // Direção
  const miniList = (list) => {
    if (!list.length) return '<ul class="mini"><li><span>Nenhum médico nesta direção</span></li></ul>';
    const items = list.slice(0, 5).map((d) => `<li><span title="${esc(d.medico)}">${esc(titleCase(d.medico))}</span>${diffValue(docDiff(d))}</li>`).join("");
    const more = list.length > 5 ? `<li><span class="more">e mais ${plural(list.length - 5, "médico", "médicos")} na tabela abaixo</span></li>` : "";
    return `<ul class="mini">${items}${more}</ul>`;
  };

  // Barras por médico
  const BAR_LIMIT = 12;
  const maxRaw = Math.max(1, ...divs.map((d) => Number(d.diferencaRaw) || 0));
  const bars = divs.slice(0, BAR_LIMIT).map((d) => {
    const n = docDiff(d); const w = Math.max(2, Math.round(((Number(d.diferencaRaw) || 0) / maxRaw) * 100));
    return `<div class="bar"><span class="bar__n" title="${esc(d.medico)}">${esc(titleCase(d.medico))}</span><span class="bar__t"><i class="${n > 0 ? "rep" : "prod"}" style="width:${w}%"></i></span>${diffValue(n)}</div>`;
  }).join("");

  // Tabela de prioridades
  const rows = divs.map((d, i) => {
    const n = docDiff(d); const p = prioridade(Number(d.diferencaRaw) || 0); const np = (d.detalhes || []).length;
    const acao = d.sentido === "rep_maior" ? "Revisar lançamentos no repasse" : "Verificar ausências no repasse";
    return `<tr>
<td class="first"><div class="who"><span class="av">${esc(initials(d.medico))}</span><div style="min-width:0"><b title="${esc(d.medico)}">${i + 1}. ${esc(titleCase(d.medico))}</b><small>${np ? plural(np, "paciente divergente", "pacientes divergentes") : "Sem detalhe por paciente"}</small></div></div></td>
<td class="r num" data-l="Produção">${esc(d.producao)}</td>
<td class="r num" data-l="Repasse">${esc(d.repasse)}</td>
<td class="r" data-l="Diferença">${diffValue(n)}</td>
<td data-l="Direção">${dirTag(n)}</td>
<td data-l="Prioridade">${badge(p.tone, p.label)}</td>
<td class="muted" data-l="Ação sugerida">${acao}</td></tr>`;
  }).join("");

  // Detalhe por médico
  const detail = divs.map((d) => {
    const n = docDiff(d); const det = d.detalhes || [];
    const pr = det.map((p) => {
      const pn = patDiff(p);
      return `<tr><td class="first" data-l="Paciente"><span title="${esc(p.paciente)}">${esc(titleCase(p.paciente))}</span></td><td class="r num" data-l="Produção">${esc(p.producao)}</td><td class="r num" data-l="Repasse">${esc(p.repasse)}</td><td class="r" data-l="Diferença">${diffValue(pn)}</td><td data-l="Tipo">${badge("neutral", p.tipo || "—")}</td></tr>`;
    }).join("");
    return `<details class="acc"><summary><span class="av">${esc(initials(d.medico))}</span><span class="grow"><b style="font-weight:500;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(d.medico)}">${esc(titleCase(d.medico))}</b><small style="color:var(--ink-3);font-size:12px">${det.length ? plural(det.length, "paciente divergente", "pacientes divergentes") : "Sem detalhe por paciente"}</small></span>${diffValue(n)}<span class="chev">${icon("chevron", 18)}</span></summary>
<div class="acc__b"><div class="tiles"><div class="tile"><div class="k">Produção</div><div class="v num">${esc(d.producao)}</div></div><div class="tile"><div class="k">Repasse</div><div class="v num">${esc(d.repasse)}</div></div><div class="tile"><div class="k">Diferença</div><div class="v">${diffValue(n)}</div></div></div>
${det.length ? `<table class="tbl"><thead><tr><th>Paciente</th><th class="r">Produção</th><th class="r">Repasse</th><th class="r">Diferença</th><th>Tipo</th></tr></thead><tbody>${pr}</tbody></table>` : '<div class="empty">A comparação por paciente não foi feita nesta auditoria.</div>'}</div></details>`;
  }).join("");

  // Tipos
  const analises = Array.isArray(ai.analisesPorTipo) ? ai.analisesPorTipo : [];
  const typeCards = tipos.map(([t, n]) => {
    const fd = analises.find((a) => a?.tipo === t) || {};
    const w = totalTipos ? Math.round((n / totalTipos) * 100) : 0;
    return `<div class="type"><div class="type__h"><span class="type__n">${esc(t)}</span><span class="num muted">${plural(n, "ocorrência", "ocorrências")} · ${w}%</span></div><div class="type__bar"><i style="width:${Math.max(2, w)}%"></i></div>${fd.interpretacao ? `<p><b>O que significa:</b> ${esc(fd.interpretacao)}</p>` : ""}${fd.prevencao ? `<p style="margin-top:4px"><b>Como prevenir:</b> ${esc(fd.prevencao)}</p>` : ""}</div>`;
  }).join("");

  // Plano de ação
  const plano = (Array.isArray(ai.planoDeAcao) ? ai.planoDeAcao : []).map((it, i) => {
    const u = URGENCIA[String(it?.urgencia || "").toLowerCase()] || { label: capitalize(it?.urgencia || "—"), tone: "neutral" };
    return `<div class="step"><span class="step__n">${i + 1}</span><div><div class="step__t">${esc(it?.acao)}</div><div class="step__m">${it?.prazo ? `<span>${icon("clock", 14)}${esc(it.prazo)}</span>` : ""}${it?.responsavel ? `<span>${icon("user", 14)}${esc(it.responsavel)}</span>` : ""}${it?.impacto ? `<span>${icon("trend", 14)}${esc(it.impacto)}</span>` : ""}</div></div>${badge(u.tone, `Urgência ${u.label.toLowerCase()}`)}</div>`;
  }).join("");

  const list = (arr, cls, ic) => (Array.isArray(arr) && arr.length
    ? arr.map((s) => `<div class="li ${cls}">${icon(ic, 16)}<span>${esc(s)}</span></div>`).join("")
    : '<div class="empty">A IA não retornou itens para esta seção.</div>');

  const card = (span, title, desc, body, ic, right = "") => `<section class="card ${span}"><div class="card__h"><div><h2 class="card__t">${ic ? icon(ic, 18) : ""}${title}</h2>${desc ? `<p class="card__d">${desc}</p>` : ""}</div>${right}</div>${body}</section>`;

  const semDiv = divs.length === 0;

  return `<!DOCTYPE html>
<html lang="pt-BR" data-theme="${theme}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Relatório IA — ${esc(ref)} · ConSaúde</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
${opts.logoDataUrl ? `<link rel="icon" href="${esc(opts.logoDataUrl)}">` : ""}
<style>${CSS}</style>
</head>
<body>
<header class="top"><div class="wrap">${brand()}
<div class="actions">
<button class="btn btn--icon" id="tt" type="button" data-act="theme" aria-label="Alternar tema" data-sun="${esc(icon("sun", 18))}" data-moon="${esc(icon("moon", 18))}">${icon(theme === "dark" ? "sun" : "moon", 18)}</button>
<button class="btn" type="button" data-act="print">${icon("printer", 16)}<span class="lbl">Imprimir ou salvar PDF</span></button>
</div></div></header>

<main class="wrap">
<div class="head">
<span class="over">${icon("sparkles", 14)}Relatório IA · Auditoria</span>
<h1>${esc(ref)}</h1>
<div class="meta"><span>${icon("clock", 14)}Processada em ${esc(proc.date)}${proc.time ? ` às ${esc(proc.time)}` : ""}</span>${res?.file1Name || res?.file2Name ? `<span>${icon("file", 14)}${esc(res.file1Name || "—")} × ${esc(res.file2Name || "—")}</span>` : ""}${opts.responsavel ? `<span>${icon("user", 14)}Responsável: ${esc(opts.responsavel)}</span>` : ""}</div>
</div>

<div class="grid">
<section class="hero s7" aria-label="Resumo financeiro">
<div class="hero__row"><div><div class="hero__l">Valor divergente total</div><div class="hero__v num">${esc(res?.valorTotal || money(totalRaw))}</div><div class="hero__s">em ${count(comDiv)} de ${count(totalMed)} médicos analisados · ${plural(Number(res?.totalDivergencias) || 0, "divergência", "divergências")}</div></div><span class="pill">${icon("shield", 14)}Risco ${risk.label.toLowerCase()}</span></div>
<div class="hero__split"><div class="hero__tile"><div class="k">${icon("up", 14)}Repasse maior</div><div class="v num">${money(vS)}</div></div><div class="hero__tile"><div class="k">${icon("down", 14)}Produção maior</div><div class="v num">${money(vU)}</div></div></div>
</section>
<section class="ai s5" aria-label="Resumo da IA">
<div class="ai__h">${icon("sparkles", 16)}Resumo executivo da IA</div>
<p>${esc(ai.resumoExecutivo || (semDiv ? "Nenhuma divergência encontrada entre Produção e Repasse nesta auditoria." : "Auditoria de produção médica concluída."))}</p>
${ai.interpretacaoRisco ? `<div class="risk-line">${esc(ai.interpretacaoRisco)}</div>` : ""}
</section>
</div>

<div class="grid">
${card("s12", "Visão geral", "", `<div class="kpis">
<div class="kpi"><div class="k">Médicos analisados</div><div class="v num">${count(totalMed)}</div><div class="s">no cruzamento Produção × Repasse</div></div>
<div class="kpi"><div class="k">Médicos com divergência</div><div class="v num">${count(comDiv)}</div><div class="s">${pct}% dos médicos analisados</div></div>
<div class="kpi"><div class="k">Total de divergências</div><div class="v num">${count(res?.totalDivergencias)}</div><div class="s">itens a revisar</div></div>
<div class="kpi"><div class="k">Tipos de divergência</div><div class="v num">${count(tipos.length)}</div><div class="s">${tipos[0] ? `mais comum: ${esc(tipos[0][0])}` : "sem detalhe por paciente"}</div></div>
</div>`)}
</div>

<div class="grid">
${card("s7", "Direção das divergências", "Diferença = Repasse − Produção, por médico. Repasse maior = pago a mais; Produção maior = pago a menos.", `
<div class="dirbar" role="img" aria-label="Repasse maior ${shareS}%, Produção maior ${totalRaw ? 100 - shareS : 0}%">${totalRaw ? `<i class="rep" style="width:${shareS}%"></i><i class="prod" style="width:${100 - shareS}%"></i>` : ""}</div>
<div class="dircols">
<div class="dircol"><div class="dircol__h">${dirTag(1)}<span class="num muted">${shareS}%</span></div><div class="dircol__v num">${money(vS)}</div><div class="dircol__s">${plural(sobre.length, "médico", "médicos")} · pago a mais</div>${miniList(sobre)}</div>
<div class="dircol"><div class="dircol__h">${dirTag(-1)}<span class="num muted">${totalRaw ? 100 - shareS : 0}%</span></div><div class="dircol__v num">${money(vU)}</div><div class="dircol__s">${plural(sub.length, "médico", "médicos")} · pago a menos</div>${miniList(sub)}</div>
</div>`, "")}
${card("s5", "Nível de risco", "Percentual de médicos com divergência nesta auditoria.", `
<div class="riskv"><span class="v num">${pct}%</span>${badge(risk.tone, `Risco ${risk.label.toLowerCase()}`, risk.tone === "success" ? "check" : "alert")}</div>
<div class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-valuetext="${pct}% — risco ${risk.label.toLowerCase()}">${RISK.map((r, i) => `<i class="${i <= riskIdx ? `on ${risk.tone}` : ""}"></i>`).join("")}</div>
<div class="meter-l">${RISK.map((r, i) => `<span class="${i === riskIdx ? "cur" : ""}"><b>${r.label}</b>${r.range}</span>`).join("")}</div>
${ai.interpretacaoRisco ? `<p class="card__d" style="margin-top:16px">${esc(ai.interpretacaoRisco)}</p>` : ""}`, "")}
</div>

${semDiv ? "" : `<div class="grid">
${card("s12", "Maiores diferenças por médico", divs.length > BAR_LIMIT ? `Os ${BAR_LIMIT} maiores valores. Todos os ${count(divs.length)} médicos estão na tabela abaixo.` : "Valor da diferença de cada médico com divergência.", `<div class="bars">${bars}</div>`, "", `<div class="legend"><span><i style="background:var(--dir-rep)"></i>Repasse maior</span><span><i style="background:var(--accent)"></i>Produção maior</span></div>`)}
</div>

<div class="grid">
${card("s12", "Prioridades", `${plural(divs.length, "médico com divergência", "médicos com divergência")}, do maior para o menor valor. Prioridade: alta acima de R$ 500, média de R$ 100 a R$ 500, baixa abaixo de R$ 100.`, `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Médico</th><th class="r">Produção</th><th class="r">Repasse</th><th class="r">Diferença</th><th>Direção</th><th>Prioridade</th><th>Ação sugerida</th></tr></thead><tbody>${rows}</tbody></table></div>`)}
</div>

<div class="grid">
${card("s12", "Detalhamento por médico", "Abra um médico para ver cada paciente divergente.", detail, "", `<button class="btn" type="button" data-act="expand">${icon("expand", 16)}<span class="lbl">Expandir todos</span></button>`)}
</div>`}

<div class="grid">
${tipos.length ? card("s6", "Tipos de divergência", "Quantas vezes cada tipo aparece e o que a IA sugere para evitar.", typeCards, "") : ""}
${card(tipos.length ? "s6" : "s12", `Plano de ação <span class="badge badge--ia" style="margin-left:4px">${icon("sparkles", 14)}IA</span>`, "Ações sugeridas pela IA, em ordem de urgência.", plano || '<div class="empty">A IA não retornou ações para esta auditoria.</div>', "list")}
</div>

<div class="grid">
${card("s4", "Insights", "", list(ai.insights, "li--ia", "sparkles"), "")}
${card("s4", "Pontos de atenção", "", list(ai.anomalias, "li--warn", "alert"), "")}
${card("s4", "Recomendações", "", list(ai.recomendacoes, "li--ok", "check"), "")}
${ai.conclusao ? `<section class="card s12"><div class="ai__h">${icon("sparkles", 16)}Conclusão da IA</div><p style="margin-top:8px;font-size:15px;line-height:24px">${esc(ai.conclusao)}</p><div class="disclaimer" style="margin-top:12px">${icon("alert", 14)}Análise gerada por IA a partir dos números desta auditoria. Confira os valores antes de agir.</div></section>` : ""}
</div>

<footer class="foot">${brand(false)}<span>Gerado em ${esc(gerado)}${opts.responsavel ? ` · Responsável: ${esc(opts.responsavel)}` : ""}</span><span>Uso interno e confidencial</span></footer>
</main>
<script>${SCRIPT}<\/script>
</body>
</html>`;
}

/** Logo (public/logo-mark.png) reduzida para 96px e embutida como data URL. Falha → null (usa o marcador). */
async function loadLogoDataUrl() {
  try {
    const base = (import.meta.env && import.meta.env.BASE_URL) || "/";
    const resp = await fetch(`${base}logo-mark.png`);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    try {
      const bmp = await createImageBitmap(blob);
      const size = 96;
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const scale = Math.min(size / bmp.width, size / bmp.height);
      const w = bmp.width * scale, h = bmp.height * scale;
      c.getContext("2d").drawImage(bmp, (size - w) / 2, (size - h) / 2, w, h);
      return c.toDataURL("image/png");
    } catch {
      return await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(typeof r.result === "string" ? r.result : null);
        r.onerror = () => resolve(null);
        r.readAsDataURL(blob);
      });
    }
  } catch {
    return null;
  }
}

export async function generateAIReport(resultados, opts = {}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("cole_sua")) {
    throw new Error("Configure VITE_OPENAI_API_KEY no arquivo .env com sua chave da OpenAI.");
  }
  const [ai, logoDataUrl] = await Promise.all([fetchAIAnalysis(resultados, apiKey), loadLogoDataUrl()]);
  const theme = opts.theme || (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) || "dark";
  return buildReportHTML(resultados, ai, { ...opts, logoDataUrl, theme });
}
