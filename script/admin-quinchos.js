
import { 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
  collection, addDoc, deleteDoc, doc, onSnapshot, getDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Elementos del DOM
const formQuincho = document.getElementById("formQuincho");
const tablaQuinchos = document.getElementById("tablaQuinchos");
const tablaUsuarios = document.getElementById("tablaUsuarios");

let usuarioActual = null;
//admin 
async function esAdmin(uid) {
  const userDocRef = doc(db, "usuarios", uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) return false;
  const data = userDoc.data();
  return data.rol === "admin";
}

// ---------------------------------------------
// Estado de autenticación
onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = "login.html";
  usuarioActual = user;

  if (!(await esAdmin(user.uid))) {
    alert("No tenés permisos de administrador");
    window.location.href = "bienvenido.html";
  } else {
    mostrarQuinchos();
    mostrarUsuarios();
  }
});

// ---------------------------------------------
// AGREGAR QUINCHO
formQuincho.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreQuincho").value;
  const capacidad = document.getElementById("capacidadQuincho").value;
  const descripcion = document.getElementById("descQuincho").value;

  try {
    await addDoc(collection(db, "quinchos"), { nombre, capacidad, descripcion });
    alert("✅ Quincho agregado");
    formQuincho.reset();
  } catch (error) {
    console.error(error);
    alert("❌ Error al agregar quincho");
  }
});

// ---------------------------------------------
// MOSTRAR QUINCHOS
function mostrarQuinchos() {
  onSnapshot(collection(db, "quinchos"), (snapshot) => {
    let html = "<table><thead><tr><th>Nombre</th><th>Capacidad</th><th>Descripción</th><th>Imagen</th><th>Acción</th></tr></thead><tbody>";

    snapshot.forEach((docSnap) => {
      const q = docSnap.data();
      html += `<tr data-id="${docSnap.id}">
                <td>${q.nombre}</td>
                <td>${q.capacidad}</td>
                <td>${q.descripcion}</td>
                <td><button class="btn-eliminar">Eliminar</button></td>
              </tr>`;
    });
    html += "</tbody></table>";

    tablaQuinchos.innerHTML = html;

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const quinchoId = e.target.closest("tr").dataset.id;
        if (!confirm("¿Seguro que querés eliminar este quincho?")) return;
        try {
          await deleteDoc(doc(db, "quinchos", quinchoId));
          alert("✅ Quincho eliminado");
        } catch (error) {
          console.error(error);
          alert("❌ Error al eliminar quincho");
        }
      });
    });
  });
}

// ---------------------------------------------
// MOSTRAR USUARIOS Y GESTIONAR ROLES
function mostrarUsuarios() {
  onSnapshot(collection(db, "usuarios"), (snapshot) => {
    let html = "<table border='1'><tr><th>Email</th><th>Rol</th><th>Acción</th></tr>";

    snapshot.forEach(docSnap => {
      const u = docSnap.data();
      const uid = docSnap.id;

      // Si el usuario es admin
      if (u.rol === "admin") {
        if (uid === usuarioActual.uid) {
          // Es el admin actual: no se puede quitar a sí mismo
          html += `<tr data-id="${uid}">
                    <td>${u.email}</td>
                    <td>${u.rol}</td>
                    <td><em>Es usted</em></td>
                  </tr>`;
        } else {
          // Otro admin: permitir quitar rol
          html += `<tr data-id="${uid}">
                    <td>${u.email}</td>
                    <td>${u.rol}</td>
                    <td><button class="btn-eliminar btn-quitar-admin">Quitar Admin</button></td>
                  </tr>`;
        }
      } else {
        // Usuario común: permitir hacer admin
        html += `<tr data-id="${uid}">
                  <td>${u.email}</td>
                  <td>${u.rol}</td>
                  <td><button class="btn-eliminar btn-hacer-admin">Hacer Admin</button></td>
                </tr>`;
      }
    });

    html += "</table>";
    tablaUsuarios.innerHTML = html;

    // Botones para hacer admin
    document.querySelectorAll(".btn-hacer-admin").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const uid = e.target.closest("tr").dataset.id;
        if (!confirm("¿Querés hacer administrador a este usuario?")) return;
        try {
          await updateDoc(doc(db, "usuarios", uid), { rol: "admin" });
          alert("✅ Usuario ahora es administrador");
        } catch (error) {
          console.error(error);
          alert("❌ Error al actualizar rol");
        }
      });
    });

    // Botones para quitar admin
    document.querySelectorAll(".btn-quitar-admin").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const uid = e.target.closest("tr").dataset.id;
        if (!confirm("¿Querés quitarle el rol de administrador a este usuario?")) return;
        try {
          await updateDoc(doc(db, "usuarios", uid), { rol: "user" });
          alert("✅ Se ha quitado el rol de administrador");
        } catch (error) {
          console.error(error);
          alert("❌ Error al actualizar rol");
        }
      });
    });
  });
}
