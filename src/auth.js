import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { auth, db, withSecondaryAuth } from "./firebase";

// ─── ERROS ────────────────────────────────────────────────────────────────────

const MENSAGENS = {
  "auth/invalid-credential":       "E-mail ou senha incorretos.",
  "auth/invalid-login-credentials":"E-mail ou senha incorretos.",
  "auth/user-not-found":           "E-mail ou senha incorretos.",
  "auth/wrong-password":           "E-mail ou senha incorretos.",
  "auth/invalid-email":            "E-mail inválido.",
  "auth/user-disabled":            "Esta conta foi desativada.",
  "auth/too-many-requests":        "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "auth/network-request-failed":   "Falha de conexão. Verifique sua internet.",
  "auth/email-already-in-use":     "Este e-mail já está cadastrado.",
  "auth/weak-password":            "A senha deve ter pelo menos 6 caracteres.",
  "auth/requires-recent-login":    "Por segurança, faça login novamente antes de alterar a senha.",
  "permission-denied":             "Você não tem permissão para esta operação.",
  "unavailable":                   "Firestore indisponível. Verifique se o banco de dados foi criado no Console.",
};

export function mensagemDeErro(err) {
  const code = err?.code || "";
  if (MENSAGENS[code]) return MENSAGENS[code];
  // Erros de configuração têm sufixos variáveis no código — casam por prefixo.
  if (code.startsWith("auth/api-key-not-valid") || code === "auth/invalid-api-key") {
    return "Configuração do Firebase inválida. Confira as variáveis VITE_FIREBASE_* no .env.";
  }
  if (code.startsWith("auth/configuration-not-found")) {
    return "Login por e-mail/senha não está habilitado no Console do Firebase.";
  }
  return "Ocorreu um erro. Tente novamente.";
}

// Falha de login não deve revelar se o e-mail existe — todas as variantes de
// credencial inválida retornam a mesma mensagem acima.

// ─── PERFIL (Firestore) ───────────────────────────────────────────────────────

// O perfil é a fonte da verdade do papel (admin/user). Ele vive no Firestore e
// é protegido por Security Rules: o próprio usuário não consegue alterar seu
// `role` nem seu `disabled`, só um admin consegue.
async function carregarPerfil(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Observa a sessão do Firebase Auth e resolve o perfil correspondente.
 * Chama cb(null) quando não há sessão válida.
 */
export function observarSessao(cb) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) return cb(null);
    try {
      const perfil = await carregarPerfil(fbUser.uid);
      if (!perfil || perfil.disabled === true) {
        await signOut(auth);
        return cb(null);
      }
      cb({ ...perfil, uid: fbUser.uid, email: fbUser.email });
    } catch {
      await signOut(auth);
      cb(null);
    }
  });
}

// ─── LOGIN / LOGOUT ───────────────────────────────────────────────────────────

export async function login(email, senha, lembrar) {
  await setPersistence(auth, lembrar ? browserLocalPersistence : browserSessionPersistence);
  const cred = await signInWithEmailAndPassword(auth, email.trim(), senha);

  const perfil = await carregarPerfil(cred.user.uid);
  if (!perfil) {
    await signOut(auth);
    throw Object.assign(new Error("sem perfil"), {
      code: "app/no-profile",
      mensagem: "Conta sem perfil de acesso. Contate o administrador.",
    });
  }
  if (perfil.disabled === true) {
    await signOut(auth);
    throw Object.assign(new Error("desativado"), { code: "auth/user-disabled" });
  }
  return { ...perfil, uid: cred.user.uid, email: cred.user.email };
}

export function logout() {
  return signOut(auth);
}

// ─── SENHA ────────────────────────────────────────────────────────────────────

export function enviarResetDeSenha(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

/** Troca a senha do usuário logado. Exige a senha atual (reautenticação). */
export async function alterarPropriaSenha(senhaAtual, senhaNova) {
  const user = auth.currentUser;
  if (!user) throw Object.assign(new Error("sem sessão"), { code: "auth/requires-recent-login" });

  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, senhaAtual));
  await updatePassword(user, senhaNova);
  await updateDoc(doc(db, "users", user.uid), { mustChangePassword: false });
}

// ─── GESTÃO DE USUÁRIOS (admin) ───────────────────────────────────────────────

export async function listarUsuarios() {
  const snap = await getDocs(query(collection(db, "users"), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Cria uma conta no Firebase Auth + o perfil no Firestore.
 *
 * modo "convite": gera uma senha aleatória que ninguém vê e dispara o e-mail de
 * definição de senha — o admin nunca conhece a senha do usuário.
 * modo "temporaria": o admin define uma senha inicial e o usuário é obrigado a
 * trocá-la no primeiro acesso (mustChangePassword).
 */
export async function criarUsuario({ nome, email, cargo, role, modo, senhaTemporaria }, criadoPor) {
  const emailLimpo = email.trim().toLowerCase();
  const senha = modo === "temporaria" ? senhaTemporaria : senhaAleatoria();

  const uid = await withSecondaryAuth(async (secondaryAuth) => {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, emailLimpo, senha);
    return cred.user.uid;
  });

  await setDoc(doc(db, "users", uid), {
    name:  nome.trim(),
    email: emailLimpo,
    cargo: (cargo || "").trim(),
    role,
    disabled: false,
    mustChangePassword: modo === "temporaria",
    createdAt: serverTimestamp(),
    createdBy: criadoPor,
  });

  if (modo !== "temporaria") await sendPasswordResetEmail(auth, emailLimpo);

  return uid;
}

export function atualizarUsuario(uid, { nome, cargo, role }) {
  return updateDoc(doc(db, "users", uid), { name: nome.trim(), cargo: (cargo || "").trim(), role });
}

/**
 * Ativa/desativa o acesso. No plano Spark o SDK do cliente não apaga a conta de
 * outro usuário no Auth — desativar bloqueia o acesso via Security Rules, que é
 * o que importa. Para excluir a conta de vez, use o Console do Firebase.
 */
export function definirUsuarioDesativado(uid, desativado) {
  return updateDoc(doc(db, "users", uid), { disabled: desativado });
}

function senhaAleatoria() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return "Tmp!" + btoa(String.fromCharCode(...bytes)).replace(/[^A-Za-z0-9]/g, "").slice(0, 24);
}
