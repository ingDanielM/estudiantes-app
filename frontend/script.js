const API_URL = "";

// Verificar token
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/static/login.html";
}


function logout() {
  localStorage.removeItem("token");
  window.location.href = "/static/login.html";
}

// Cargar estudiantes
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
        <button class="edit" onclick="editarEstudiante(${est.id}, '${est.name}', ${est.age}, ${est.grade})">Editar</button>
        <button class="delete" onclick="eliminarEstudiante(${est.id})">Eliminar</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

// Crear estudiante
document.getElementById("formEstudiante").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("nombre").value;
  const age = parseInt(document.getElementById("edad").value);
  const grade = parseFloat(document.getElementById("nota").value);

  await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ name, age, grade })
  });

  document.getElementById("formEstudiante").reset();
  cargarEstudiantes();
});

// Editar estudiante
async function editarEstudiante(id, nameActual, ageActual, gradeActual) {
  const nuevoName = prompt("Nuevo nombre:", nameActual);
  const nuevaAge = parseInt(prompt("Nueva edad:", ageActual));
  const nuevaGrade = parseFloat(prompt("Nueva nota (0.0 - 5.0):", gradeActual));

  if (!nuevoName) return;

  await fetch(`${API_URL}/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ name: nuevoName, age: nuevaAge, grade: nuevaGrade })
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
