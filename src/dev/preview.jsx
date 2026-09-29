// Harness SÓ DE DESENVOLVIMENTO: renderiza cada tela com props fictícias, sem Firebase e sem tocar na autenticação.
// Abra /dev-preview.html?screen=dashboard&theme=light (npm run dev). Não entra no build de produção
// (vite build só usa index.html).
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/components.css';
import '../styles/app.css';
import AppLayout from '../components/AppLayout.jsx';
import { ToastProvider } from '../components/Toaster.jsx';
import { AiProgressModal } from '../components/ds/index.js';
import DashboardPage from '../pages/DashboardPage.jsx';
import AuditsPage from '../pages/AuditsPage.jsx';
import ProcessingPage from '../pages/ProcessingPage.jsx';
import ReportPage from '../pages/ReportPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import { LoginScreen, ForgotPasswordScreen, ForcePasswordChangeScreen, FirebaseSetupScreen } from '../pages/auth.jsx';
import { makeHistorico, makeResultados, ADMIN, AUDITOR, USER_LIST } from './fixtures.js';

const params = new URLSearchParams(location.search);
const screen = params.get('screen') || 'dashboard';
document.documentElement.setAttribute('data-theme', params.get('theme') === 'light' ? 'light' : 'dark');
const user = params.get('role') === 'user' ? AUDITOR : ADMIN;
const historico = params.get('empty') ? [] : makeHistorico();
const status = params.get('status') || 'ready';

const later = (v, ms = 400) => new Promise((r) => setTimeout(() => r(v), ms));
const fakeAuth = {
  listarUsuarios: () => (params.get('status') === 'error' ? Promise.reject({ code: 'unavailable' }) : later(USER_LIST, status === 'loading' ? 1e9 : 50)),
  criarUsuario: () => later(true), atualizarUsuario: () => later(true), definirUsuarioDesativado: () => later(true),
  enviarResetDeSenha: () => later(true), atualizarFotoPerfil: () => later(true), alterarPropriaSenha: () => later(true),
  mensagemDeErro: () => 'Firestore indisponível. Verifique se o banco de dados foi criado no Console.',
};

function fakeFile(name, size) {
  const f = new File([new Uint8Array(8)], name);
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

function Shell() {
  const [page, setPage] = useState(screen);
  const [statuses, setStatuses] = useState({ 'MARIANA DOS SANTOS COSTA': 'revisado', 'JOÃO PEDRO DA SILVA': 'corrigido', 'FERNANDA LIMA ROCHA': 'revisado', 'CARLOS EDUARDO MENDES': 'corrigido' });
  const resultados = makeResultados();
  const [selected, setSelected] = useState(page === 'report-drawer' ? resultados.divergencias[0] : null);
  const [configs, setConfigs] = useState({ ignorar: true, comparaNome: true, comparaCodigo: false, ia: true });
  const loaded = page === 'new-loaded' || page === 'new-error';
  const [file1, setFile1] = useState(loaded ? fakeFile('producao_set-2026_clinica-integrada-sao-lucas.xlsx', 184320) : null);
  const [file2, setFile2] = useState(page === 'new-error' ? fakeFile('repasse_set-2026.csv', 40960) : null);
  const [periodo, setPeriodo] = useState(loaded ? 'Setembro/2026' : '');
  const uploadError = page === 'new-error' ? { prod: [], rep: ['Coluna de valor/total não identificada.'] } : page === 'new-format' ? { geral: 'Formato inválido: ".pdf". Use .xlsx, .xls ou .csv.' } : null;
  const nav = (id) => setPage(id === 'audits' ? 'audits' : id);
  const base = page.split('-')[0];
  const active = { dashboard: 'dashboard', audits: 'audits', new: 'audits', processing: 'audits', report: 'audits', users: 'users', profile: 'profile', settings: 'settings-page', 'settings-page': 'settings-page' }[base] || base;
  const crumbs = { dashboard: [{ label: 'Início' }, { label: 'Dashboard' }], report: [{ label: 'Auditorias', onClick: () => setPage('audits') }, { label: 'Setembro de 2026' }], users: [{ label: 'Administração' }, { label: 'Usuários e acessos' }] }[base] || [{ label: 'Início' }, { label: base }];
  const back = base === 'report' ? { label: 'Voltar para auditorias', onClick: () => setPage('audits') } : undefined;

  let body;
  if (base === 'dashboard') body = <DashboardPage historico={historico} currentUser={user} status={status} onNewAudit={() => setPage('new')} onOpen={() => setPage('report')} onShowAudits={() => setPage('audits')} />;
  else if (base === 'audits' || base === 'new') body = (
    <AuditsPage view={base === 'new' ? 'new' : 'list'} onShowList={() => setPage('audits')} onNewAudit={() => setPage('new')} historyCount={historico.length}
      list={{ historico, currentUser: user, status, onOpen: () => setPage('report'), onDelete: () => {}, onRetry: () => {} }}
      upload={{ file1, file2, setFile1, setFile2, handleFileSelect: (f, set) => set(f), configs, setConfigs, startAudit: () => setPage('processing'), uploadError,
        cols1: file1 ? { medicoCol: 'Nome do Prestador', pacienteCol: 'Beneficiário', valorCol: 'Valor Total' } : null, rows1: file1 ? 1284 : null,
        cols2: file2 ? { medicoCol: 'Profissional', pacienteCol: 'Paciente', valorCol: null } : null, rows2: file2 ? 1190 : null,
        periodoAuditoria: periodo, setPeriodoAuditoria: setPeriodo }} />
  );
  else if (base === 'processing') body = <ProcessingPage steps={[true, true, true, false, false, false]} progress={50} />;
  else if (base === 'report') body = (
    <ReportPage selectedMedico={selected} setSelectedMedico={setSelected} resultados={params.get('empty') ? makeResultados({ n: 0 }) : resultados}
      statuses={statuses} setStatuses={setStatuses} onExportExcel={() => {}} onExportPDF={() => {}} onGenerateAI={() => {}} aiLoading={page === 'report-ai'}
      onShare={() => {}} onNewAudit={() => setPage('new')} />
  );
  else if (base === 'users') body = <UsersPage currentUser={user} deps={fakeAuth} />;
  else if (base === 'profile') body = <ProfilePage currentUser={user} onUpdateUser={() => {}} deps={fakeAuth} />;
  else body = <SettingsPage currentUser={user} />;

  return (
    <ToastProvider persistent={params.get('toast') ? [{ key: 'w', tone: 'warning', title: 'Não foi possível salvar no histórico compartilhado. O resultado continua disponível nesta sessão.', onClose: () => {} }] : []}>
      <AppLayout user={user} active={active} onNavigate={nav} onNewAudit={() => setPage('new')} onLogout={() => {}} crumbs={crumbs} title={crumbs[crumbs.length - 1].label} back={back}>
        {body}
        {page === 'report-ai' && <AiProgressModal steps={[{ label: 'Consolidando divergências por médico', state: 'pending' }, { label: 'Identificando riscos financeiros', state: 'pending' }, { label: 'Preparando o plano de ação', state: 'pending' }]} onBackground={() => setPage('report')} autoFocus={false} />}
      </AppLayout>
    </ToastProvider>
  );
}

function Root() {
  if (screen === 'login') return <LoginScreen onLogin={() => {}} />;
  if (screen === 'forgot') return <ForgotPasswordScreen email="ana.lima@clinicasaolucas.com.br" onBack={() => {}} />;
  if (screen === 'force') return <ForcePasswordChangeScreen user={AUDITOR} onDone={() => {}} onLogout={() => {}} />;
  if (screen === 'setup') return <FirebaseSetupScreen />;
  return <Shell />;
}

createRoot(document.getElementById('root')).render(<StrictMode><Root /></StrictMode>);
