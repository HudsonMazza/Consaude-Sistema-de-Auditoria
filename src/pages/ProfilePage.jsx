// Meu perfil — mesma lógica do ProfilePage anterior (foto, dados pessoais e senha via src/auth.js).
import React, { useRef, useState } from 'react';
import * as authApi from '../auth';
import { lerFotoRedimensionada } from '../lib/photo.js';
import { Button, Card, Avatar, IconButton, Spinner, ProfileBadge, StatusBadge, TextField, Checkbox, Callout, PageHeader } from '../components/ds/index.js';
import { useToast } from '../components/Toaster.jsx';

export default function ProfilePage({ currentUser, onUpdateUser, deps = authApi }) {
  const { atualizarUsuario, atualizarFotoPerfil, alterarPropriaSenha, mensagemDeErro } = deps;
  const toast = useToast();
  const [form,     setForm]     = useState({ name:currentUser.name, cargo:currentUser.cargo||'' });
  const [pwdForm,  setPwdForm]  = useState({ current:'', newPwd:'', confirm:'' });
  const [pwdErr,   setPwdErr]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [profErr, setProfErr] = useState('');
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoErr,    setPhotoErr]    = useState('');
  const fileRef = useRef(null);

  const escolherFoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';   // permite reescolher o mesmo arquivo depois
    if (!file) return;
    setPhotoErr('');
    if (file.size > 8 * 1024 * 1024) { setPhotoErr('Imagem muito grande. Use um arquivo de até 8 MB.'); return; }
    setPhotoSaving(true);
    try {
      const photo = await lerFotoRedimensionada(file);
      await atualizarFotoPerfil(currentUser.id, photo);
      onUpdateUser({ ...currentUser, photo });
    } catch (err) {
      setPhotoErr(err?.message || mensagemDeErro(err));
    } finally {
      setPhotoSaving(false);
    }
  };

  const removerFoto = async () => {
    setPhotoErr('');
    setPhotoSaving(true);
    try {
      await atualizarFotoPerfil(currentUser.id, null);
      onUpdateUser({ ...currentUser, photo: null });
    } catch (err) {
      setPhotoErr(mensagemDeErro(err));
    } finally {
      setPhotoSaving(false);
    }
  };

  const saveProfile = async (event) => {
    event?.preventDefault();
    setProfErr('');
    if (!form.name.trim()) {
      setProfErr('Informe seu nome completo.');
      return;
    }
    setProfileSaving(true);
    try {
      // As Security Rules permitem que o usuário altere apenas nome e cargo do
      // próprio documento — nunca o papel nem o status de ativação.
      const normalized = { name:form.name.trim(), cargo:form.cargo.trim() };
      await atualizarUsuario(currentUser.id, { nome:normalized.name, cargo:normalized.cargo, role:currentUser.role });
      setForm(normalized);
      onUpdateUser({ ...currentUser, ...normalized });
      toast({ tone: 'success', title: 'Informações atualizadas.' });
    } catch (err) {
      setProfErr(mensagemDeErro(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const savePwd = async (event) => {
    event?.preventDefault();
    setPwdErr('');
    if (!pwdForm.current)                   { setPwdErr('Informe a senha atual.'); return; }
    if (pwdForm.newPwd.length < 8)          { setPwdErr('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdErr('As senhas não coincidem.'); return; }
    setSaving(true);
    try {
      // Reautentica com a senha atual e troca pelo Firebase Auth.
      await alterarPropriaSenha(pwdForm.current, pwdForm.newPwd);
      setPwdForm({ current:'', newPwd:'', confirm:'' });
      toast({ tone: 'success', title: 'Senha alterada com sucesso.' });
    } catch (err) {
      setPwdErr(mensagemDeErro(err));
    } finally {
      setSaving(false);
    }
  };

  const name = currentUser.name || currentUser.email || 'Usuário';
  const pwdType = showPasswords ? 'text' : 'password';

  return (
    <>
      <PageHeader title="Meu perfil" subtitle="Atualize seus dados pessoais e as credenciais da conta." />
      <div className="cs-grid">
        <Card className="cs-span-4 cs-md-12">
          <div className="cs-identity">
            <div className="cs-identity__photo">
              <Avatar name={name} src={currentUser.photo || undefined} size="xl" />
              {photoSaving && <span className="cs-identity__busy" role="status"><Spinner /><span className="cs-sr">Salvando foto</span></span>}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="cs-identity__name">{currentUser.name}</p>
              <p className="cs-identity__email">{currentUser.email}</p>
              {currentUser.cargo && <p className="cs-identity__email">{currentUser.cargo}</p>}
            </div>
            <div className="cs-row" style={{ justifyContent: 'center' }}>
              <ProfileBadge profile={currentUser.role === 'admin' ? 'admin' : 'user'}>{currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}</ProfileBadge>
              <StatusBadge status="ativo">Conta ativa</StatusBadge>
            </div>
            <div className="cs-row" style={{ justifyContent: 'center', width: '100%' }}>
              <Button variant="secondary" size="sm" icon="camera" onClick={() => fileRef.current?.click()} disabled={photoSaving}>Alterar foto</Button>
              {currentUser.photo && !photoSaving && <Button variant="ghost" size="sm" icon="trash-2" onClick={removerFoto}>Remover foto</Button>}
              <input ref={fileRef} type="file" accept="image/*" onChange={escolherFoto} hidden tabIndex={-1} />
            </div>
            {photoErr && <Callout tone="danger">{photoErr}</Callout>}
          </div>
        </Card>

        <div className="cs-span-8 cs-md-12 cs-stack" style={{ gap: 24 }}>
          <Card as="form" onSubmit={saveProfile} title="Informações pessoais" subtitle="Nome e função exibidos no sistema e nos registros." icon="user"
            footer={<Button variant="primary" type="submit" loading={profileSaving}>{profileSaving ? 'Salvando…' : 'Salvar alterações'}</Button>}>
            <div className="cs-stack">
              {profErr && <Callout tone="danger">{profErr}</Callout>}
              <div className="cs-formgrid">
                <TextField label="Nome completo" value={form.name} autoComplete="name" required disabled={profileSaving}
                  onChange={event => setForm(current=>({...current,name:event.target.value}))} />
                <TextField label="Cargo / Função" value={form.cargo} placeholder="Ex.: Analista de Faturamento" autoComplete="organization-title" disabled={profileSaving}
                  onChange={event => setForm(current=>({...current,cargo:event.target.value}))} />
                <TextField className="cs-full" label="E-mail" type="email" value={currentUser.email} readOnly prefixIcon="mail" help="O e-mail identifica a conta e não pode ser alterado." />
              </div>
            </div>
          </Card>

          <Card as="form" onSubmit={savePwd} title="Segurança da conta" subtitle="A senha nova deve ter pelo menos 8 caracteres." icon="key-round"
            footer={<Button variant="primary" type="submit" loading={saving}>{saving ? 'Alterando…' : 'Alterar senha'}</Button>}>
            <div className="cs-stack">
              {pwdErr && <Callout tone="danger">{pwdErr}</Callout>}
              <div className="cs-formgrid">
                <TextField className="cs-full" label="Senha atual" type={pwdType} value={pwdForm.current} placeholder="Sua senha atual" autoComplete="current-password" disabled={saving}
                  onChange={event => setPwdForm(current=>({...current,current:event.target.value}))} />
                <TextField label="Nova senha" type={pwdType} value={pwdForm.newPwd} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" minLength={8} disabled={saving}
                  onChange={event => setPwdForm(current=>({...current,newPwd:event.target.value}))} />
                <TextField label="Confirmar nova senha" type={pwdType} value={pwdForm.confirm} placeholder="Repita a nova senha" autoComplete="new-password" minLength={8} disabled={saving}
                  onChange={event => setPwdForm(current=>({...current,confirm:event.target.value}))} />
              </div>
              <Checkbox label="Mostrar senhas" checked={showPasswords} onChange={event => setShowPasswords(event.target.checked)} disabled={saving} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
