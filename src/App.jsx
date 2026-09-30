// App do ConSaúde — estado e handlers movidos de auditoria-medica.jsx sem alterar a lógica de negócio
// (processamento, Firebase, exportações, relatório IA, permissões). A apresentação usa o design system.
//
// Mudanças só de interface em relação ao monolito:
// - tema: data-theme no <html> (src/lib/theme.js), em vez do estado `dark`;
// - sidebar/perfil/drag: controlados pelos componentes do design system (AppShell, AccountMenu, Dropzone);
// - `rows1/rows2`: contagem de linhas lidas, exibida no Dropzone (vem do mesmo parse do preview de colunas);
// - `histStatus/histRetry`: estados de carregando/erro/tentar novamente do histórico;
// - `aiHidden`: "Continuar em segundo plano" no modal de geração do relatório IA;
// - activePage "upload" (definido por startAudit em caso de erro) agora abre Nova auditoria com o erro visível.
//
// Preferências (Configurações, src/lib/preferences.js): a tolerância substitui o R$ 0,01 fixo da opção
// "ignorar diferenças" em novas auditorias (fica registrada em `res.tolerancia`); as opções de comparação
// da Nova auditoria partem dos padrões salvos; as exportações recebem o que incluir e o responsável.
import { useState, useEffect, useRef } from "react";
import { firebaseReady, auth } from "./firebase";
import { observarSessao, logout } from "./auth";
import { observarHistorico, salvarAuditoria, salvarRelatorioIA, excluirAuditoria, migrarHistoricoLocal } from "./audits";
import {
  parseExcel, extractReferencia, detectColumns, validateFile, groupBy, sumVals, brl, comparePatients, generateInsights,
} from "./lib/engine.js";
import { exportExcel, exportPDF } from "./lib/exporters.js";
import { generateAIReport } from "./lib/aiReport.js";
import { openReport } from "./lib/reportViewer.js";
import { getPreferences, getNewAuditDefaults, getTolerance, getExportOptions } from "./lib/preferences.js";
import { AiProgressModal, Modal, Button } from "./components/ds/index.js";
import AppLayout from "./components/AppLayout.jsx";
import { ToastProvider, useToast } from "./components/Toaster.jsx";
import { LoginScreen, ForcePasswordChangeScreen, FirebaseSetupScreen, AuthLoading } from "./pages/auth.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AuditsPage from "./pages/AuditsPage.jsx";
import ProcessingPage from "./pages/ProcessingPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { capitalize, copyText } from "./lib/display.js";

const AI_STEPS = [
  { label: 'Consolidando divergências por médico', state: 'pending' },
  { label: 'Identificando riscos financeiros', state: 'pending' },
  { label: 'Preparando o plano de ação', state: 'pending' },
];

export default function App() {
  const [currentUser,   setCurrentUser]   = useState(null);
  const [authReady,     setAuthReady]     = useState(false);
  const [activePage,    setActivePage]    = useState("dashboard");
  const [auditView,     setAuditView]     = useState("list");
  const [file1,         setFile1]         = useState(null);
  const [file2,         setFile2]         = useState(null);
  const [processing,    setProcessing]    = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [steps,         setSteps]         = useState([false,false,false,false,false,false]);
  const [selectedMedico,setSelectedMedico]= useState(null);
  const [configs,       setConfigs]       = useState(getNewAuditDefaults);
  const [resultados,    setResultados]    = useState(null);
  const [historico,     setHistorico]     = useState([]);
  const [histStatus,    setHistStatus]    = useState("loading");
  const [histRetry,     setHistRetry]     = useState(0);
  const [uploadError,   setUploadError]   = useState(null);
  const [periodoAuditoria, setPeriodoAuditoria] = useState('');
  const [statuses,      setStatuses]      = useState({});
  const [cols1,         setCols1]         = useState(null);
  const [cols2,         setCols2]         = useState(null);
  const [rows1,         setRows1]         = useState(null);
  const [rows2,         setRows2]         = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiHidden,      setAiHidden]      = useState(false);
  const [aiError,       setAiError]       = useState(null);
  const [aiDone,        setAiDone]        = useState(0);
  const [aiOpened,      setAiOpened]      = useState(true);
  // Configurações com alterações não salvas: sair da tela pede confirmação.
  const settingsDirty = useRef(false);
  const [pendingLeave, setPendingLeave] = useState(null);
  const [histWarning,   setHistWarning]   = useState(null);
  const [refDetectada, setRefDetectada] = useState({ prod: null, rep: null });
  // Cache da leitura por arquivo: { file, promise }. A auditoria sempre usa a leitura do arquivo selecionado agora.
  const parsedCache  = useRef({ prod: null, rep: null });

  // Auth: a sessão é resolvida pelo Firebase. O perfil (papel admin/user) vem do
  // Firestore a cada carregamento — não há estado de autenticação no navegador
  // em que dê para confiar, nem para forjar.
  useEffect(() => {
    if (!firebaseReady) { setAuthReady(true); return; }
    return observarSessao((user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
  }, []);

  const handleLogin = (user) => setCurrentUser(user);

  const handleLogout = async () => {
    try { await logout(); } catch { /* segue com a limpeza local */ }
    setCurrentUser(null);
    setActivePage("dashboard");
    setAuditView("list");
    setResultados(null);
    setHistorico([]);
    setFile1(null);
    setFile2(null);
    // Nada da sessão anterior passa para o próximo usuário desta aba
    setStatuses({});
    setSelectedMedico(null);
    setUploadError(null);
    setPeriodoAuditoria('');
    setHistWarning(null);
    setAiError(null);
  };

  const handleUpdateUser = (updated) => {
    setCurrentUser(updated);
  };

  // Histórico vem do Firestore em tempo real. Depende só de id/role para não
  // reassinar a cada edição de perfil (nome/foto) via handleUpdateUser.
  useEffect(() => {
    if (!currentUser) { setHistorico([]); return; }
    setHistStatus("loading");
    migrarHistoricoLocal(currentUser).catch(() => {});
    return observarHistorico(currentUser, (rows) => { setHistorico(rows); setHistStatus("ready"); }, () => {
      setHistStatus("error");
      setHistWarning("Não foi possível carregar o histórico. Verifique sua conexão.");
    });
  }, [currentUser?.id, currentUser?.role, histRetry]);

  // Lê cada arquivo uma vez só. Se o arquivo mudar, a leitura anterior é descartada.
  const readRows = (key, file) => {
    const cached = parsedCache.current[key];
    if (cached && cached.file === file) return cached.promise;
    const promise = parseExcel(file);
    parsedCache.current[key] = { file, promise };
    return promise;
  };

  // Prévia ao selecionar arquivo: linhas lidas e período detectado. Resultado de uma leitura antiga
  // (arquivo trocado ou removido no meio) é ignorado.
  const usePreview = (key, file, setCols, setRows) => useEffect(() => {
    setCols(null); setRows(null);
    setRefDetectada((r) => ({ ...r, [key]: null }));
    // Trocar ou remover o arquivo apaga o aviso de validação só deste card
    setUploadError((prev) => (prev && prev[key] ? { ...prev, [key]: undefined } : prev));
    if (!file) { parsedCache.current[key] = null; return undefined; }
    let alive = true;
    readRows(key, file)
      .then((rows) => {
        if (!alive) return;
        setCols(detectColumns(rows)); setRows(rows.length);
        setRefDetectada((r) => ({ ...r, [key]: extractReferencia(rows) }));
      })
      .catch(() => { /* o erro aparece ao processar */ });
    return () => { alive = false; };
  }, [file]);
  usePreview("prod", file1, setCols1, setRows1);
  usePreview("rep", file2, setCols2, setRows2);

  const step = (i, p) => {
    setSteps((s) => { const n = [...s]; n[i] = true; return n; });
    setProgress(p);
  };

  const startAudit = async () => {
    if (!file1 || !file2) return;
    setProcessing(true);
    setProgress(0);
    setSteps([false, false, false, false, false, false]);
    setUploadError(null);
    setStatuses({});

    try {
      // Etapa 1: Leitura dos arquivos (reaproveitando cache do preview quando disponível)
      step(0, 16);
      const [prodRows, repRows] = await Promise.all([readRows("prod", file1), readRows("rep", file2)]);

      // Etapa 2: Identificação das colunas
      const pCols = detectColumns(prodRows);
      const rCols = detectColumns(repRows);
      const prodErrors = validateFile(prodRows, pCols);
      const repErrors  = validateFile(repRows, rCols);
      step(1, 32);

      if (prodErrors.length || repErrors.length) {
        setProcessing(false);
        setUploadError({ prod: prodErrors, rep: repErrors });
        setActivePage("upload");
        return;
      }

      // Etapa 3: Comparação por médico
      const prodPorMed = groupBy(prodRows, pCols.medicoCol);
      const repPorMed  = groupBy(repRows,  rCols.medicoCol);
      const allMeds    = new Set([...Object.keys(prodPorMed), ...Object.keys(repPorMed)]);
      step(2, 50);

      // Etapa 4: Identificação de divergências
      // Tolerância (Configurações › Preferências de auditoria) lida no início de cada nova auditoria.
      // Padrão R$ 0,01 = o mesmo limite fixo de antes da opção "ignorar diferenças".
      const threshold = configs.ignorar ? getTolerance() : 0;
      const divs = [];
      for (const med of allMeds) {
        const pr   = prodPorMed[med] ?? [];
        const rr   = repPorMed[med]  ?? [];
        const tp   = sumVals(pr, pCols.valorCol);
        const tr   = sumVals(rr, rCols.valorCol);
        const diff = tp - tr;
        // Compara em centavos: diferença zero (ou resíduo de ponto flutuante) nunca é divergência,
        // e uma diferença igual à tolerância não é ignorada por arredondamento (0,70 − 0,60 = 0,0999…).
        const centavos = Math.round(Math.abs(diff) * 100);
        if (centavos === 0 || centavos < Math.round(threshold * 100)) continue;

        const detalhes = configs.comparaNome ? comparePatients(pr, rr, pCols, rCols) : [];
        // diff > 0 → Produção maior (médico subpago); diff < 0 → Repasse maior (possível sobrepagamento)
        divs.push({
          id:           med,
          medico:       med,
          crm:          "",
          producao:     brl(tp),
          repasse:      brl(tr),
          diferenca:    brl(Math.abs(diff)),
          diferencaRaw: Math.abs(diff),
          diferencaSigned: diff,
          sentido:      diff > 0 ? "prod_maior" : "rep_maior",
          status:       "pendente",
          detalhes,
        });
      }
      divs.sort((a, b) => b.diferencaRaw - a.diferencaRaw);
      step(3, 66);

      await new Promise((r) => setTimeout(r, 150));

      // Etapa 5: Geração do relatório
      const valorTotal  = divs.reduce((s, d) => s + d.diferencaRaw, 0);
      const totalDivs   = divs.reduce((s, d) => s + (d.detalhes.length || (d.diferencaRaw > 0 ? 1 : 0)), 0);
      step(4, 83);

      // Etapa 6: Insights com IA
      const insights = configs.ia ? generateInsights(divs, allMeds.size, valorTotal) : [];
      step(5, 100);
      await new Promise((r) => setTimeout(r, 350));

      const res = {
        totalMedicos:           allMeds.size,
        medicosComDivergencia:  divs.length,
        totalDivergencias:      totalDivs,
        valorTotal:             brl(valorTotal),
        valorTotalRaw:          valorTotal,
        divergencias:           divs,
        insights,
        processadoEm: new Date().toLocaleString("pt-BR"),
        referencia:   periodoAuditoria.trim() || extractReferencia(prodRows) || extractReferencia(repRows) || new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        file1Name:    file1.name,
        file2Name:    file2.name,
        tolerancia:   threshold,
      };
      const entry = {
        data:        new Date().toLocaleDateString("pt-BR"),
        periodo:     res.referencia,
        arquivos:    `${file1.name} / ${file2.name}`,
        divergencias: divs.length,
        valor:       res.valorTotal,
        resultados:  res,
      };
      let auditId = null;
      try {
        auditId = await salvarAuditoria(entry, currentUser);
        if (auditId === null) setHistWarning("Auditoria muito grande para salvar no histórico compartilhado — disponível apenas nesta sessão.");
      } catch {
        setHistWarning("Não foi possível salvar no histórico compartilhado. O resultado continua disponível nesta sessão.");
      }
      setResultados({ ...res, _histId: auditId });
      setPeriodoAuditoria('');

      setProcessing(false);
      setActivePage("results");
    } catch (err) {
      setProcessing(false);
      setUploadError({ geral: `Erro ao processar: ${err.message}` });
      setActivePage("upload");
    }
  };

  const VALID_EXT = ["xlsx", "xls", "csv"];

  const handleFileSelect = (file, setter) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!VALID_EXT.includes(ext)) {
      // Mantém os avisos dos cards: o erro de formato é só sobre o arquivo recusado
      setUploadError((prev) => ({ ...prev, geral: `Formato inválido: ".${ext}". Use .xlsx, .xls ou .csv.` }));
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError((prev) => ({ ...prev, geral: "Arquivo muito grande. Limite de 50 MB por arquivo." }));
      return;
    }
    setUploadError((prev) => (prev?.geral ? { ...prev, geral: undefined } : prev));
    setter(file);
  };

  const handleGenerateAIReport = async () => {
    if (!resultados) return;
    setAiLoading(true);
    setAiHidden(false);
    setAiError(null);
    try {
      const html = await generateAIReport(resultados, {
        responsavel: getExportOptions(currentUser).responsavel,
        getIdToken: auth?.currentUser ? () => auth.currentUser.getIdToken() : undefined,
      });
      setAiOpened(openReport(html, { title: `Relatório IA · ${resultados.referencia || "Auditoria"}` }));
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-ia-${new Date().toISOString().slice(0, 10)}.html`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setAiDone((n) => n + 1);
      // Anexa o HTML ao registro no Firestore para acesso futuro
      if (resultados._histId) {
        const ok = await salvarRelatorioIA(resultados._histId, resultados, html).catch(() => false);
        if (!ok) setHistWarning("Relatório gerado, mas não foi possível salvá-lo no histórico compartilhado.");
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const [deleteDone, setDeleteDone] = useState(0);
  const handleDeleteAudit = async (id) => {
    try { await excluirAuditoria(id); setDeleteDone((n) => n + 1); }
    catch { setHistWarning("Não foi possível excluir este registro. Tente novamente."); }
  };

  const startNewAudit = () => {
    // Já na Nova auditoria: não apaga o que está sendo preenchido (aba, botão da sidebar ou "+")
    if (activePage === "upload" || (activePage === "audits" && auditView === "new")) return;
    setActivePage("audits");
    setAuditView("new");
    setPeriodoAuditoria('');
    setFile1(null);
    setFile2(null);
    setUploadError(null);
    setConfigs(getNewAuditDefaults());
    setStatuses({});
    setSelectedMedico(null);
  };

  // Os status de revisão são desta auditoria: abrir outra começa do zero (antes vazavam entre meses).
  const openEntry = (entry) => {
    setStatuses({});
    setSelectedMedico(null);
    setResultados({ ...entry.resultados, _histId: entry.id });
    setActivePage("results");
  };
  const showAuditList = () => { setActivePage("audits"); setAuditView("list"); };
  const navigate = (id) => {
    setActivePage(id);
    if (id === 'audits') setAuditView('list');
  };

  if (!firebaseReady) return <FirebaseSetupScreen />;
  if (!authReady) return <AuthLoading />;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;
  if (currentUser.mustChangePassword) {
    return <ForcePasswordChangeScreen user={currentUser} onDone={handleUpdateUser} onLogout={handleLogout} />;
  }

  // "upload" é o destino de startAudit quando a validação falha: mostra Nova auditoria com os erros.
  const guardLeave = (fn) => (...args) => {
    if (activePage === "settings-page" && args[0] === "settings-page") return; // já está em Configurações
    if (activePage === "settings-page" && settingsDirty.current) { setPendingLeave(() => () => fn(...args)); return; }
    fn(...args);
  };
  const confirmLeave = () => { const go = pendingLeave; settingsDirty.current = false; setPendingLeave(null); go && go(); };

  const page = processing ? "processing" : activePage === "upload" ? "audits-new" : activePage === "audits" && auditView === "new" ? "audits-new" : activePage;
  const navActive = ["results", "upload", "audits", "processing", "audits-new"].includes(page) ? "audits" : page === "settings" ? "settings-page" : page;
  const toList = { label: 'Auditorias', onClick: showAuditList };
  const shell = {
    dashboard:       { crumbs: [{ label: 'Início' }, { label: 'Dashboard' }], title: 'Dashboard' },
    audits:          { crumbs: [{ label: 'Início', onClick: () => navigate('dashboard') }, { label: 'Auditorias' }], title: 'Auditorias' },
    "audits-new":    { crumbs: [toList, { label: 'Nova auditoria' }], title: 'Nova auditoria' },
    processing:      { crumbs: [toList, { label: 'Processando auditoria' }], title: 'Processando' },
    results:         { crumbs: [toList, { label: capitalize(resultados?.referencia) || 'Relatório' }], title: capitalize(resultados?.referencia) || 'Relatório', back: { label: 'Voltar para auditorias', onClick: showAuditList } },
    users:           { crumbs: [{ label: 'Administração' }, { label: 'Usuários e acessos' }], title: 'Usuários' },
    profile:         { crumbs: [{ label: 'Conta' }, { label: 'Meu perfil' }], title: 'Meu perfil' },
  }[page] || { crumbs: [{ label: currentUser.role === 'admin' ? 'Administração' : 'Conta' }, { label: 'Configurações' }], title: 'Configurações' };

  const persistentToasts = [
    aiError && { key: 'ai', tone: 'error', title: 'Não foi possível gerar o relatório', text: aiError, onClose: () => setAiError(null) },
    histWarning && { key: 'hist', tone: 'warning', title: histWarning, onClose: () => setHistWarning(null) },
  ];

  return (
    <ToastProvider persistent={persistentToasts}>
      <SuccessToasts aiDone={aiDone} aiOpened={aiOpened} deleteDone={deleteDone} />
      <AppLayout user={currentUser} active={navActive} onNavigate={guardLeave(navigate)} onNewAudit={guardLeave(startNewAudit)} onLogout={guardLeave(handleLogout)}
        crumbs={shell.crumbs} title={shell.title} back={shell.back}>
        {page === "processing" ? (
          <ProcessingPage steps={steps} progress={progress} />
        ) : page === "dashboard" ? (
          <DashboardPage historico={historico} currentUser={currentUser} status={histStatus} onRetry={() => setHistRetry((n) => n + 1)}
            onNewAudit={startNewAudit} onOpen={openEntry} onShowAudits={showAuditList} />
        ) : page === "audits-new" || page === "audits" ? (
          <AuditsPage exportOptions={() => getExportOptions(currentUser)} view={page === "audits-new" ? "new" : "list"} onShowList={showAuditList} onNewAudit={startNewAudit}
            list={{ historico, currentUser, onOpen: openEntry, onDelete: handleDeleteAudit, status: histStatus, onRetry: () => setHistRetry((n) => n + 1) }}
            upload={{ file1, file2, setFile1, setFile2, handleFileSelect, configs, setConfigs, startAudit, uploadError, cols1, cols2, rows1, rows2, periodoAuditoria, setPeriodoAuditoria, periodoDetectado: refDetectada.prod || refDetectada.rep }} />
        ) : page === "results" ? (
          <ReportPage
            selectedMedico={selectedMedico} setSelectedMedico={setSelectedMedico}
            resultados={resultados}
            statuses={statuses} setStatuses={setStatuses}
            exportFormat={getPreferences().formato}
            onExportExcel={() => resultados && exportExcel(resultados, getExportOptions(currentUser, statuses))}
            onExportPDF={()   => resultados && exportPDF(resultados, getExportOptions(currentUser, statuses))}
            onGenerateAI={handleGenerateAIReport}
            aiLoading={aiLoading}
            onShare={() => {
              if (!resultados) return;
              const txt = `Auditoria ${resultados.referencia}\n${resultados.medicosComDivergencia} médicos com divergência — Valor total: ${resultados.valorTotal}`;
              return copyText(txt);
            }}
            onNewAudit={startNewAudit}
          />
        ) : page === "users" ? (
          <UsersPage currentUser={currentUser} />
        ) : page === "profile" ? (
          <ProfilePage currentUser={currentUser} onUpdateUser={handleUpdateUser} />
        ) : (
          <SettingsPage currentUser={currentUser} onDirtyChange={(d) => { settingsDirty.current = d; }} />
        )}
        {aiLoading && !aiHidden && (
          <AiProgressModal steps={AI_STEPS} onBackground={() => setAiHidden(true)}
            description="As divergências estão sendo analisadas para criar o relatório executivo. Você pode continuar usando o ConSaúde." />
        )}
        <Modal open={Boolean(pendingLeave)} onClose={() => setPendingLeave(null)} icon="triangle-alert"
          title="Sair sem salvar?" description="As alterações feitas em Configurações ainda não foram salvas e serão descartadas."
          footer={<><Button variant="secondary" onClick={() => setPendingLeave(null)} data-autofocus>Continuar editando</Button><Button variant="danger" onClick={confirmLeave}>Descartar alterações</Button></>} />
      </AppLayout>
    </ToastProvider>
  );
}

/** Toasts de sucesso disparados por contadores do App (fora do provider não há acesso ao hook). */
function SuccessToasts({ aiDone, aiOpened, deleteDone }) {
  const toast = useToast();
  const seen = useRef({ aiDone, deleteDone });
  useEffect(() => {
    if (aiDone > seen.current.aiDone) toast(aiOpened
      ? { tone: 'ia', title: 'Relatório IA gerado', text: 'Ele foi aberto em uma nova aba e baixado.' }
      : { tone: 'ia', title: 'Relatório IA gerado e baixado', text: 'O navegador bloqueou a nova aba. Abra o arquivo baixado ou use "Ver relatório IA" em Auditorias.', duration: 9000 });
    if (deleteDone > seen.current.deleteDone) toast({ tone: 'success', title: 'Auditoria excluída' });
    seen.current = { aiDone, deleteDone };
  }, [aiDone, aiOpened, deleteDone, toast]);
  return null;
}
