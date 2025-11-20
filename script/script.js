import { db } from "./firebase-config.js";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================
//  GUARDAR RESERVA
// ==========================

const formReserva = document.getElementById("formReserva");

formReserva.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;
  const actividad = document.getElementById("actividad").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  // ✔ Crear el objeto ANTES de usarlo
  const datosReserva = {
    nombre,
    email,
    telefono,
    actividad,
    fecha,
    hora,
    estado: "pendiente",
    fechaCreacion: new Date()
  };

  try {
    await addDoc(collection(db, "reservas"), datosReserva);
    alert("Reserva enviada correctamente.");
  } catch (error) {
    console.error("Error al guardar reserva:", error);
    alert("❌ No se pudo guardar la reserva.\n\nDetalles: " + error.message);
  }
});


// ==========================
//  MOSTRAR RESERVAS EXISTENTES
// ==========================

const tabla = document.querySelector("#tablaReservas tbody");

function cargarReservas() {
  onSnapshot(collection(db, "reservas"), (snapshot) => {
    tabla.innerHTML = "";

    snapshot.forEach((docu) => {
      const r = docu.data();

      tabla.innerHTML += `
        <tr>
          <td>${r.nombre}</td>
          <td>${r.actividad}</td>
          <td>${r.fecha}</td>
          <td>${r.hora}</td>
        </tr>
      `;
    });
  });
}

cargarReservas();
