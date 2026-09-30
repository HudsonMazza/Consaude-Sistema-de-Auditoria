import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  query, where, orderBy, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { parseBRDateTime } from "./dashboard.js";

/** O Firestore recusa campos `undefined`: remove-os (itens legados às vezes não têm todos os campos). */
function semIndefinidos(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// ─── HISTÓRICO DE AUDITORIAS (Firestore) ──────────────────────────────────────
//
// Substitui o antigo histórico em localStorage: cada auditoria vira um
// documento em `audits`, protegido por Security Rules — admins veem tudo,
// usuários comuns só veem as próprias (a Security Rule de leitura obriga a
// consulta a já vir filtrada por userId para não-admins, senão o Firestore
// recusa a query inteira).

const AUDITS_COL = "audits";
const TAMANHO_MAX_BYTES = 900_000; // margem sob o limite de 1 MiB/doc do Firestore

function tamanhoBytes(valor) {
  return new Blob([JSON.stringify(valor)]).size;
}

/** Observa o histórico em tempo real. Retorna a função de cancelamento. */
export function observarHistorico(currentUser, onData, onError) {
  if (!currentUser) return () => {};
  const base = collection(db, AUDITS_COL);
  const q = currentUser.role === "admin"
    ? query(base, orderBy("createdAt", "desc"))
    : query(base, where("userId", "==", currentUser.id), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError?.(err)
  );
}

/**
 * Salva uma nova auditoria. Retorna o id do documento (string) ou `null` se o
 * payload estourar o orçamento de tamanho (o resultado continua disponível na
 * tela, só não é persistido no histórico compartilhado).
 */
export async function salvarAuditoria(entry, criadoPor) {
  if (tamanhoBytes(entry) > TAMANHO_MAX_BYTES) return null;
  const ref = await addDoc(collection(db, AUDITS_COL), {
    ...entry,
    userId: criadoPor.id,
    userName: criadoPor.name,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Anexa o relatório de IA gerado a uma auditoria já salva. Não lança se o
 * payload combinado estourar o orçamento — retorna `false` nesse caso, para o
 * chamador decidir como avisar o usuário sem interromper o relatório já aberto.
 */
export async function salvarRelatorioIA(auditId, resultadosAtuais, html) {
  if (!auditId) return false;
  if (tamanhoBytes(resultadosAtuais) + tamanhoBytes(html) > TAMANHO_MAX_BYTES) return false;
  await updateDoc(doc(db, AUDITS_COL, auditId), { aiReportHTML: html });
  return true;
}

const STATUS_VALIDOS = new Set(["pendente", "revisado", "corrigido"]);

/**
 * Salva os status de revisão (Pendente/Revisado/Corrigido) na auditoria, para valerem
 * ao reabrir e nas exportações pelo histórico. Precisa da regra do Firestore que permite
 * o campo `statuses` (firestore.rules); sem ela o Firestore recusa com permission-denied.
 */
export function salvarStatuses(auditId, statuses) {
  const limpo = {};
  Object.entries(statuses || {}).slice(0, 5000).forEach(([k, v]) => {
    if (STATUS_VALIDOS.has(v) && v !== "pendente") limpo[String(k).slice(0, 200)] = v;
  });
  return updateDoc(doc(db, AUDITS_COL, auditId), { statuses: limpo });
}

export function excluirAuditoria(auditId) {
  return deleteDoc(doc(db, AUDITS_COL, auditId));
}

// ─── MIGRAÇÃO DO HISTÓRICO LOCAL (uma vez, best-effort) ───────────────────────

const CHAVE_LOCAL = "audit-hist";
const CHAVE_MIGRADOS = "audit-hist-migrated-ids";
const CHAVE_IGNORADOS = "audit-hist-skipped-ids";

/**
 * Migra entradas do antigo `localStorage["audit-hist"]` para o Firestore.
 * Idempotente e segura para rodar a cada login: cada entrada legada só é
 * tentada uma vez com sucesso (marcada em CHAVE_MIGRADOS) ou uma vez por
 * tamanho (marcada em CHAVE_IGNORADOS, nunca mais retentada). Entradas
 * atribuídas a outro usuário só migram se quem estiver logado for admin — a
 * própria Security Rule recusaria a tentativa de um usuário comum. Nunca
 * apaga o `audit-hist` original (fica como backup inerte).
 */
export async function migrarHistoricoLocal(currentUser) {
  let entries;
  try { entries = JSON.parse(localStorage.getItem(CHAVE_LOCAL) || "[]"); } catch { return; }
  if (!Array.isArray(entries) || entries.length === 0) return;

  const lerSet = (chave) => {
    try { return new Set(JSON.parse(localStorage.getItem(chave) || "[]")); }
    catch { return new Set(); }
  };
  const migrados  = lerSet(CHAVE_MIGRADOS);
  const ignorados = lerSet(CHAVE_IGNORADOS);
  const isAdmin = currentUser.role === "admin";

  const pendentes = entries.filter((e) => e?.id && !migrados.has(e.id) && !ignorados.has(e.id));
  if (pendentes.length === 0) return;

  const tentativas = await Promise.allSettled(pendentes.map(async (e) => {
    const userId = e.userId || currentUser.id;
    if (userId !== currentUser.id && !isAdmin) throw { skip: "sem-permissao", id: e.id };
    const payload = {
      data: e.data, periodo: e.periodo, arquivos: e.arquivos,
      divergencias: e.divergencias, valor: e.valor, resultados: e.resultados,
      ...(e.aiReportHTML ? { aiReportHTML: e.aiReportHTML } : {}),
    };
    if (tamanhoBytes(payload) > TAMANHO_MAX_BYTES) throw { skip: "tamanho", id: e.id };
    // Mantém a data original da auditoria (senão ela cairia no dia da migração no histórico e no dashboard)
    const original = parseBRDateTime(e.resultados?.processadoEm) || parseBRDateTime(e.data);
    await addDoc(collection(db, AUDITS_COL), {
      ...semIndefinidos(payload), userId, userName: e.userName || currentUser.name,
      createdAt: original ? Timestamp.fromDate(original) : serverTimestamp(), migradoDoNavegador: true,
    });
    return e.id;
  }));

  const novosMigrados = [];
  const novosIgnorados = [];
  tentativas.forEach((r, i) => {
    if (r.status === "fulfilled") novosMigrados.push(r.value);
    else if (r.reason?.skip === "tamanho") novosIgnorados.push(pendentes[i].id);
    // skip "sem-permissao" (ou qualquer outro erro, ex.: rede) fica de fora de
    // ambos os conjuntos e é retentado no próximo login.
  });
  if (novosMigrados.length)  localStorage.setItem(CHAVE_MIGRADOS,  JSON.stringify([...migrados, ...novosMigrados]));
  if (novosIgnorados.length) localStorage.setItem(CHAVE_IGNORADOS, JSON.stringify([...ignorados, ...novosIgnorados]));
}
