// Processando auditoria — mesmas 6 etapas e progresso reais do processamento.
import React from 'react';
import { Card, ProgressBar, Icon, Spinner, PageHeader } from '../components/ds/index.js';

const LABELS = [
  'Arquivos carregados',
  'Colunas identificadas',
  'Comparação por médico',
  'Divergências mapeadas',
  'Relatório gerado',
  'Insights calculados',
];

export default function ProcessingPage({ steps, progress }) {
  const completedSteps = steps.filter(Boolean).length;
  const activeStep = Math.min(completedSteps, LABELS.length - 1);
  return (
    <>
      <PageHeader title="Processando auditoria" subtitle="Cruzando Produção × Repasse. Não feche esta página." />
      <Card style={{ maxWidth: 720, width: '100%' }} aria-busy="true">
        <div className="cs-stack" style={{ gap: 20 }}>
          <div className="cs-row" style={{ gap: 12, flexWrap: 'nowrap' }}>
            <span className="cs-kpi__icon cs-kpi__icon--accent" aria-hidden="true"><Spinner /></span>
            <div style={{ minWidth: 0 }}>
              <p className="cs-section-title">Etapa {activeStep + 1} de {LABELS.length}</p>
              <p className="cs-section-sub" aria-live="polite"><span className="cs-shimmer">{LABELS[activeStep]}…</span></p>
            </div>
          </div>
          <ProgressBar label="Progresso da auditoria" value={Math.round(progress)} />
          <ol className="cs-steps cs-steps--process">
            {LABELS.map((label, index) => {
              const completed = steps[index];
              const active = !completed && index === activeStep;
              return (
                <li key={label} className={`cs-step ${completed ? 'cs-step--done' : active ? 'cs-step--active' : ''}`} aria-current={active ? 'step' : undefined}>
                  <span className="cs-step__mark" style={!completed && !active ? { fontSize: 12 } : undefined}>
                    {completed ? <Icon name="check" strokeWidth={2.4} /> : active ? <Spinner /> : index + 1}
                  </span>
                  <span className={active ? 'cs-shimmer' : undefined}>{label}</span>
                  {completed && <span className="cs-step__end">Concluído</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </Card>
    </>
  );
}
