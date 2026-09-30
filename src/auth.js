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
  doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, serverTimestamp, onSnapshot,
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
 * Observa a sessão do Firebase Auth e acompanha o perfil em tempo real.
 *
 * cb(usuario)                       sessão válida (chamado de novo a cada mudança no perfil: papel, nome…)
 * cb(null, { motivo })              sem sessão; motivo "desativado" | "sem-perfil" quando o app encerrou a sessão
 * cb(undefined, { erro: "rede" })   não deu para ler o perfil (offline/lento): a sessão NÃO é encerrada
 *
 * Antes o perfil era lido uma vez só: uma conta desativada seguia navegando, e qualquer falha
 * de rede ao abrir o app deslogava (apagando o "Lembrar-me").
 */
export function observarSessao(cb) {
  let pararPerfil = null;
  let timer = null;
  const limpar = () => { pararPerfil?.(); pararPerfil = null; clearTimeout(timer); };

  const pararAuth = onAuthStateChanged(auth, (fbUser) => {
    limpar();
    if (!fbUser) return cb(null);
    // Sem resposta do Firestore em 12 s (offline): avisa sem deslogar; o listener continua e resolve quando voltar
    timer = setTimeout(() => cb(undefined, { erro: "rede" }), 12000);
    pararPerfil = onSnapshot(
      doc(db, "users", fbUser.uid),
      (snap) => {
        clearTimeout(timer);
        const perfil = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (!perfil || perfil.disabled === true) {
          limpar();
          signOut(auth).finally(() => cb(null, { motivo: perfil ? "desativado" : "sem-perfil" }));
          return;
        }
        cb({ ...perfil, uid: fbUser.uid, email: fbUser.email });
      },
      (err) => {
        clearTimeout(timer);
        if (err?.code === "permission-denied") {
          limpar();
          signOut(auth).finally(() => cb(null, { motivo: "desativado" }));
          return;
        }
        cb(undefined, { erro: "rede" });
      },
    );
  });
  return () => { limpar(); pararAuth(); };
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

  // Conta e perfil andam juntos: se o perfil não for salvo, a conta recém-criada é apagada
  // (a instância secundária ainda está logada como ela). Sem isso sobrava uma conta sem perfil,
  // invisível na lista e impossível de recriar ("e-mail já cadastrado").
  const uid = await withSecondaryAuth(async (secondaryAuth) => {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, emailLimpo, senha);
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        name:  nome.trim(),
        email: emailLimpo,
        cargo: (cargo || "").trim(),
        role,
        disabled: false,
        mustChangePassword: modo === "temporaria",
        createdAt: serverTimestamp(),
        createdBy: criadoPor,
      });
    } catch (err) {
      try { await cred.user.delete(); } catch { /* se nem isso der, o Console do Firebase resolve */ }
      throw err;
    }
    return cred.user.uid;
  });

  // O convite é a última etapa: se o e-mail falhar, a conta já existe e o admin reenvia pelo "Redefinir senha".
  let emailEnviado = true;
  if (modo !== "temporaria") {
    try { await sendPasswordResetEmail(auth, emailLimpo); } catch { emailEnviado = false; }
  }

  return { uid, emailEnviado };
}

export function atualizarUsuario(uid, { nome, cargo, role }) {
  return updateDoc(doc(db, "users", uid), { name: nome.trim(), cargo: (cargo || "").trim(), role });
}

/**
 * Salva a foto de perfil do próprio usuário (data URL base64) ou a remove
 * (photo = null). A imagem é redimensionada no cliente antes de chegar aqui —
 * as Security Rules recusam strings acima de ~500 KB para proteger o limite de
 * 1 MB por documento do Firestore.
 */
export function atualizarFotoPerfil(uid, photo) {
  return updateDoc(doc(db, "users", uid), { photo });
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
