
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const message = document.getElementById("message");

// REGISTRO 
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = registerEmail.value;
  const password = registerPassword.value;

  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar usuario en Firestore con rol
    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      rol: "usuario" 
    });

    message.textContent = "Usuario registrado correctamente!";
    message.style.color = "green";
    registerForm.reset();

  } catch (error) {
    console.error(error);
    message.textContent = "Error al registrar usuario: " + error.message;
    message.style.color = "red";
  }
});

// LOGIN 
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;

  try {
    // Login con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener rol desde Firestore
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      message.textContent = `Bienvenido ${user.email}`;
      message.style.color = "green";
      loginForm.reset();

      // Redirigir según rol
      if (data.rol === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "bienvenido.html";
      }

    } else {
      message.textContent = "No se encontró información del usuario.";
      message.style.color = "red";
    }

  } catch (error) {
    console.error(error);
    message.textContent = "Error al iniciar sesión: " + error.message;
    message.style.color = "red";
  }
});
