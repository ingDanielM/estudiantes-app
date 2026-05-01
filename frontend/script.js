const API_URL = "http://localhost:3000";

//  Verificar token
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}


function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

//  Cargar estudiantes
async function cargarEstudiantes() {
  const res = await fetch(`${API_URL}/estudiantes`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  data.forEach(est => {
    const div = document.createElement("div");
    div.classList.add("item");

    div.innerHTML = `
      <span>${est.nombre} - ${est.curso}</span>
      <div class="actions">
        <button class="edit" onclick="editarEstudiante('${est.id}', '${est.nombre}', '${est.curso}')">Editar</button>
        <button class="delete" onclick="eliminarEstudiante('${est.id}')">Eliminar</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

//  Crear estudiante
document.getElementById("formEstudiante").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const curso = document.getElementById("curso").value;

  await fetch(`${API_URL}/estudiantes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, curso })
  });

  document.getElementById("formEstudiante").reset();
  cargarEstudiantes();
});

//  Editar estudiante
async function editarEstudiante(id, nombreActual, cursoActual) {
  const nuevoNombre = prompt("Nuevo nombre:", nombreActual);
  const nuevoCurso = prompt("Nuevo curso:", cursoActual);

  if (!nuevoNombre || !nuevoCurso) return;

  await fetch(`${API_URL}/estudiantes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ nombre: nuevoNombre, curso: nuevoCurso })
  });

  cargarEstudiantes();
}

// Eliminar estudiante
async function eliminarEstudiante(id) {
  const confirmar = confirm("¿Eliminar este estudiante?");
  if (!confirmar) return;

  await fetch(`${API_URL}/estudiantes/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  cargarEstudiantes();
}

// Inicial
cargarEstudiantes();
