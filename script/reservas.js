// reservas.js
import { 
  collection, getDocs, addDoc, onSnapshot, doc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db, auth } from './firebase-config.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const contenedorQuinchos = document.querySelector(".contenedor-Quinchos");
const selectQuincho = document.getElementById("quincho");
const formReserva = document.getElementById("formReserva");
const tablaReservas = document.getElementById("tablaReservas");
const btnIniciar = document.getElementById("BtnIniciarScn");


// ----------------------
// Cargar quinchos
// ----------------------
async function cargarQuinchos() {
  const snapshot = await getDocs(collection(db, "quinchos"));

  snapshot.forEach(docSnap => {
    const q = docSnap.data();

    // Mostrar en la sección
    const div = document.createElement("div");
    div.className = "quincho";
    div.innerHTML = `
      <img src="${q.imagen}" alt="${q.nombre}">
      <h2>${q.nombre}</h2>
      <p>${q.descripcion}</p>
    `;
    contenedorQuinchos.appendChild(div);

    // Agregar al select
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = q.nombre;
    selectQuincho.appendChild(option);
  });
}

// ----------------------
// Botón cerrar sesión
// ----------------------
const btnCerrar = document.getElementById("BtnCerrarScn");
if (btnCerrar) {
  btnCerrar.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        alert("Sesión cerrada correctamente");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  });
}

// ----------------------
// Guardar reserva
// ----------------------
formReserva.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    const iniciar = confirm("Para reservar debes iniciar sesión. ¿Deseas iniciar sesión ahora?");
    if (iniciar) window.location.href = "login.html";
    return;
  }

  const quinchoId = selectQuincho.value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!quinchoId) {
    alert("Seleccioná un quincho");
    return;
  }

  try {
    await addDoc(collection(db, "reservas"), {
      quinchoId,
      fecha,
      hora,
      userId: user.uid
    });
    alert("✅ Reserva creada");
    formReserva.reset();
  } catch (error) {
    console.error(error);
    alert("❌ Error al crear la reserva");
  }
});

// ----------------------
// Mostrar reservas propias
// ----------------------
function mostrarReservas() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      tablaReservas.innerHTML = "<p>Inicia sesión para ver tus reservas.</p>";
      return;
    }

    onSnapshot(collection(db, "reservas"), async (snapshot) => {
      let html = "<table border='1'><tr><th>Quincho</th><th>Fecha</th><th>Hora</th><th>Acción</th></tr>";

      for (const docSnap of snapshot.docs) {
        const r = docSnap.data();

        // Solo mostrar reservas del usuario logueado
        if (r.userId !== user.uid) continue;

        const reservaId = docSnap.id;

        // Obtener nombre del quincho
        const quinchoDocs = await getDocs(collection(db, "quinchos"));
        let nombreQuincho = "Desconocido";
        quinchoDocs.forEach(qDoc => {
          if (qDoc.id === r.quinchoId) nombreQuincho = qDoc.data().nombre;
        });

        html += `<tr>
          <td>${nombreQuincho}</td>
          <td>${r.fecha}</td>
          <td>${r.hora}</td>
          <td><button onclick="cancelarReserva('${reservaId}')">Cancelar</button></td>
        </tr>`;
      }

      html += "</table>";
      tablaReservas.innerHTML = html;
    });
  });
}

// ----------------------
// Cancelar reserva
// ----------------------
window.cancelarReserva = async (id) => {
  const user = auth.currentUser;
  if (!user) {
    alert("Debes iniciar sesión para cancelar una reserva.");
    return;
  }

  if (confirm("¿Querés cancelar esta reserva?")) {
    try {
      // Verificar que la reserva pertenece al usuario
      const docRef = doc(db, "reservas", id);
      const docSnap = await getDocs(docRef);
      // Nota: si quieres más seguridad, revisa en Firestore con reglas
      await deleteDoc(docRef);
      alert("✅ Reserva cancelada");
    } catch (error) {
      console.error(error);
      alert("❌ Error al cancelar la reserva");
    }
  }
};
// Escuchar cambios de sesión
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario logueado: ocultar "Iniciar sesión", mostrar "Cerrar sesión"
    if (btnIniciar) btnIniciar.style.display = "none";
    if (btnCerrar) btnCerrar.style.display = "inline-block"; // o block según tu CSS
  } else {
    // Usuario no logueado: mostrar "Iniciar sesión", ocultar "Cerrar sesión"
    if (btnIniciar) btnIniciar.style.display = "inline-block";
    if (btnCerrar) btnCerrar.style.display = "none";
  }
  });
// ----------------------
// Inicializar
// ----------------------
cargarQuinchos();
mostrarReservas();
