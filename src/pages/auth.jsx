// Telas fora do app autenticado: Login, Esqueci a senha, Troca obrigatória de senha, Setup do Firebase, carregando.
// Lógica movida de auditoria-medica.jsx sem alteração; só a apresentação mudou.
import React, { useState } from 'react';
import { login, enviarResetDeSenha, alterarPropriaSenha, mensagemDeErro } from '../auth';
import { Brand, Button, Callout, Checkbox, Icon, IconButton, Spinner, TextField, ThemeToggle, useViewport } from '../components/ds/index.js';

/** Casca das telas sem login: marca e tema no <header>, conteúdo no <main> de cada tela, rodapé no <footer>.
 * `data-compact` liga as regras de toque (44px) e de campos de 16px no mobile, como na casca do app. */
export function AuthLayout({ children, busy, footer }) {
  const { compact } = useViewport();
  return (
    <div className="cs-auth cs-root" data-compact={compact || undefined} aria-busy={busy || undefined}>
      <header className="cs-auth__brand">
        <div className="cs-auth__theme"><ThemeToggle /></div>
        <Brand />
      </header>
      {children}
      {footer && <footer className="cs-auth__foot">{footer}</footer>}
    </div>
  );
}

export function AuthLoading() {
  return (
    <main className="cs-auth cs-root" aria-busy="true">
      <Spinner size={28} />
      <p className="cs-auth__sub" role="status">Carregando o ConSaúde…</p>
    </main>
  );
}

/** Sessão salva, mas o perfil não carregou (sem internet ou Firestore lento). Não desloga. */
export function SessionErrorScreen({ onRetry, onLogout }) {
  return (
    <AuthLayout>
      <main className="cs-card cs-auth__card" role="alert">
        <div className="cs-auth__head">
          <h1 className="cs-auth__title">Sem conexão com o ConSaúde</h1>
          <p className="cs-auth__sub">Não foi possível carregar sua conta. Verifique a internet e tente de novo. Sua sessão continua salva.</p>
        </div>
        <div className="cs-stack" style={{ gap: 8 }}>
          <Button variant="primary" icon="refresh-cw" onClick={onRetry}>Tentar novamente</Button>
          <Button variant="ghost" onClick={onLogout}>Sair</Button>
        </div>
      </main>
    </AuthLayout>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function LoginScreen({ onLogin, notice = '' }) {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [remember,  setRemember]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(notice);
  const [showPwd,   setShowPwd]   = useState(false);
  const [showForgot,setShowForgot]= useState(false);
  const [forgotEmail,setForgotEmail]= useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // A senha nunca é comparada aqui — quem valida é o Firebase Auth.
      const user = await login(email, password, remember);
      onLogin(user);
    } catch (err) {
      setError(err.mensagem || mensagemDeErro(err));
      setLoading(false);
    }
  };

  if (showForgot) return <ForgotPasswordScreen email={forgotEmail} onBack={() => setShowForgot(false)} />;

  return (
    <AuthLayout footer={<p>ConSaúde · Sistema interno de auditoria médica</p>}>
      <main className="cs-card cs-auth__card">
        <div className="cs-auth__head">
          <h1 className="cs-auth__title">Bem-vindo de volta</h1>
          <p className="cs-auth__sub">Entre com sua conta para acessar o sistema.</p>
        </div>
        <form className="cs-auth__form" onSubmit={submit}>
          <TextField label="E-mail" type="email" value={email} required placeholder="seu@email.com.br" autoComplete="email"
            prefixIcon="mail" onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Senha" type={showPwd ? 'text' : 'password'} value={password} required placeholder="Sua senha" autoComplete="current-password"
            prefixIcon="lock" onChange={(e) => setPassword(e.target.value)}
            end={<IconButton icon={showPwd ? 'eye-off' : 'eye'} label={showPwd ? 'Ocultar senha' : 'Mostrar senha'} size="sm" className="cs-control__clear" onClick={() => setShowPwd((p) => !p)} />} />
          {error && <Callout tone="danger">{error}</Callout>}
          <div className="cs-auth__row">
            <Checkbox label="Lembrar-me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <button type="button" className="cs-linkbtn" onClick={() => { setForgotEmail(email); setShowForgot(true); }}>Esqueci a senha</button>
          </div>
          <Button variant="primary" type="submit" size="lg" block loading={loading} icon={loading ? undefined : 'log-in'}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </main>
    </AuthLayout>
  );
}

// ─── ESQUECI A SENHA ──────────────────────────────────────────────────────────
export function ForgotPasswordScreen({ email: initialEmail, onBack }) {
  const [email,     setEmail]     = useState(initialEmail || '');
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState('');

  const enviar = async () => {
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    setError('');
    setSending(true);
    try {
      await enviarResetDeSenha(email);
    } catch (err) {
      // auth/user-not-found não é diferenciado de propósito: confirmar quais
      // e-mails existem entregaria uma lista de contas válidas a quem tentasse.
      if (err?.code !== 'auth/user-not-found') {
        setError(mensagemDeErro(err));
        setSending(false);
        return;
      }
    }
    setSubmitted(true);
    setSending(false);
  };

  return (
    <AuthLayout>
      <main className="cs-card cs-auth__card">
        {submitted ? (
          <>
            <span className="cs-auth__icon cs-auth__icon--success" aria-hidden="true"><Icon name="mail" /></span>
            <div className="cs-auth__head">
              <h1 className="cs-auth__title">Verifique seu e-mail</h1>
              <p className="cs-auth__sub">
                Se houver uma conta para <b style={{ color: 'var(--ink)', overflowWrap: 'anywhere' }}>{email}</b>, você receberá um link para criar uma nova senha.
              </p>
              <p className="cs-auth__sub">O link expira em 1 hora. Confira também a caixa de spam.</p>
            </div>
            <Button variant="secondary" icon="arrow-left" block onClick={onBack}>Voltar ao login</Button>
          </>
        ) : (
          <>
            <div><button type="button" className="cs-linkbtn" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="arrow-left" size={16} />Voltar</button></div>
            <div className="cs-auth__head">
              <h1 className="cs-auth__title">Esqueci a senha</h1>
              <p className="cs-auth__sub">Informe seu e-mail e enviaremos um link seguro para você criar uma nova senha.</p>
            </div>
            <form className="cs-auth__form" noValidate onSubmit={(e) => { e.preventDefault(); enviar(); }}>
              <TextField label="E-mail da conta" type="email" value={email} placeholder="seu@email.com.br" autoComplete="email" prefixIcon="mail"
                onChange={(e) => setEmail(e.target.value)} />
              {error && <Callout tone="danger">{error}</Callout>}
              <Button variant="primary" type="submit" block loading={sending}>
                {sending ? 'Enviando…' : 'Enviar link de redefinição'}
              </Button>
            </form>
          </>
        )}
      </main>
    </AuthLayout>
  );
}

// ─── TROCA DE SENHA OBRIGATÓRIA ───────────────────────────────────────────────
// Exibida quando a conta foi criada com senha temporária definida pelo admin.
// A troca em si é feita pelo Firebase Auth; o flag mustChangePassword só é
// baixado depois que a nova senha é aceita pelo servidor.
export function ForcePasswordChangeScreen({ user, onDone, onLogout }) {
  const [form,    setForm]    = useState({ atual:'', nova:'', confirma:'' });
  const [erro,    setErro]    = useState('');
  const [salvando,setSalvando]= useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.nova.length < 8)          { setErro('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    if (form.nova !== form.confirma)   { setErro('As senhas não coincidem.'); return; }
    if (form.nova === form.atual)      { setErro('A nova senha deve ser diferente da temporária.'); return; }
    setErro('');
    setSalvando(true);
    try {
      await alterarPropriaSenha(form.atual, form.nova);
      onDone({ ...user, mustChangePassword: false });
    } catch (err) {
      setErro(mensagemDeErro(err));
      setSalvando(false);
    }
  };

  const campos = [
    { key:'atual',    label:'Senha temporária', ph:'A senha que você recebeu', ac:'current-password' },
    { key:'nova',     label:'Nova senha',       ph:'Mínimo 8 caracteres', ac:'new-password' },
    { key:'confirma', label:'Confirmar nova senha', ph:'Repita a nova senha', ac:'new-password' },
  ];

  return (
    <AuthLayout>
      <main className="cs-card cs-auth__card">
        <span className="cs-auth__icon cs-auth__icon--warning" aria-hidden="true"><Icon name="key-round" /></span>
        <div className="cs-auth__head">
          <h1 className="cs-auth__title">Defina sua senha</h1>
          <p className="cs-auth__sub">Olá, {user.name?.split(' ')[0]}. Sua conta usa uma senha temporária. Escolha uma senha pessoal para continuar.</p>
        </div>
        <form className="cs-auth__form" onSubmit={submit}>
          {campos.map(({ key, label, ph, ac }) => (
            <TextField key={key} label={label} type="password" value={form[key]} required placeholder={ph} autoComplete={ac}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
          ))}
          {erro && <Callout tone="danger">{erro}</Callout>}
          <Button variant="primary" type="submit" size="lg" block loading={salvando}>
            {salvando ? 'Salvando…' : 'Salvar e entrar'}
          </Button>
        </form>
        <div style={{ textAlign: 'center' }}><button type="button" className="cs-linkbtn" onClick={onLogout}>Sair</button></div>
      </main>
    </AuthLayout>
  );
}

// ─── FIREBASE NÃO CONFIGURADO ─────────────────────────────────────────────────
export function FirebaseSetupScreen() {
  return (
    <AuthLayout>
      <main className="cs-card cs-auth__card" style={{ maxWidth: 480 }}>
        <span className="cs-auth__icon cs-auth__icon--warning" aria-hidden="true"><Icon name="database" /></span>
        <div className="cs-auth__head">
          <h1 className="cs-auth__title">Firebase não configurado</h1>
          <p className="cs-auth__sub">
            As variáveis <code>VITE_FIREBASE_*</code> não foram encontradas.
            Copie <code>.env.example</code> para <code>.env</code>, preencha com as credenciais do projeto no Console do Firebase e reinicie o servidor.
          </p>
        </div>
      </main>
    </AuthLayout>
  );
}
