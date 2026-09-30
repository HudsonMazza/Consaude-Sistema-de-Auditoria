// Casca do app autenticado: navegação (com as mesmas permissões de antes), conta e tema.
import React from 'react';
import { AppShell } from './ds/index.js';

/** Itens de navegação por papel. "Usuários" continua só para administradores; Configurações e Perfil para todos. */
export function getNav(role) {
  const isAdmin = role === 'admin';
  return [
    { group: 'Menu principal' },
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', short: 'Início' },
    { id: 'audits', label: 'Auditorias', icon: 'clipboard-check', short: 'Auditorias' },
    { group: isAdmin ? 'Administração' : 'Conta' },
    ...(isAdmin ? [{ id: 'users', label: 'Usuários', icon: 'users', short: 'Usuários' }] : []),
    { id: 'settings-page', label: 'Configurações', icon: 'settings', short: 'Ajustes' },
    { id: 'profile', label: 'Meu perfil', icon: 'user', short: 'Perfil', sidebar: false }, // acessado pelo menu da conta; na bottom nav só para quem não vê Usuários
  ];
}

/** Destinos da bottom nav (4 + "Nova" no centro). Sem permissão de Usuários, o slot vira "Perfil". */
export function getBottomNav(role) {
  return role === 'admin' ? ['dashboard', 'audits', 'users', 'settings-page'] : ['dashboard', 'audits', 'profile', 'settings-page'];
}

export const roleLabel = (role) => (role === 'admin' ? 'Administrador' : 'Usuário');

/**
 * AppLayout — AppShell com a navegação do ConSaúde.
 * active: id da página ativa na navegação; onNavigate(id); onNewAudit(); onLogout(); crumbs; title; back.
 */
export default function AppLayout({ user, active, onNavigate, onNewAudit, onLogout, crumbs, title, back, children }) {
  const accountItems = [
    { label: 'Meu perfil', icon: 'user', onSelect: () => onNavigate('profile') },
    { label: 'Configurações', icon: 'settings', onSelect: () => onNavigate('settings-page') },
    { themeToggle: true },
    { separator: true },
    { label: 'Sair', icon: 'log-out', variant: 'danger', onSelect: onLogout },
  ];
  return (
    <AppShell
      active={active}
      onNavigate={onNavigate}
      onBrand={() => onNavigate('dashboard')}
      nav={getNav(user?.role)}
      bottomNav={getBottomNav(user?.role)}
      crumbs={crumbs}
      title={title}
      back={back}
      onNewAudit={onNewAudit}
      user={{ name: user?.name, email: user?.email, photo: user?.photo, roleLabel: roleLabel(user?.role) }}
      accountItems={accountItems}
    >
      {children}
    </AppShell>
  );
}
