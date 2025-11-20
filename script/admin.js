import { db, auth } from "./firebase-config.js";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* -------------------------------------------------
  ELEMENTOS
-------------------------------------------------*/
const lista = document.getElementById("listaReservas");
const filtros = document.querySelectorAll(".filtro-btn");
const buscador = document.getElementById("buscador");
const btnLogout = document.getElementById("btnLogout");

let reservasLocal = []; // cache
let filtroActual = "todas";
let textoBusqueda = "";

/* -------------------------------------------------
  LOGOUT
-------------------------------------------------*/
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  });
}

/* -------------------------------------------------
  CONFETTI
-------------------------------------------------*/
function lanzarConfeti() {
  if (typeof confetti !== "undefined") {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

/* -------------------------------------------------
  ESCUCHAR FIRESTORE EN TIEMPO REAL
-------------------------------------------------*/
function escucharReservasEnVivo() {
  // Orden por fecha si tenés el campo fecha en formato yyyy-mm-dd; ajústalo si es distinto.
  const q = query(collection(db, "reservas"), orderBy("fecha", "desc"));
  onSnapshot(q, (snapshot) => {
    reservasLocal = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderReservas();
  }, (err) => {
    console.error("Error escuchando reservas:", err);
  });
}

/* -------------------------------------------------
  RENDER + FILTROS + BUSCADOR
-------------------------------------------------*/
function aplicarFiltroYBusqueda(list) {
  return list.filter(r => {
    const cumpleFiltro = filtroActual === "todas" ? true : (r.estado === filtroActual);
    const texto = textoBusqueda.trim().toLowerCase();
    if (!texto) return cumpleFiltro;

    const nombre = (r.nombre || "").toLowerCase();
    const email = (r.email || "").toLowerCase();
    const actividad = (r.actividad || "").toLowerCase();

    const cumpleBusqueda = nombre.includes(texto) || email.includes(texto) || actividad.includes(texto);
    return cumpleFiltro && cumpleBusqueda;
  });
}

function renderReservas() {
  lista.innerHTML = "";
  const mostrar = aplicarFiltroYBusqueda(reservasLocal);

  if (mostrar.length === 0) {
    lista.innerHTML = `<p style="text-align:center;color:#666;margin-top:20px;">No hay reservas para mostrar</p>`;
    return;
  }

  mostrar.forEach(r => {
    const card = document.createElement("article");
    card.className = "reserva-card";

    const estadoClase = r.estado ? `estado-${r.estado}` : "estado-pendiente";
    const tagEstado = (r.estado || "pendiente").toUpperCase();

    card.innerHTML = `
      <div class="reserva-info">
        <h3>${escapeHtml(r.nombre || "Sin nombre")}</h3>
        <p><strong>Actividad:</strong> ${escapeHtml(r.actividad || "-")}</p>
        <p><strong>Fecha:</strong> ${escapeHtml(r.fecha || "-")} &nbsp; <strong>Hora:</strong> ${escapeHtml(r.hora || r.horario || "-")}</p>
        <p><strong>Contacto:</strong> ${escapeHtml(r.email || "-")} ${ r.telefono ? `• ${escapeHtml(r.telefono)}` : ""}</p>
        <div class="estado tag-estado ${estadoClase}"> ${tagEstado} </div>
      </div>

      <div class="reserva-actions">
        ${ (r.estado === "pendiente" || !r.estado) ? `
          <button class="btn-aceptar" data-id="${r.id}">Aceptar</button>
          <button class="btn-rechazar" data-id="${r.id}">Rechazar</button>
        ` : `
          <button class="btn-aceptar" disabled style="opacity:.6">Aceptar</button>
          <button class="btn-rechazar" disabled style="opacity:.6">Rechazar</button>
        `}
      </div>
    `;

    lista.appendChild(card);
  });

  activarBotonesAccion();
}

/* -------------------------------------------------
  BOTONES: aceptar / rechazar
-------------------------------------------------*/
function activarBotonesAccion() {
  document.querySelectorAll(".btn-aceptar").forEach(b => {
    b.onclick = async (ev) => {
      const id = b.dataset.id;
      if (!id) return;
      try {
        await updateDoc(doc(db, "reservas", id), { estado: "aceptada" });
        lanzarConfeti();
      } catch (err) {
        console.error("Error al aceptar:", err);
        alert("Error al aceptar la reserva");
      }
    };
  });

  document.querySelectorAll(".btn-rechazar").forEach(b => {
    b.onclick = async (ev) => {
      const id = b.dataset.id;
      if (!id) return;
      try {
        await updateDoc(doc(db, "reservas", id), { estado: "rechazada" });
      } catch (err) {
        console.error("Error al rechazar:", err);
        alert("Error al rechazar la reserva");
      }
    };
  });
}

/* -------------------------------------------------
  FILTROS y BUSCADOR - eventos
-------------------------------------------------*/
filtros.forEach(btn => {
  btn.addEventListener("click", () => {
    filtros.forEach(x => x.classList.remove("activo"));
    btn.classList.add("activo");
    filtroActual = btn.dataset.estado;
    renderReservas();
  });
});

if (buscador) {
  buscador.addEventListener("input", (e) => {
    textoBusqueda = e.target.value;
    renderReservas();
  });
}

/* -------------------------------------------------
  Util: escape HTML para evitar inyección en el innerHTML
-------------------------------------------------*/
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* -------------------------------------------------
  Inicializar escucha
-------------------------------------------------*/
escucharReservasEnVivo();
