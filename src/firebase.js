import { initializeApp, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// As chaves VITE_FIREBASE_* são públicas por design — elas apenas identificam o
// projeto. A proteção real vem das Security Rules do Firestore (firestore.rules)
// e da verificação de senha feita pelos servidores do Firebase Auth.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Sem config válida, getAuth() lança e derrubaria o import do módulo inteiro —
// levando a uma tela em branco em vez do aviso de configuração. Só inicializa
// quando há credenciais; o App checa firebaseReady antes de usar qualquer coisa.
const app  = firebaseReady ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app)      : null;
export const db   = app ? getFirestore(app) : null;

// Criar um usuário via createUserWithEmailAndPassword troca a sessão ativa pelo
// usuário recém-criado — o que deslogaria o admin. Uma instância secundária e
// descartável do app isola essa operação da sessão principal.
export async function withSecondaryAuth(fn) {
  if (!firebaseReady) throw new Error("Firebase não configurado.");
  const secondary = initializeApp(firebaseConfig, `admin-worker-${Date.now()}`);
  const secondaryAuth = getAuth(secondary);
  try {
    return await fn(secondaryAuth);
  } finally {
    try { await secondaryAuth.signOut(); } catch { /* sessão já encerrada */ }
    await deleteApp(secondary);
  }
}
