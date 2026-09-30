// Configurações — mesma lógica e armazenamento de antes (localStorage: cs_clinic e cs_audit_cfg).
import React, { useState } from 'react';
import { getClinicSettings, saveClinicSettings } from '../lib/clinicSettings.js';
import { Button, Card, SettingsSection, TextField, MaskedField, SegmentedControl, Callout, ActionBar, PageHeader } from '../components/ds/index.js';
import { useToast } from '../components/Toaster.jsx';

export default function SettingsPage() {
  const toast = useToast();
  const [clinic, setClinic] = useState(getClinicSettings);
  const [audit,  setAudit]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_audit_cfg')||'null') || { tolerancia:'0,01', formato:'PDF' }; }
    catch { return { tolerancia:'0,01', formato:'PDF' }; }
  });
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  const save = (event) => {
    event?.preventDefault();
    setError('');
    const normalizedClinic = {
      name: clinic.name.trim(),
      cnpj: clinic.cnpj.trim(),
      email: clinic.email.trim(),
    };
    if (!normalizedClinic.name) {
      setError('Informe o nome da clínica.');
      return;
    }
    if (normalizedClinic.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedClinic.email)) {
      setError('Informe um e-mail de relatórios válido.');
      return;
    }
    const toleranceValue = Number(String(audit.tolerancia).replace(',', '.'));
    if (!Number.isFinite(toleranceValue) || toleranceValue < 0) {
      setError('Informe uma tolerância válida, igual ou maior que zero.');
      return;
    }
    try {
      saveClinicSettings(normalizedClinic);
      localStorage.setItem('cs_audit_cfg', JSON.stringify(audit));
      setClinic(normalizedClinic);
      setDirty(false);
      toast({ tone: 'success', title: 'Configurações salvas neste navegador.' });
    } catch {
      setError('Não foi possível salvar as configurações neste navegador.');
    }
  };

  const setC = (key) => (event) => { const v = event?.target ? event.target.value : event; setClinic(current => ({ ...current, [key]: v })); setDirty(true); };

  return (
    <>
      <PageHeader title="Configurações" subtitle="Dados usados nos relatórios e preferências padrão de auditoria." />
      {error && <Callout tone="danger" title="Não foi possível salvar">{error}</Callout>}
      <form id="settings-form" onSubmit={save} noValidate>
        <Card>
          <SettingsSection title="Identificação da clínica" description="Dados exibidos nos relatórios exportados.">
            <TextField className="cs-full" label="Nome da clínica" value={clinic.name} placeholder="ConSaúde" required prefixIcon="building-2" onChange={setC('name')} />
            <MaskedField mask="cnpj" label="CNPJ" optional value={clinic.cnpj} placeholder="00.000.000/0001-00" help="Formato 00.000.000/0001-00." onChange={setC('cnpj')} />
            <TextField label="E-mail de relatórios" optional type="email" value={clinic.email} placeholder="relatorios@consaude.com.br" autoComplete="email" prefixIcon="mail" onChange={setC('email')} />
          </SettingsSection>
          <SettingsSection title="Preferências de auditoria" description="Valores usados como padrão em novos relatórios.">
            <TextField label="Tolerância de divergência" prefix="R$" numeric value={audit.tolerancia} placeholder="0,01" inputMode="decimal"
              help="Diferenças abaixo deste valor podem ser ignoradas."
              onChange={event => { setAudit(current => ({ ...current, tolerancia:event.target.value })); setDirty(true); }} />
            <div className="cs-field">
              <span className="cs-field__label" aria-hidden="true">Formato padrão de exportação</span>
              <SegmentedControl label="Formato padrão de exportação" block value={audit.formato}
                onChange={(v) => { setAudit(current => ({ ...current, formato:v })); setDirty(true); }}
                options={[{ id: 'PDF', label: 'PDF', icon: 'file-text' }, { id: 'XLSX', label: 'Excel (.xlsx)', icon: 'file-spreadsheet' }]} />
            </div>
            <div className="cs-full"><Callout tone="neutral" icon="info">Estas preferências ficam armazenadas somente neste navegador.</Callout></div>
          </SettingsSection>
        </Card>
      </form>
      <ActionBar icon={dirty ? 'circle-alert' : 'info'} message={dirty ? 'Você tem alterações não salvas.' : 'As configurações ficam salvas somente neste navegador.'}>
        <Button variant="primary" icon="check" type="submit" form="settings-form">Salvar configurações</Button>
      </ActionBar>
    </>
  );
}
