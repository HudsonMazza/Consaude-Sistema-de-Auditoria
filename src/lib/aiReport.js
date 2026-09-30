// Movido de auditoria-medica.jsx sem alteração de comportamento.
// O prompt e o HTML do relatório IA (cores e layout próprios do arquivo exportado) não devem mudar com o redesign.
import { brl } from "./engine.js";

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

export function buildReportHTML(res, ai) {
  const pct   = Math.round((res.medicosComDivergencia/res.totalMedicos)*100);
  const rLbl  = pct<10?"BAIXO":pct<25?"MÉDIO":pct<50?"ALTO":"CRÍTICO";
  const rHex  = pct<10?"#10b981":pct<25?"#f59e0b":pct<50?"#f97316":"#ef4444";
  const rRgb  = pct<10?"16,185,129":pct<25?"245,158,11":pct<50?"249,115,22":"239,68,68";
  const sobre = res.divergencias.filter(d=>d.sentido==="rep_maior");
  const sub   = res.divergencias.filter(d=>d.sentido==="prod_maior");
  const vS    = sobre.reduce((s,d)=>s+d.diferencaRaw,0);
  const vU    = sub.reduce((s,d)=>s+d.diferencaRaw,0);
  const gA    = (180-pct*1.8)*Math.PI/180;
  const nx    = +(100+72*Math.cos(gA)).toFixed(1);
  const ny    = +(100-72*Math.sin(gA)).toFixed(1);
  const tf    = {}; res.divergencias.flatMap(d=>d.detalhes.map(p=>p.tipo)).forEach(t=>{tf[t]=(tf[t]||0)+1;});
  const esc   = s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const prio  = raw=>raw>500?{l:"ALTA",h:"#ef4444",r:"239,68,68"}:raw>100?{l:"MÉDIA",h:"#f59e0b",r:"245,158,11"}:{l:"BAIXA",h:"#64748b",r:"100,116,139"};
  const PC    = ["#ef4444","#f59e0b","#F47920","#10b981","#2B4AA0","#f97316","#64748b","#ec4899"];
  const pK    = Object.keys(tf);
  const pColS = PC.slice(0,pK.length);
  const chartH= Math.max(280,res.divergencias.length*30);
  const bN    = JSON.stringify(res.divergencias.map(d=>d.medico.length>38?d.medico.slice(0,36)+"…":d.medico));
  const bV    = JSON.stringify(res.divergencias.map(d=>+d.diferencaRaw.toFixed(2)));
  const bBg   = JSON.stringify(res.divergencias.map(d=>d.sentido==="rep_maior"?"rgba(239,68,68,.75)":"rgba(245,158,11,.75)"));
  const bBd   = JSON.stringify(res.divergencias.map(d=>d.sentido==="rep_maior"?"#ef4444":"#f59e0b"));

  const css = `*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#050d1a;--bg2:#0a1628;--card:#0c1c36;--border:rgba(244,121,32,.2);--b2:rgba(255,255,255,.06);--in:#F47920;--vi:#2B4AA0;--gr:#10b981;--re:#ef4444;--am:#f59e0b;--mu:#64748b;--tx:#f1f5f9;--t2:#94a3b8}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);background-image:radial-gradient(ellipse 60% 40% at 15% -5%,rgba(244,121,32,.12),transparent 60%),radial-gradient(ellipse 50% 30% at 85% 0%,rgba(139,92,246,.08),transparent 55%);color:var(--tx);line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:1240px;margin:0 auto;padding:0 28px 64px}
/* HERO */
.hero{background:linear-gradient(160deg,#0f2040 0%,#080d20 70%,var(--bg) 100%);border-bottom:1px solid var(--border);padding:48px 0 44px;margin-bottom:32px}
.hlogo{display:flex;align-items:center;gap:18px;margin-bottom:30px}
.hli{width:72px;height:72px;border-radius:16px;background:transparent;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;overflow:hidden}
.hlt{font-size:28px;font-weight:800;letter-spacing:-.02em}
.hls{font-size:14px;color:var(--mu);margin-top:2px}
.hw{display:flex;align-items:flex-start;justify-content:space-between;gap:32px;flex-wrap:wrap}
.ht{font-size:40px;font-weight:900;letter-spacing:-.045em;background:linear-gradient(135deg,#f1f5f9 30%,#8b9ab5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;line-height:1.1}
.hp{font-size:17px;color:#818cf8;font-weight:700;margin-bottom:18px;letter-spacing:.01em}
.hs{font-size:14.5px;color:var(--t2);max-width:620px;line-height:1.8;margin-bottom:22px}
.hm{display:flex;gap:20px;font-size:12px;color:var(--mu);flex-wrap:wrap}
.rb{padding:11px 24px;border-radius:50px;font-size:13px;font-weight:900;letter-spacing:.1em;white-space:nowrap;flex-shrink:0;margin-top:10px;box-shadow:0 4px 20px rgba(0,0,0,.4)}
/* SECTION */
.s{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:30px;margin-bottom:24px;box-shadow:0 4px 32px rgba(0,0,0,.35)}
.st{font-size:16px;font-weight:700;letter-spacing:-.01em;margin-bottom:5px}
.ss{font-size:12.5px;color:var(--mu);margin-bottom:24px}
/* METRICS */
.mg{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.mc{background:rgba(255,255,255,.03);border:1px solid var(--b2);border-radius:16px;padding:22px;position:relative;overflow:hidden;transition:transform .2s}
.mc:hover{transform:translateY(-3px)}
.mc::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.03),transparent);pointer-events:none}
.mi{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px}
.mv{font-weight:900;letter-spacing:-.04em;font-family:monospace;margin-bottom:5px}
.ml{font-size:12px;color:var(--mu);font-weight:500}
.mb{height:3px;border-radius:2px;background:rgba(255,255,255,.06);margin-top:18px;overflow:hidden}
.mf{height:100%;border-radius:2px;transition:width 1s ease}
/* DIRECTION */
.dg{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.dc2{border-radius:16px;padding:22px}
.dc2t{font-size:13px;font-weight:800;margin-bottom:6px}
.dc2c{font-size:30px;font-weight:900;font-family:monospace;margin-bottom:5px}
.dc2s{font-size:12px;margin-bottom:16px;opacity:.75}
.di{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12.5px;gap:8px}
.di:last-child{border-bottom:none}
.din{color:var(--t2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.div{font-family:monospace;font-weight:800;font-size:12px;white-space:nowrap}
/* GAUGE */
.gw{display:flex;align-items:center;gap:44px;flex-wrap:wrap}
.gs{width:240px;flex-shrink:0}
.gt{flex:1;min-width:220px}
.gp{font-size:54px;font-weight:900;font-family:monospace;letter-spacing:-.04em;line-height:1}
.gl{font-size:13px;font-weight:800;letter-spacing:.12em;margin:6px 0 14px}
.gi{font-size:13.5px;color:var(--t2);line-height:1.75}
.gle{display:flex;gap:14px;margin-top:18px;flex-wrap:wrap}
.gli{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--mu)}
.gld{width:8px;height:8px;border-radius:50%}
/* TABLE */
.tw{overflow-x:auto;margin:0 -2px}
table.mt{width:100%;border-collapse:collapse;min-width:920px}
.mt th{padding:11px 15px;text-align:left;font-size:10.5px;font-weight:700;color:var(--mu);letter-spacing:.07em;text-transform:uppercase;background:rgba(0,0,0,.4);border-bottom:1px solid var(--border)}
.mt td{padding:13px 15px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.tr:hover td{background:rgba(255,255,255,.025)}
.tn{color:var(--mu);font-size:12px;text-align:center;width:36px}
.tm{font-family:monospace;font-size:13px}
.tc{text-align:center;width:60px}
.ta{font-size:12px;color:var(--t2);max-width:185px;line-height:1.4}
.mn{font-weight:700;font-size:13.5px}
.ms{font-size:11px;color:var(--mu);margin-top:2px}
.db{display:inline-flex;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
.dbr{background:rgba(239,68,68,.13);color:#ef4444}
.dbp{background:rgba(245,158,11,.13);color:#f59e0b}
.pb{display:inline-flex;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
/* ACCORDION */
.dc{background:rgba(255,255,255,.025);border:1px solid var(--b2);border-radius:16px;margin-bottom:10px;overflow:hidden;transition:border-color .2s}
.dc:hover{border-color:rgba(244,121,32,.25)}
.ds{list-style:none;cursor:pointer;display:flex;align-items:center;gap:16px;padding:18px 22px;user-select:none;transition:background .15s}
.ds:hover{background:rgba(255,255,255,.03)}
.ds::-webkit-details-marker{display:none}
.dl{display:flex;align-items:center;gap:14px;flex:1;overflow:hidden}
.da{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;flex-shrink:0;letter-spacing:-.02em}
.dn2{font-weight:800;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsb{font-size:11px;color:var(--mu);margin-top:2px}
.dr2{text-align:right;flex-shrink:0}
.dd2{font-family:monospace;font-weight:900;font-size:16px}
.ddi{font-size:11px;margin-top:2px;opacity:.7}
.dch{color:var(--mu);font-size:15px;flex-shrink:0;transition:transform .25s}
details[open] .dch{transform:rotate(180deg)}
.db2{padding:0 22px 22px}
.dmet{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.dm{border:1px solid;border-radius:13px;padding:16px;background:rgba(0,0,0,.22)}
.dml{font-size:11px;color:var(--mu);margin-bottom:7px}
.dmv{font-family:monospace;font-weight:900;font-size:15px}
.pt{width:100%;border-collapse:collapse}
.pt th{padding:9px 13px;text-align:left;background:rgba(0,0,0,.32);color:var(--mu);font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.ptr td{padding:9px 13px;border-bottom:1px solid rgba(255,255,255,.04);font-size:12.5px}
.ptr:last-child td{border-bottom:none}
.ptr:hover td{background:rgba(255,255,255,.02)}
.tpn{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.tms{font-family:monospace;font-size:12px}
.tb{display:inline-flex;padding:2px 9px;border-radius:10px;background:rgba(244,121,32,.1);color:#2B4AA0;font-size:11px}
.nd{text-align:center;padding:22px;color:var(--mu);font-size:13px}
/* PATTERNS */
.pl{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
.pie-c{height:280px}
.pkc{background:rgba(255,255,255,.025);border:1px solid var(--b2);border-radius:14px;padding:18px;margin-bottom:10px}
.pkh{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.pkn{padding:2px 10px;border-radius:10px;font-size:12px;font-weight:900;flex-shrink:0}
.pkt{font-size:13.5px;font-weight:800}
.pktx{font-size:12.5px;color:var(--t2);line-height:1.65;margin-top:6px}
/* ACTION */
.ai2{display:flex;align-items:flex-start;gap:14px;padding:18px;background:rgba(255,255,255,.025);border:1px solid var(--b2);border-radius:16px;margin-bottom:10px;transition:border-color .2s}
.ai2:hover{border-color:rgba(244,121,32,.25)}
.an{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;color:white;flex-shrink:0;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.ab{flex:1;min-width:0}
.at2{font-weight:700;font-size:14px;margin-bottom:8px;line-height:1.5}
.am{font-size:12px;color:var(--mu);line-height:1.9;display:flex;flex-wrap:wrap;gap:4px 16px}
.ub{padding:5px 14px;border-radius:20px;font-size:11px;font-weight:900;letter-spacing:.06em;align-self:flex-start;flex-shrink:0;white-space:nowrap}
/* INSIGHTS */
.ig{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.ict{font-size:12px;font-weight:700;color:var(--mu);letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:6px}
.ii{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:var(--t2);line-height:1.65}
.ii:last-child{border-bottom:none}
.id2{width:7px;height:7px;border-radius:50%;background:#F47920;margin-top:8px;flex-shrink:0}
.al{display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:var(--t2);line-height:1.65}
.al:last-child{border-bottom:none}
.ai3{color:#ef4444;font-size:15px;flex-shrink:0;margin-top:1px}
.rl{display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:var(--t2);line-height:1.65}
.rl:last-child{border-bottom:none}
.ri{color:#10b981;font-size:15px;flex-shrink:0;margin-top:1px}
.conc{background:linear-gradient(135deg,rgba(244,121,32,.1),rgba(139,92,246,.06));border:1px solid rgba(244,121,32,.25);border-radius:14px;padding:22px;font-size:14px;color:var(--t2);line-height:1.8;margin-top:22px}
.es{color:var(--mu);text-align:center;padding:22px;font-size:13px}
/* FOOTER */
.ftr{border-top:1px solid var(--border);padding:26px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--mu);margin-top:8px}
.fl{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--t2);font-size:14px}
/* PRINT */
@media print{body{background:#fff;color:#0f172a}.hero{background:#eef2ff!important}.s,.dc,.ai2,.pkc{background:#fff!important;border-color:#e2e8f0!important}.st,.ht,.mn,.dmv,.dd2{color:#0f172a!important}}
@media(max-width:768px){.mg{grid-template-columns:1fr 1fr}.dg,.pl,.ig{grid-template-columns:1fr}.ht{font-size:28px}}`;

  // Fragments
  const mCards = [
    {ic:"👨‍⚕️",val:String(res.totalMedicos),lb:"Médicos analisados",cl:"#F47920",bar:100},
    {ic:"⚠️",val:String(res.medicosComDivergencia),lb:"Com divergência ("+pct+"%)",cl:"#f59e0b",bar:pct},
    {ic:"🔍",val:String(res.totalDivergencias),lb:"Total de divergências",cl:"#ef4444",bar:Math.min(100,Math.round(res.totalDivergencias/(res.totalMedicos*3)*100))},
    {ic:"💰",val:esc(res.valorTotal),lb:"Valor divergente total",cl:"#10b981",bar:100},
  ].map(m=>`<div class="mc"><div class="mi" style="background:${m.cl}22;color:${m.cl}">${m.ic}</div><div class="mv" style="color:${m.cl};font-size:${m.val.length>12?"18px":"26px"}">${m.val}</div><div class="ml">${m.lb}</div><div class="mb"><div class="mf" style="width:${m.bar}%;background:${m.cl}"></div></div></div>`).join("");

  const sL = sobre.map(d=>`<div class="di"><span class="din">${esc(d.medico.length>44?d.medico.slice(0,42)+"…":d.medico)}</span><span class="div" style="color:#ef4444">↑Rep ${esc(d.diferenca)}</span></div>`).join()||'<div class="di" style="color:var(--mu)">Nenhum caso</div>';
  const uL = sub.map(d=>`<div class="di"><span class="din">${esc(d.medico.length>44?d.medico.slice(0,42)+"…":d.medico)}</span><span class="div" style="color:#f59e0b">↑Prod ${esc(d.diferenca)}</span></div>`).join()||'<div class="di" style="color:var(--mu)">Nenhum caso</div>';

  const tR = res.divergencias.map((d,i)=>{
    const ir=d.sentido==="rep_maior"; const p=prio(d.diferencaRaw);
    return `<tr class="tr"><td class="tn">${i+1}</td><td><div class="mn">${esc(d.medico)}</div>${d.detalhes.length?`<div class="ms">${d.detalhes.length} pac. divergente${d.detalhes.length!==1?"s":""}</div>`:""}</td><td class="tm">${esc(d.producao)}</td><td class="tm">${esc(d.repasse)}</td><td class="tm" style="font-weight:700;color:${ir?"#ef4444":"#f59e0b"}">${ir?"↑Rep":"↑Prod"} ${esc(d.diferenca)}</td><td><span class="db ${ir?"dbr":"dbp"}">${ir?"Rep > Prod":"Prod > Rep"}</span></td><td class="tc">${d.detalhes.length||"—"}</td><td><span class="pb" style="background:rgba(${p.r},.13);color:${p.h}">${p.l}</span></td><td class="ta">${ir?"Revisar lançamentos no repasse":"Verificar ausências no repasse"}</td></tr>`;
  }).join("");

  const dCards = res.divergencias.map(d=>{
    const ir=d.sentido==="rep_maior"; const dH=ir?"#ef4444":"#f59e0b"; const dR=ir?"239,68,68":"245,158,11";
    const pR=d.detalhes.map(p=>`<tr class="ptr"><td class="tpn">${esc(p.paciente)}</td><td class="tms">${esc(p.producao)}</td><td class="tms">${esc(p.repasse)}</td><td class="tms" style="color:${dH};font-weight:700">${esc(p.diferenca)}</td><td><span class="tb">${esc(p.tipo)}</span></td></tr>`).join("");
    return `<details class="dc"><summary class="ds"><div class="dl"><div class="da" style="background:rgba(${dR},.18);color:${dH}">${esc(d.medico.charAt(0))}</div><div><div class="dn2">${esc(d.medico)}</div><div class="dsb">${d.detalhes.length} paciente${d.detalhes.length!==1?"s":""} divergente${d.detalhes.length!==1?"s":""}</div></div></div><div class="dr2"><div class="dd2" style="color:${dH}">${ir?"↑Rep":"↑Prod"} ${esc(d.diferenca)}</div><div class="ddi" style="color:${dH}">${ir?"repasse maior":"produção maior"}</div></div><span class="dch">▾</span></summary><div class="db2"><div class="dmet"><div class="dm" style="border-color:rgba(244,121,32,.3)"><div class="dml">Produção</div><div class="dmv" style="color:#F47920">${esc(d.producao)}</div></div><div class="dm" style="border-color:rgba(16,185,129,.3)"><div class="dml">Repasse</div><div class="dmv" style="color:#10b981">${esc(d.repasse)}</div></div><div class="dm" style="border-color:rgba(${dR},.3)"><div class="dml">Diferença</div><div class="dmv" style="color:${dH}">${esc(d.diferenca)}</div></div></div>${d.detalhes.length?`<div style="overflow-x:auto"><table class="pt"><thead><tr><th>Paciente</th><th>Produção</th><th>Repasse</th><th>Diferença</th><th>Tipo</th></tr></thead><tbody>${pR}</tbody></table></div>`:'<div class="nd">Comparação por paciente não disponível.</div>'}</div></details>`;
  }).join("");

  const aItems = (ai.planoDeAcao||[]).map((it,i)=>{
    const u=it.urgencia==="alta"?{h:"#ef4444",r:"239,68,68"}:it.urgencia==="media"?{h:"#f59e0b",r:"245,158,11"}:{h:"#64748b",r:"100,116,139"};
    return `<div class="ai2"><div class="an" style="background:${u.h}">${i+1}</div><div class="ab"><div class="at2">${esc(it.acao)}</div><div class="am"><span>⏱ ${esc(it.prazo)}</span><span>👤 ${esc(it.responsavel)}</span><span>📈 ${esc(it.impacto)}</span></div></div><span class="ub" style="background:rgba(${u.r},.13);color:${u.h}">${(it.urgencia||"").toUpperCase()}</span></div>`;
  }).join()||'<div class="es">Não disponível.</div>';

  const patCards = pK.map((t,i)=>{
    const fd=(ai.analisesPorTipo||[]).find(a=>a.tipo===t)||{}; const c=PC[i%PC.length];
    return `<div class="pkc"><div class="pkh"><span class="pkn" style="background:${c}22;color:${c}">${tf[t]}×</span><strong class="pkt">${esc(t)}</strong></div>${fd.interpretacao?`<p class="pktx"><strong>Significado:</strong> ${esc(fd.interpretacao)}</p>`:""}${fd.prevencao?`<p class="pktx"><strong>Prevenção:</strong> ${esc(fd.prevencao)}</p>`:""}</div>`;
  }).join("");

  const iList = (ai.insights||[]).map(s=>`<div class="ii"><div class="id2"></div>${esc(s)}</div>`).join()||'<div class="es">Não disponível.</div>';
  const aList = (ai.anomalias||[]).map(s=>`<div class="al"><span class="ai3">⚠</span>${esc(s)}</div>`).join()||'<div class="es">Não disponível.</div>';
  const rList = (ai.recomendacoes||[]).map(s=>`<div class="rl"><span class="ri">✓</span>${esc(s)}</div>`).join()||'<div class="es">Não disponível.</div>';

  const pieD = JSON.stringify(Object.values(tf));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Auditoria Médica — ${esc(res.referencia)}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"><\/script>
<style>${css}</style>
</head>
<body>
<div class="hero"><div class="page">
<div class="hlogo"><div class="hli"><img src="https://postimg.cc/ygp5Y8dY" alt="ConSaúde" style="width:100%;height:100%;object-fit:contain"></div><div><div class="hlt">ConSaude</div><div class="hls">Sistema de Auditoria Médica</div></div></div>
<div class="hw">
<div>
  <div class="hp">Referência: ${esc(res.referencia)}</div>
  <h1 class="ht">Relatório de Auditoria</h1>
  <p class="hs">${esc(ai.resumoExecutivo||"Auditoria de produção médica concluída com sucesso.")}</p>
  <div class="hm"><span>📅 ${esc(res.processadoEm)}</span><span>📁 ${esc(res.file1Name)} × ${esc(res.file2Name)}</span></div>
</div>
<div class="rb" style="background:rgba(${rRgb},.15);color:${rHex};border:1.5px solid rgba(${rRgb},.35)">RISCO ${rLbl}</div>
</div>
</div></div>

<div class="page">

<div class="s"><div class="st">Dashboard Executivo</div><div class="ss">Visão geral — ${esc(res.referencia)}</div><div class="mg">${mCards}</div></div>

<div class="s"><div class="st">Análise Direcional</div><div class="ss">Distribuição do risco por tipo de desvio financeiro</div>
<div class="dg">
<div class="dc2" style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.25)">
  <div class="dc2t" style="color:#ef4444">🔴 Repasse &gt; Produção</div>
  <div class="dc2c" style="color:#ef4444">${brl(vS)}</div>
  <div class="dc2s" style="color:rgba(239,68,68,.8)">${sobre.length} médico${sobre.length!==1?"s":""} — risco de sobrepagamento</div>
  ${sL}
</div>
<div class="dc2" style="background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.25)">
  <div class="dc2t" style="color:#f59e0b">🟡 Produção &gt; Repasse</div>
  <div class="dc2c" style="color:#f59e0b">${brl(vU)}</div>
  <div class="dc2s" style="color:rgba(245,158,11,.8)">${sub.length} médico${sub.length!==1?"s":""} — risco de subpagamento</div>
  ${uL}
</div>
</div></div>

<div class="s"><div class="st">Medidor de Risco</div><div class="ss">${esc(ai.interpretacaoRisco||"Percentual de médicos com divergências de faturamento.")}</div>
<div class="gw">
<svg class="gs" viewBox="0 0 200 110">
  <path d="M 16 100 A 84 84 0 0 1 184 100" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="14" stroke-linecap="round"/>
  <path d="M 16 100 A 84 84 0 0 1 76 19.3" fill="none" stroke="#10b981" stroke-width="14" stroke-linecap="round" opacity=".9"/>
  <path d="M 76 19.3 A 84 84 0 0 1 124 19.3" fill="none" stroke="#f59e0b" stroke-width="14" opacity=".9"/>
  <path d="M 124 19.3 A 84 84 0 0 1 184 100" fill="none" stroke="${rHex}" stroke-width="14" stroke-linecap="round" opacity=".9"/>
  <line x1="100" y1="100" x2="${nx}" y2="${ny}" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="6" fill="${rHex}" stroke="rgba(0,0,0,.3)" stroke-width="1"/>
  <circle cx="100" cy="100" r="3" fill="white"/>
  <text x="100" y="84" text-anchor="middle" font-size="20" font-weight="900" fill="${rHex}" font-family="monospace">${pct}%</text>
</svg>
<div class="gt">
  <div class="gp" style="color:${rHex}">${pct}%</div>
  <div class="gl" style="color:${rHex}">RISCO ${rLbl}</div>
  <p class="gi">${esc(ai.interpretacaoRisco||"Percentual de médicos com divergências identificadas na auditoria.")}</p>
  <div class="gle">
    <div class="gli"><div class="gld" style="background:#10b981"></div>Baixo (&lt;10%)</div>
    <div class="gli"><div class="gld" style="background:#f59e0b"></div>Médio (10–25%)</div>
    <div class="gli"><div class="gld" style="background:#f97316"></div>Alto (25–50%)</div>
    <div class="gli"><div class="gld" style="background:#ef4444"></div>Crítico (&gt;50%)</div>
  </div>
</div>
</div></div>

<div class="s"><div class="st">Valor Divergente por Médico</div>
<div class="ss" style="display:flex;gap:16px;flex-wrap:wrap"><span style="display:inline-flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:#ef4444;display:inline-block"></span>Repasse &gt; Produção</span><span style="display:inline-flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:#f59e0b;display:inline-block"></span>Produção &gt; Repasse</span></div>
<div style="position:relative;height:${chartH}px"><canvas id="bc"></canvas></div></div>

<div class="s">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:12px">
  <div><div class="st">Tabela de Prioridades</div><div class="ss" style="margin-bottom:0">${res.medicosComDivergencia} médico${res.medicosComDivergencia!==1?"s":""} — ordenado${res.medicosComDivergencia!==1?"s":""} por valor</div></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <span class="pb" style="background:rgba(239,68,68,.13);color:#ef4444">Alta &gt;R$500</span>
    <span class="pb" style="background:rgba(245,158,11,.13);color:#f59e0b">Média R$100–500</span>
    <span class="pb" style="background:rgba(100,116,139,.13);color:#64748b">Baixa &lt;R$100</span>
  </div>
</div>
<div class="tw"><table class="mt">
<thead><tr><th style="text-align:center">#</th><th>Médico</th><th>Produção</th><th>Repasse</th><th>Diferença</th><th>Direção</th><th style="text-align:center">Pac.</th><th>Prioridade</th><th>Ação Recomendada</th></tr></thead>
<tbody>${tR}</tbody>
</table></div></div>

<div class="s"><div class="st">Detalhamento por Médico</div><div class="ss">Clique para expandir — análise por paciente</div>${dCards}</div>

<div class="s"><div class="st">Análise de Padrões</div><div class="ss">Distribuição e interpretação dos tipos de divergência encontrados</div>
<div class="pl">
<div class="pie-c"><canvas id="pc"></canvas></div>
<div>${patCards}</div>
</div></div>

<div class="s"><div class="st">Plano de Ação Imediata</div><div class="ss">Ações concretas ordenadas por urgência</div>${aItems}</div>

<div class="s"><div class="st">Insights &amp; Recomendações</div><div class="ss">Análise gerada por IA com base nos dados desta auditoria</div>
<div class="ig">
<div><div class="ict">💡 Insights</div>${iList}</div>
<div><div class="ict">⚠ Anomalias Detectadas</div>${aList}</div>
</div>
<div style="margin-top:22px"><div class="ict">✅ Recomendações de Processo</div>${rList}</div>
${ai.conclusao?'<div class="conc">📋 <strong>Conclusão:</strong> '+esc(ai.conclusao)+'</div>':""}
</div>

<div class="ftr"><div class="fl">⚕ ConSaude Auditoria Médica</div><div>Gerado em ${esc(res.processadoEm)} · v1.0</div><div style="text-align:right">Uso interno e confidencial</div></div>

</div>
<script>
(function(){
Chart.defaults.color="rgba(148,163,184,.8)";
Chart.defaults.borderColor="rgba(255,255,255,.06)";
Chart.defaults.font.family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
new Chart(document.getElementById("bc").getContext("2d"),{
  type:"bar",
  data:{labels:${bN},datasets:[{data:${bV},backgroundColor:${bBg},borderColor:${bBd},borderWidth:1,borderRadius:5,borderSkipped:false}]},
  options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return" R$ "+c.parsed.x.toLocaleString("pt-BR",{minimumFractionDigits:2});}}}},scales:{x:{beginAtZero:true,grid:{color:"rgba(255,255,255,.05)"},ticks:{callback:function(v){return"R$ "+v.toLocaleString("pt-BR");}}},y:{grid:{display:false},ticks:{font:{size:11}}}}}
});
new Chart(document.getElementById("pc").getContext("2d"),{
  type:"doughnut",
  data:{labels:${JSON.stringify(pK)},datasets:[{data:${pieD},backgroundColor:${JSON.stringify(pColS)},borderColor:"rgba(5,13,26,.85)",borderWidth:3,hoverOffset:10}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{padding:14,boxWidth:12,font:{size:11}}},tooltip:{callbacks:{label:function(c){var t=c.dataset.data.reduce(function(a,b){return a+b;},0);return" "+c.label+": "+c.parsed+" ("+Math.round(c.parsed/t*100)+"%)";}}}}  ,cutout:"65%"}
});
})();
<\/script>
</body>
</html>`;
}

export async function generateAIReport(resultados) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("cole_sua")) {
    throw new Error("Configure VITE_OPENAI_API_KEY no arquivo .env com sua chave da OpenAI.");
  }
  const ai = await fetchAIAnalysis(resultados, apiKey);
  return buildReportHTML(resultados, ai);
}
