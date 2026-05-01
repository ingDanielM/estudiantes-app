const API_URL = "http://localhost:3000";

// 🔐 Verificar token
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// 🚪 Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// 📥 Cargar estudiantes
async function cargarEstudiantes() {
  const res = await fetch(`${API_URL}/estudiantes`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  const lista = document.getElementById("lista");

  if (!lista) return; // evita errores si no existe

  lista.innerHTML = "";

  data.forEach(est => {
    const li = document.createElement("li");
    li.textContent = `${est.nombre} - ${est.curso}`;
    lista.appendChild(li);
  });
}

// ➕ Crear estudiante
const form = document.getElementById("formEstudiante");

if (form) {
  form.addEventListener("submit", async (e) => {
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

    form.reset();
    cargarEstudiantes();
  });
}

// 🚀 Inicial
cargarEstudiantes();
