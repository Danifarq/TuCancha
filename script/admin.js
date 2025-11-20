import { db, auth } from "./firebase-config.js";

import {
  collection,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* ELEMENTOS */
const lista = document.getElementById("listaReservas");
const filtros = document.querySelectorAll(".filtro-btn");
const buscador = document.getElementById("buscador");
const btnLogout = document.getElementById("btnLogout");

const btnVerReservas = document.getElementById("btnVerReservas");
const btnVerUsuarios = document.getElementById("btnVerUsuarios");
const listaUsuarios = document.getElementById("listaUsuarios");
const controlesReservas = document.getElementById("controlesReservas");

let reservasLocal = [];
let filtroActual = "todas";
let textoBusqueda = "";

/* LOGOUT */
btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

/* CONFETTI */
function lanzarConfeti() {
  if (typeof confetti !== "undefined") {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

/* ESCUCHA RESERVAS */
function escucharReservasEnVivo() {
  const q = query(collection(db, "reservas"), orderBy("fecha", "desc"));
  onSnapshot(q, (snapshot) => {
    reservasLocal = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderReservas();
  });
}

/* FILTROS Y BÚSQUEDA */
function aplicarFiltroYBusqueda(list) {
  return list.filter(r => {
    const cumpleFiltro = filtroActual === "todas" ? true : (r.estado === filtroActual);
    const t = textoBusqueda.trim().toLowerCase();

    if (!t) return cumpleFiltro;

    return (
      (r.nombre || "").toLowerCase().includes(t) ||
      (r.email || "").toLowerCase().includes(t) ||
      (r.actividad || "").toLowerCase().includes(t)
    ) && cumpleFiltro;
  });
}

document.querySelectorAll(".btn-quitar-admin").forEach(btn => {
  btn.onclick = () => quitarAdmin(btn.dataset.id);
});
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
        <h3>${r.nombre}</h3>
        <p><strong>Actividad:</strong> ${r.actividad}</p>
        <p><strong>Fecha:</strong> ${r.fecha} • <strong>Hora:</strong> ${r.hora || "-"}</p>
        <p><strong>Contacto:</strong> ${r.email} ${r.telefono ? "• " + r.telefono : ""}</p>
        <div class="estado tag-estado ${estadoClase}">${tagEstado}</div>
      </div>

      <div class="reserva-actions">
        ${(r.estado === "pendiente" || !r.estado)
          ? `
            <button class="btn-aceptar" data-id="${r.id}">Aceptar</button>
            <button class="btn-rechazar" data-id="${r.id}">Rechazar</button>
            `
          : `
            <button disabled class="btn-aceptar" style="opacity:.6">Aceptar</button>
            <button disabled class="btn-rechazar" style="opacity:.6">Rechazar</button>
            `}
      </div>
    `;

    lista.appendChild(card);
  });

  activarBotonesAccion();
}

/* BOTONES */
function activarBotonesAccion() {
  document.querySelectorAll(".btn-aceptar").forEach(b => {
    b.onclick = async () => {
      await updateDoc(doc(db, "reservas", b.dataset.id), { estado: "aceptada" });
      lanzarConfeti();
    };
  });

  document.querySelectorAll(".btn-rechazar").forEach(b => {
    b.onclick = async () => {
      await updateDoc(doc(db, "reservas", b.dataset.id), { estado: "rechazada" });
    };
  });
}

/* FILTROS */
filtros.forEach(btn => {
  btn.addEventListener("click", () => {
    filtros.forEach(x => x.classList.remove("activo"));
    btn.classList.add("activo");
    filtroActual = btn.dataset.estado;
    renderReservas();
  });
});

/* BUSCADOR */
buscador?.addEventListener("input", e => {
  textoBusqueda = e.target.value;
  renderReservas();
});

/* NAV: CAMBIAR ENTRE RESERVAS Y USUARIOS */
btnVerReservas.addEventListener("click", () => {
  btnVerReservas.classList.add("activo");
  btnVerUsuarios.classList.remove("activo");

  controlesReservas.style.display = "block";
  lista.style.display = "grid";
  listaUsuarios.style.display = "none";
});

btnVerUsuarios.addEventListener("click", () => {
  btnVerUsuarios.classList.add("activo");
  btnVerReservas.classList.remove("activo");

  controlesReservas.style.display = "none";
  lista.style.display = "none";
  listaUsuarios.style.display = "block";

  cargarUsuarios();
});
async function eliminarUsuario(uid) {
  if (confirm("¿Estás seguro de que querés eliminar este usuario?")) {
    await deleteDoc(doc(db, "usuarios", uid));
    cargarUsuarios();
  }
}
/* CARGAR USUARIOS */
async function cargarUsuarios() {
  const snap = await getDocs(collection(db, "usuarios"));
  const tbody = document.getElementById("tablaUsuariosBody");

  tbody.innerHTML = "";

  snap.forEach(docu => {
    const u = docu.data();

    tbody.innerHTML += `
      <tr>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <button class="btn-promover" data-id="${docu.id}">Hacer Admin</button>
          <button class="btn-quitar-admin" data-id="${docu.id}">Quitar Admin</button>
          <button class="btn-eliminar" data-id="${docu.id}">Eliminar</button>
        </td>
      </tr>
    `;
  });

  /* BOTÓN ELIMINAR */
  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.onclick = () => eliminarUsuario(btn.dataset.id);
  });

  /* BOTÓN HACER ADMIN */
  document.querySelectorAll(".btn-promover").forEach(btn => {
    btn.onclick = () => hacerAdmin(btn.dataset.id);
  });

  /* BOTÓN QUITAR ADMIN */
  document.querySelectorAll(".btn-quitar-admin").forEach(btn => {
    btn.onclick = () => quitarAdmin(btn.dataset.id);
  });
}


/* HACER ADMIN */
async function hacerAdmin(uid) {
  await updateDoc(doc(db, "usuarios", uid), { role: "admin" });
  alert("Usuario promovido a administrador");
  cargarUsuarios();
}
async function quitarAdmin(uid) {
  await updateDoc(doc(db, "usuarios", uid), { role: "usuario" });
  cargarUsuarios();
}
/* START */
escucharReservasEnVivo();
