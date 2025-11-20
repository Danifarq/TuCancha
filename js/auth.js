import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCBzidQybmv8MPRiPAqSGUHKaEutfGlho",
  authDomain: "tucancha-1dfe2.firebaseapp.com",
  projectId: "tucancha-1dfe2",
  storageBucket: "tucancha-1dfe2.firebasestorage.app",
  messagingSenderId: "664108191627",
  appId: "1:664108191627:web:3e0eac4be17ac4c4aae98e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const messageEl = document.getElementById("message");

/* -------------------------------------------------
   REGISTRO
-------------------------------------------------*/
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Guardar en Firestore
    await setDoc(doc(db, "usuarios", uid), {
      email: email,
      role: "usuario"   // ← SIEMPRE ESTE NOMBRE
    });

    messageEl.textContent = "✅ Registro exitoso. Ahora inicia sesión.";
    messageEl.style.color = "green";
  } catch (error) {
    messageEl.textContent = "❌ " + error.message;
    messageEl.style.color = "red";
  }
});

/* -------------------------------------------------
   LOGIN
-------------------------------------------------*/
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "usuarios", uid));

    if (!userDoc.exists()) {
      messageEl.textContent = "❌ El usuario no existe en Firestore.";
      messageEl.style.color = "red";
      return;
    }

    const role = userDoc.data().role || "usuario";

    messageEl.textContent = "✅ Sesión iniciada correctamente.";
    messageEl.style.color = "green";

    setTimeout(() => {
      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "bienvenido.html";
      }
    }, 800);

  } catch (error) {
    messageEl.textContent = "❌ " + error.message;
    messageEl.style.color = "red";
  }
});

/* -------------------------------------------------
   LOGOUT
-------------------------------------------------*/
document.getElementById("BtnCerrarScn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    messageEl.textContent = "❌ " + error.message;
    messageEl.style.color = "red";
  }
});
