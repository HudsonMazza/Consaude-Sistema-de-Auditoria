// Usuários e acessos — mesma lógica do UserManagementPage anterior (Firebase via src/auth.js).
// `deps` existe só para o harness de desenvolvimento injetar dados fictícios; em produção usa as funções reais.
import React, { useEffect, useState } from 'react';
import * as authApi from '../auth';
import { formatarData } from '../lib/clinicSettings.js';
import {
  Button, Badge, Card, StatStrip, DataTable, Pagination, Avatar, StatusBadge, ProfileBadge, SearchField, FilterChips,
  PageHeader, EmptyState, ErrorState, Modal, Callout, TextField, Checkbox, sortRows, formatNumber, useViewport,
} from '../components/ds/index.js';
import { useToast } from '../components/Toaster.jsx';

function Choice({ value, current, title, text, onSelect, disabled }) {
  const selected = current === value;
  return (
    <button type="button" role="radio" aria-checked={selected} className="cs-choice" disabled={disabled} onClick={() => onSelect(value)}>
      <span className="cs-choice__mark" aria-hidden="true" />
      <span><span className="cs-choice__title">{title}</span><span className="cs-choice__text">{text}</span></span>
    </button>
  );
}

export default function UsersPage({ currentUser, deps = authApi }) {
  const { listarUsuarios, criarUsuario, atualizarUsuario, definirUsuarioDesativado, enviarResetDeSenha, mensagemDeErro } = deps;
  const { compact } = useViewport();
  const toast = useToast();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editUser,   setEditUser]   = useState(null);
  const [form,       setForm]       = useState({ name:'', email:'', password:'', role:'user', cargo:'', modo:'convite' });
  const [formError,  setFormError]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [resetId,    setResetId]    = useState(null);
  const [resetDone,  setResetDone]  = useState(false);
  const [resetErr,   setResetErr]   = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [actionId,   setActionId]   = useState(null);
  const [query,      setQuery]      = useState('');
  const [filter,     setFilter]     = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [sort,       setSort]       = useState(null);
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(25);

  const refresh = async () => {
    try {
      setUsers(await listarUsuarios());
      setLoadError('');
    } catch (err) {
      setLoadError(mensagemDeErro(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { setPage(1); }, [query, filter, pageSize, sort]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name:'', email:'', password:'', role:'user', cargo:'', modo:'convite' });
    setFormError('');
    setShowPassword(false);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name:u.name||'', email:u.email||'', password:'', role:u.role||'user', cargo:u.cargo||'', modo:'convite' });
    setFormError('');
    setShowPassword(false);
    setShowForm(true);
  };

  const saveUser = async () => {
    setFormError('');
    if (!form.name.trim())  { setFormError('Nome é obrigatório.'); return; }
    if (!form.email.trim()) { setFormError('E-mail é obrigatório.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Informe um e-mail válido.'); return;
    }
    if (!editUser && form.modo === 'temporaria' && form.password.length < 8) {
      setFormError('A senha temporária deve ter pelo menos 8 caracteres.'); return;
    }
    setSaving(true);
    try {
      let aviso;
      if (editUser) {
        // O e-mail é a identidade no Firebase Auth e não é editável aqui.
        await atualizarUsuario(editUser.id, { nome:form.name.trim(), cargo:form.cargo.trim(), role:form.role });
        aviso = 'Usuário atualizado.';
      } else {
        await criarUsuario({
          nome: form.name.trim(), email: form.email.trim(), cargo: form.cargo.trim(), role: form.role,
          modo: form.modo, senhaTemporaria: form.password,
        }, currentUser.id);
        aviso = form.modo === 'temporaria'
          ? 'Usuário criado. Ele deverá trocar a senha temporária no primeiro acesso.'
          : `Convite enviado para ${form.email.trim()}. O usuário define a própria senha pelo link.`;
      }
      toast({ tone: 'success', title: aviso });
      await refresh();
      setShowForm(false);
    } catch (err) {
      setFormError(mensagemDeErro(err));
    } finally {
      setSaving(false);
    }
  };

  // No plano Spark o cliente não exclui a conta de outro usuário no Auth.
  // Desativar corta o acesso pelas Security Rules, que é o efeito que importa.
  const toggleAtivo = async (u, desativar) => {
    setActionId(u.id);
    try {
      await definirUsuarioDesativado(u.id, desativar);
      toast({ tone: 'success', title: desativar ? `${u.name} foi desativado e perdeu o acesso.` : `${u.name} foi reativado.` });
      await refresh();
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível alterar o acesso', text: mensagemDeErro(err) });
    } finally {
      setActionId(null);
      setConfirmDel(null);
    }
  };

  // O admin não define mais a senha de ninguém: dispara o e-mail de redefinição
  // e o próprio usuário escolhe a senha. Ninguém além do dono a conhece.
  const doReset = async () => {
    const alvo = users.find(u => u.id === resetId);
    if (!alvo) return;
    setResetErr('');
    setResetSending(true);
    try {
      await enviarResetDeSenha(alvo.email);
      setResetDone(true);
    } catch (err) {
      setResetErr(mensagemDeErro(err));
    } finally {
      setResetSending(false);
    }
  };

  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const activeUsers = users.filter(u => !u.disabled);
  const adminUsers = users.filter(u => u.role === 'admin');
  const attentionUsers = users.filter(u => u.disabled || u.mustChangePassword);
  const pendingUsers = users.filter(u => !u.disabled && u.mustChangePassword);
  const disabledUsers = users.filter(u => u.disabled);
  const visibleUsers = users.filter((u) => {
    const matchesQuery = !normalizedQuery || [u.name, u.email, u.cargo]
      .some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(normalizedQuery));
    const matchesFilter = filter === 'all'
      || (filter === 'active' && !u.disabled)
      || (filter === 'admin' && u.role === 'admin')
      || (filter === 'pending' && !u.disabled && u.mustChangePassword)
      || (filter === 'disabled' && u.disabled);
    return matchesQuery && matchesFilter;
  }).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'));

  const statusFor = (user) => (user.disabled ? 'desativado' : user.mustChangePassword ? 'senha-pendente' : 'ativo');
  const displayName = (user) => user.name || user.email || 'Usuário';
  const isSelf = (user) => user.id === currentUser.id;
  const openReset = (user) => {
    setResetId(user.id);
    setResetDone(false);
    setResetErr('');
  };
  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setFormError('');
  };
  const closeReset = () => {
    if (resetSending) return;
    setResetId(null);
    setResetDone(false);
    setResetErr('');
  };
  const clearFilters = () => { setQuery(''); setFilter('all'); };
  const resetTarget = users.find(user => user.id === resetId);

  const userActions = (user) => [
    ...(compact ? [{ label: 'Editar usuário', icon: 'pencil', onSelect: () => openEdit(user), disabled: !!actionId }] : []),
    { label: 'Redefinir senha', icon: 'key-round', onSelect: () => openReset(user), disabled: !!actionId },
    ...(!isSelf(user) ? [
      { separator: true },
      user.disabled
        ? { label: actionId === user.id ? 'Reativando…' : 'Reativar acesso', icon: 'user-check', onSelect: () => toggleAtivo(user, false), disabled: !!actionId }
        : { label: 'Desativar acesso', icon: 'user-x', variant: 'danger', onSelect: () => setConfirmDel(user), disabled: !!actionId },
    ] : []),
  ];

  const columns = [
    { key: 'name', header: 'Usuário', sortable: true, sortValue: (u) => String(displayName(u)).toLocaleLowerCase('pt-BR'), render: (u) => (
      <span className="cs-cell-person">
        <Avatar name={displayName(u)} src={u.photo || undefined} off={u.disabled} />
        <span className="cs-cell-main" style={{ minWidth: 0, maxWidth: 320 }}>
          <span className="cs-cell-main__title" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}><span className="cs-truncate">{displayName(u)}</span>{isSelf(u) && <Badge tone="accent" size="sm">Sua conta</Badge>}</span>
          <span className="cs-cell-main__sub cs-truncate" title={u.email}>{u.email || '—'}</span>
        </span>
      </span>) },
    { key: 'cargo', header: 'Cargo', priority: 3, sortable: true, sortValue: (u) => String(u.cargo || ''), render: (u) => <span className="cs-muted">{u.cargo || '—'}</span> },
    { key: 'role', header: 'Perfil', sortable: true, sortValue: (u) => u.role, render: (u) => <ProfileBadge profile={u.role === 'admin' ? 'admin' : 'user'}>{u.role === 'admin' ? 'Administrador' : 'Usuário'}</ProfileBadge> },
    { key: 'status', header: 'Status', sortable: true, sortValue: statusFor, render: (u) => <StatusBadge status={statusFor(u)} /> },
    { key: 'created', header: 'Criado em', priority: 3, render: (u) => <span className="cs-num cs-muted">{formatarData(u.createdAt)}</span> },
  ];
  const sorted = sortRows(visibleUsers, columns, sort);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const pageRows = sorted.slice((current - 1) * pageSize, current * pageSize);
  const dash = (v) => (loading ? '–' : formatNumber(v));

  return (
    <>
      <PageHeader title="Usuários e acessos" subtitle="Gerencie contas, perfis e disponibilidade de acesso ao sistema."
        primary={<Button variant="primary" icon="user-plus" onClick={openCreate}>Novo usuário</Button>} />

      <StatStrip items={[
        { label: 'Contas cadastradas', value: dash(users.length), icon: 'users' },
        { label: 'Acessos ativos', value: dash(activeUsers.length), sub: !loading && users.length - activeUsers.length ? `${users.length - activeUsers.length} ${users.length - activeUsers.length === 1 ? 'bloqueado' : 'bloqueados'}` : undefined, icon: 'circle-check', tone: 'success' },
        { label: 'Administradores', value: dash(adminUsers.length), icon: 'shield-check', tone: 'accent' },
        { label: 'Requer atenção', value: dash(attentionUsers.length), icon: 'triangle-alert', tone: 'warning' },
      ]} />

      {loadError && users.length > 0 && (
        <Callout tone="danger" title="Não foi possível atualizar a lista" action={<Button variant="secondary" size="sm" icon="refresh-cw" onClick={() => { setLoading(true); setLoadError(''); refresh(); }}>Tentar novamente</Button>}>{loadError}</Callout>
      )}

      <Card flush>
        <div className="cs-card-toolbar cs-card-toolbar--top">
          <div className="cs-toolbar">
            <div className="cs-toolbar__grow" style={compact ? { flexBasis: '100%', maxWidth: 'none' } : { maxWidth: 360 }}>
              <SearchField placeholder="Buscar por nome, e-mail ou cargo" label="Buscar usuários" value={query} onChange={setQuery} />
            </div>
            {!compact && !loading && users.length > 0 && <div className="cs-toolbar__end"><span className="cs-count-line" aria-live="polite">Exibindo <b>{formatNumber(visibleUsers.length)}</b> de <b>{formatNumber(users.length)}</b></span></div>}
          </div>
          <div className="cs-chips cs-chips--scroll" style={{ '--_bleed': compact ? '16px' : '0px' }}>
            <FilterChips label="Filtrar usuários" value={filter} onChange={setFilter} options={[
              { id: 'all', label: 'Todos', count: users.length },
              { id: 'active', label: 'Ativos', count: activeUsers.length },
              { id: 'admin', label: 'Administradores', count: adminUsers.length },
              { id: 'pending', label: 'Senha pendente', count: pendingUsers.length },
              { id: 'disabled', label: 'Desativados', count: disabledUsers.length },
            ]} />
          </div>
          {compact && !loading && users.length > 0 && <span className="cs-count-line" aria-live="polite">Exibindo <b>{formatNumber(visibleUsers.length)}</b> de <b>{formatNumber(users.length)}</b></span>}
        </div>
        {!loading && loadError && users.length === 0 ? (
          <ErrorState title="Lista temporariamente indisponível" onRetry={() => { setLoading(true); setLoadError(''); refresh(); }}>{loadError}</ErrorState>
        ) : (
          <DataTable caption="Usuários" rows={pageRows} loading={loading} rowKey={(u) => u.id} columns={columns} sort={sort} onSortChange={setSort}
            empty={users.length === 0
              ? <EmptyState icon="users" title="Nenhum usuário cadastrado." actions={<Button variant="primary" icon="user-plus" onClick={openCreate}>Novo usuário</Button>}>Crie a primeira conta para começar.</EmptyState>
              : <EmptyState icon="search-x" title="Nenhum usuário encontrado" actions={<Button variant="secondary" icon="rotate-ccw" onClick={clearFilters}>Limpar filtros</Button>}>Ajuste a busca ou escolha outro filtro.</EmptyState>}
            primaryAction={(u) => ({ label: 'Editar', icon: 'pencil', ariaLabel: 'Editar ' + displayName(u), onClick: () => openEdit(u), disabled: !!actionId })}
            rowActions={userActions}
            onRowClick={compact ? (u) => { if (!actionId) openEdit(u); } : undefined}
            mobile={{
              title: (u) => displayName(u),
              meta: (u) => <span className="cs-truncate" style={{ maxWidth: '100%' }} title={u.email}>{u.email || '—'}</span>,
              tags: (u) => <>{isSelf(u) && <Badge tone="accent" size="sm">Sua conta</Badge>}<ProfileBadge profile={u.role === 'admin' ? 'admin' : 'user'} size="sm">{u.role === 'admin' ? 'Administrador' : 'Usuário'}</ProfileBadge><StatusBadge status={statusFor(u)} size="sm" /></>,
            }}
            footer={sorted.length > 10 ? <Pagination page={current} pageSize={pageSize} total={sorted.length} compact={compact} onPage={setPage} onPageSize={setPageSize} /> : null} />
        )}
      </Card>

      {showForm && (
        <Modal size="wide" icon={editUser ? 'pencil' : 'user-plus'}
          title={editUser ? 'Editar usuário' : 'Criar novo usuário'}
          description={editUser ? `Atualize os dados e permissões de ${displayName(editUser)}.` : 'Configure a conta, as permissões e a forma de primeiro acesso.'}
          onClose={closeForm} dismissible={!saving}
          footer={<>
            <Button variant="secondary" onClick={closeForm} disabled={saving}>Cancelar</Button>
            <Button variant="primary" type="submit" form="user-account-form" loading={saving} icon={saving ? undefined : 'check'}>
              {saving ? 'Salvando…' : editUser ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </>}>
          <form id="user-account-form" className="cs-stack" style={{ gap: 20 }} onSubmit={(event) => { event.preventDefault(); saveUser(); }} noValidate>
            {formError && <Callout tone="danger">{formError}</Callout>}
            <section className="cs-stack" style={{ gap: 12 }}>
              <div><h3 className="cs-section-title">Dados da conta</h3><p className="cs-section-sub">Informações usadas para identificar o usuário no sistema.</p></div>
              <div className="cs-formgrid">
                <TextField label="Nome completo" value={form.name} placeholder="João Silva" data-autofocus autoComplete="name" required disabled={saving}
                  onChange={event => setForm(current => ({ ...current, name:event.target.value }))} />
                <TextField label="E-mail" type="email" value={form.email} readOnly={!!editUser} placeholder="joao@consaude.com.br" autoComplete="email" required disabled={saving}
                  help={editUser ? 'O e-mail identifica a conta e não pode ser alterado.' : 'O convite ou a redefinição de senha será enviado para este endereço.'}
                  onChange={event => setForm(current => ({ ...current, email:event.target.value }))} />
                <TextField className="cs-full" label="Cargo / Função" value={form.cargo} placeholder="Ex.: Analista de Faturamento" autoComplete="organization-title" disabled={saving}
                  onChange={event => setForm(current => ({ ...current, cargo:event.target.value }))} />
              </div>
            </section>
            <hr className="cs-divider" />
            <section className="cs-stack" style={{ gap: 12 }}>
              <div><h3 className="cs-section-title">Perfil de acesso</h3><p className="cs-section-sub">Defina quais áreas e registros esta conta poderá acessar.</p></div>
              <div className="cs-choices" role="radiogroup" aria-label="Perfil de acesso">
                <Choice value="user" current={form.role} title="Usuário" text="Executa auditorias e consulta os próprios registros." disabled={saving} onSelect={(v) => setForm(c => ({ ...c, role: v }))} />
                <Choice value="admin" current={form.role} title="Administrador" text="Gerencia usuários e visualiza todos os registros." disabled={saving} onSelect={(v) => setForm(c => ({ ...c, role: v }))} />
              </div>
              {form.role === 'admin' && <Callout tone="warning">Administradores podem alterar acessos e consultar dados de todos os usuários.</Callout>}
            </section>
            {!editUser && (
              <>
                <hr className="cs-divider" />
                <section className="cs-stack" style={{ gap: 12 }}>
                  <div><h3 className="cs-section-title">Primeiro acesso</h3><p className="cs-section-sub">Escolha como o usuário definirá a senha inicial.</p></div>
                  <div className="cs-choices" role="radiogroup" aria-label="Forma de primeiro acesso">
                    <Choice value="convite" current={form.modo} title="Convite por e-mail" text="O usuário recebe um link e cria a própria senha." disabled={saving} onSelect={(v) => setForm(c => ({ ...c, modo: v }))} />
                    <Choice value="temporaria" current={form.modo} title="Senha temporária" text="Você define uma senha que será trocada no primeiro acesso." disabled={saving} onSelect={(v) => setForm(c => ({ ...c, modo: v }))} />
                  </div>
                  {form.modo === 'temporaria' && (
                    <div className="cs-stack" style={{ gap: 8 }}>
                      <TextField label="Senha temporária" type={showPassword ? 'text' : 'password'} value={form.password} placeholder="Mínimo de 8 caracteres"
                        autoComplete="new-password" minLength={8} required disabled={saving} help="Use ao menos 8 caracteres e envie a senha por um canal seguro."
                        onChange={event => setForm(current => ({ ...current, password:event.target.value }))} />
                      <Checkbox label="Mostrar senha" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} disabled={saving} />
                    </div>
                  )}
                </section>
              </>
            )}
          </form>
        </Modal>
      )}

      {resetId && (
        <Modal icon={resetDone ? 'circle-check' : 'key-round'} title={resetDone ? 'Link enviado' : 'Redefinir senha'}
          description={resetDone ? 'A solicitação foi processada com sucesso.' : 'O usuário definirá uma nova senha por um link seguro.'}
          onClose={closeReset} dismissible={!resetSending}
          footer={resetDone
            ? <Button variant="primary" onClick={closeReset} data-autofocus>Concluir</Button>
            : <>
              <Button variant="secondary" onClick={closeReset} disabled={resetSending}>Cancelar</Button>
              <Button variant="primary" icon={resetSending ? undefined : 'mail'} onClick={doReset} loading={resetSending}>{resetSending ? 'Enviando…' : 'Enviar link'}</Button>
            </>}>
          {resetDone ? (
            <Callout tone="success">Enviamos as instruções para <b style={{ overflowWrap: 'anywhere' }}>{resetTarget?.email}</b>.</Callout>
          ) : (
            <div className="cs-stack" style={{ gap: 12 }}>
              <div className="cs-sum"><span className="cs-sum__label">Destinatário</span><span className="cs-sum__value" style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{resetTarget?.email}</span></div>
              {resetErr && <Callout tone="danger">{resetErr}</Callout>}
            </div>
          )}
        </Modal>
      )}

      {confirmDel && (
        <Modal icon="user-x" tone="danger" title="Desativar usuário?" description="Esta ação bloqueia o acesso imediatamente."
          onClose={() => { if (!actionId) setConfirmDel(null); }} dismissible={!actionId}
          footer={<>
            <Button variant="secondary" onClick={() => setConfirmDel(null)} disabled={!!actionId} data-autofocus>Cancelar</Button>
            <Button variant="danger" icon={actionId ? undefined : 'user-x'} onClick={() => toggleAtivo(confirmDel, true)} loading={!!actionId}>{actionId ? 'Desativando…' : 'Desativar acesso'}</Button>
          </>}>
          <div className="cs-stack" style={{ gap: 12 }}>
            <div className="cs-cell-person">
              <Avatar name={displayName(confirmDel)} src={confirmDel.photo || undefined} size="lg" />
              <span className="cs-cell-main" style={{ minWidth: 0 }}>
                <span className="cs-cell-main__title">{displayName(confirmDel)}</span>
                <span className="cs-cell-main__sub" style={{ overflowWrap: 'anywhere' }}>{confirmDel.email}</span>
              </span>
            </div>
            <Callout tone="warning">As auditorias e o histórico desta conta serão preservados. O acesso poderá ser reativado depois.</Callout>
          </div>
        </Modal>
      )}
    </>
  );
}
