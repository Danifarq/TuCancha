import { db, auth } from "./firebase-config.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ----------------------------
// CONFETI
// ----------------------------
function lanzarConfeti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 }
  });
}

// ----------------------------
// Cerrar sesión
// ----------------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});

// ----------------------------
// Cargar reservas
// ----------------------------
async function obtenerReservas() {
  const tabla = document.getElementById("tablaReservas");
  tabla.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "reservas"));

  querySnapshot.forEach((docu) => {
    const data = docu.data();
    const id = docu.id;

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.actividad}</td>
      <td>${data.fecha}</td>
      <td>${data.hora}</td>
      <td>${data.estado ?? "pendiente"}</td>
      <td>
        <button class="aceptar" onclick="aceptarReserva('${id}')">Aceptar</button>
        <button class="rechazar" onclick="rechazarReserva('${id}')">Rechazar</button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

window.aceptarReserva = async function (id) {
  await updateDoc(doc(db, "reservas", id), { estado: "aceptada" });

  lanzarConfeti(); // 🎉 CONFETI AL ACEPTAR

  obtenerReservas();
};

window.rechazarReserva = async function (id) {
  await updateDoc(doc(db, "reservas", id), { estado: "rechazada" });

  obtenerReservas();
};

// Cargar al iniciar
obtenerReservas();
