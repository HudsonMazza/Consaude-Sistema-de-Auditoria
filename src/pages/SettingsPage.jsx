// Configurações — preferências salvas só neste navegador:
// tema (cs-theme, src/lib/theme.js) e preferências de auditoria/exportação (cs_audit_cfg, src/lib/preferences.js).
// O sistema atende uma única clínica, então não há mais "Identificação da clínica".
import React, { useEffect, useState } from 'react';
import { getPreferences, savePreferences, MAX_TOLERANCE } from '../lib/preferences.js';
import { getThemePreference, setThemePreference, onThemeChange } from '../lib/theme.js';
import {
  Button, Card, SettingsSection, TextField, CurrencyField, SegmentedControl, Checkbox, Callout, ActionBar, PageHeader,
  formatBRL, titleCase,
} from '../components/ds/index.js';
import { useToast } from '../components/Toaster.jsx';

function SegmentedField({ label, help, ...props }) {
  return (
    <div className="cs-field">
      <span className="cs-field__label" aria-hidden="true">{label}</span>
      <SegmentedControl label={label} block {...props} />
      {help && <span className="cs-field__help">{help}</span>}
    </div>
  );
}

export default function SettingsPage({ currentUser }) {
  const toast = useToast();
  const [prefs, setPrefs] = useState(getPreferences);
  const [theme, setThemeField] = useState(getThemePreference);
  const [themeTouched, setThemeTouched] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  // O tema também pode ser trocado pelo menu da conta: mantém o campo em dia se ele não foi alterado aqui.
  useEffect(() => onThemeChange(() => { if (!themeTouched) setThemeField(getThemePreference()); }), [themeTouched]);

  const update = (fn) => { setPrefs((current) => fn(current)); setDirty(true); };
  const setTop = (key) => (value) => update((p) => ({ ...p, [key]: value }));
  const setNested = (group, key) => (value) => update((p) => ({ ...p, [group]: { ...p[group], [key]: value } }));
  const toggle = (group, key) => () => update((p) => ({ ...p, [group]: { ...p[group], [key]: !p[group][key] } }));

  const save = (event) => {
    event?.preventDefault();
    setError('');
    const tolerance = Number(prefs.tolerancia);
    if (!Number.isFinite(tolerance) || tolerance < 0) {
      setError('Informe uma tolerância válida, igual ou maior que zero.');
      return;
    }
    if (tolerance > MAX_TOLERANCE) {
      setError(`A tolerância pode ser de no máximo ${formatBRL(MAX_TOLERANCE)}.`);
      return;
    }
    try {
      const saved = savePreferences(prefs);
      setThemePreference(theme);
      setPrefs(saved);
      setThemeTouched(false);
      setDirty(false);
      toast({ tone: 'success', title: 'Configurações salvas neste navegador.' });
    } catch {
      setError('Não foi possível salvar as configurações neste navegador.');
    }
  };

  const userName = currentUser?.name ? titleCase(currentUser.name) : '';
  const tol = formatBRL(Number(prefs.tolerancia) || 0);

  return (
    <>
      <PageHeader title="Configurações" subtitle="Aparência, padrões de auditoria e exportação. Tudo fica salvo neste navegador." />
      {error && <Callout tone="danger" title="Não foi possível salvar">{error}</Callout>}
      <form id="settings-form" onSubmit={save} noValidate>
        <Card>
          <SettingsSection title="Aparência" description="Tema da interface neste navegador.">
            <SegmentedField label="Tema" value={theme}
              help="Automático acompanha o tema claro ou escuro do sistema."
              onChange={(v) => { setThemeField(v); setThemeTouched(true); setDirty(true); }}
              options={[{ id: 'dark', label: 'Escuro', icon: 'moon' }, { id: 'light', label: 'Claro', icon: 'sun' }, { id: 'system', label: 'Automático', icon: 'monitor' }]} />
          </SettingsSection>

          <SettingsSection title="Preferências de auditoria" description="Valores usados como padrão ao processar e exportar auditorias.">
            <CurrencyField label="Tolerância de divergência" value={Number(prefs.tolerancia) || 0}
              help="Médicos com diferença total abaixo deste valor não entram como divergência. Vale só para novas auditorias."
              onChange={setTop('tolerancia')} />
            <SegmentedField label="Formato padrão de exportação" value={prefs.formato}
              help="Usado pelo botão Exportar do relatório."
              onChange={setTop('formato')}
              options={[{ id: 'PDF', label: 'PDF', icon: 'file-text' }, { id: 'XLSX', label: 'Excel (.xlsx)', icon: 'file-spreadsheet' }]} />
          </SettingsSection>

          <SettingsSection title="Padrões da nova auditoria" description="Opções de comparação que já vêm marcadas em Nova auditoria. Você ainda pode mudá-las em cada auditoria.">
            <div className="cs-full cs-stack" style={{ gap: 16 }}>
              <Checkbox label="Ignorar diferenças abaixo da tolerância" checked={prefs.novaAuditoria.ignorar} onChange={toggle('novaAuditoria', 'ignorar')}
                description={`Com a tolerância atual, médicos com diferença menor que ${tol} não entram no relatório.`} />
              <Checkbox label="Comparar pacientes pelo nome" checked={prefs.novaAuditoria.comparaNome} onChange={toggle('novaAuditoria', 'comparaNome')}
                description="Detalha cada médico com divergência paciente a paciente." />
              <Checkbox label="Gerar análise inteligente" checked={prefs.novaAuditoria.ia} onChange={toggle('novaAuditoria', 'ia')}
                description="Cria os pontos de atenção exibidos no relatório." />
            </div>
          </SettingsSection>

          <SettingsSection title="Exportação" description="O que entra nos arquivos PDF e Excel exportados.">
            <div className="cs-full cs-stack" style={{ gap: 16 }}>
              <Checkbox label="Incluir detalhamento por paciente no PDF" checked={prefs.exportacao.detalhePacientes} onChange={toggle('exportacao', 'detalhePacientes')}
                description="Adiciona ao PDF uma tabela de itens por paciente para cada médico. O Excel sempre traz todos os itens." />
              <Checkbox label="Incluir análise inteligente" checked={prefs.exportacao.insights} onChange={toggle('exportacao', 'insights')}
                description="Leva os pontos de atenção da auditoria para o PDF e para o Excel." />
            </div>
            <TextField className="cs-full" label="Nome do responsável no relatório" optional prefixIcon="user" maxLength={120}
              value={prefs.exportacao.responsavel} placeholder={userName || 'Nome de quem está logado'}
              help={userName ? `Em branco, usa o nome de quem está logado (${userName}).` : 'Em branco, usa o nome de quem está logado.'}
              onChange={(event) => setNested('exportacao', 'responsavel')(event.target.value)} />
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
