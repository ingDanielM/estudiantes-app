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
  const res = await fetch(`${API_URL}/students`, {
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
      <span>${est.name} - Edad: ${est.age} - Nota: ${est.grade}</span>
      <div class="actions">
        <button class="edit" onclick="editarEstudiante('${est.id}', '${est.name}', ${est.age}, ${est.grade})">Editar</button>
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
  const edad = document.getElementById("edad").value;
  const calificacion = document.getElementById("calificacion").value;

  await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ name: nombre, age: parseInt(edad), grade: parseFloat(calificacion) })
  });

  document.getElementById("formEstudiante").reset();
  cargarEstudiantes();
});

//  Editar estudiante
async function editarEstudiante(id, nombreActual, edadActual, califActual) {
  const nuevoNombre = prompt("Nuevo nombre:", nombreActual);
  const nuevaEdad = prompt("Nueva edad:", edadActual);
  const nuevaCalificacion = prompt("Nueva calificación (0-5):", califActual);

  if (!nuevoNombre || !nuevaEdad || !nuevaCalificacion) return;

  await fetch(`${API_URL}/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ name: nuevoNombre, age: parseInt(nuevaEdad), grade: parseFloat(nuevaCalificacion) })
  });

  cargarEstudiantes();
}

// Eliminar estudiante
async function eliminarEstudiante(id) {
  const confirmar = confirm("¿Eliminar este estudiante?");
  if (!confirmar) return;

  await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  cargarEstudiantes();
}

// Inicial
cargarEstudiantes();
