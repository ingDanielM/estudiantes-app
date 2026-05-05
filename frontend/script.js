const API = "http://localhost:8000/students";
const token = localStorage.getItem("token");

// protección
if (!token) {
    window.location.href = "login.html";
}

function headers() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.opacity = 1;
    setTimeout(() => t.style.opacity = 0, 2000);
}

// cargar
async function cargar() {
    const res = await fetch(API, { headers: headers() });

    if (!res.ok) {
        toast("Error al cargar datos, " + res.status + " " + res.detail);
        return;
    }

    const data = await res.json();

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    data.forEach(e => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${e.name} | ${e.age} años | Nota: ${e.grade}
            <div>
                <button onclick="editar(${e.id})">✏️</button>
                <button onclick="eliminar(${e.id})">🗑️</button>
            </div>
        `;

        lista.appendChild(li);
    });
}

// agregar
async function agregar() {
    const name = document.getElementById("name").value;
    const age = parseInt(document.getElementById("age").value);
    const grade = parseFloat(document.getElementById("grade").value);

    if (!name || isNaN(age) || isNaN(grade)) {
        toast("Todos los campos son obligatorios y deben ser válidos");
        return;
    }

    if (age < 0 || age > 120) {
        toast("Edad no válida");
        return;
    }

    if (grade < 0 || grade > 5) {
        toast("La nota debe estar entre 0 y 5");
        return;
    }

    const res = await fetch(API, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ name, age, grade })
    });

    if (!res.ok) {
        toast("Error al agregar estudiante, " + res.status + " " + res.detail);
        return;
    }

    toast("Agregado");
    cargar();
}

// eliminar
async function eliminar(id) {
    const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: headers()
    });

    if (!res.ok) {
        toast("Error al eliminar estudiante, " + res.status + " " + res.detail);
        return;
    }

    toast("Eliminado");
    cargar();
}

// editar
async function editar(id) {
    const name = prompt("Nombre:");
    const age = parseInt(prompt("Edad:"));
    const grade = parseFloat(prompt("Nota:"));

    if (!name || isNaN(age) || isNaN(grade)) {
        toast("Todos los campos son obligatorios y deben ser válidos");
        return;
    }

    if (age < 0 || age > 120) {
        toast("Edad no válida");
        return;
    }
    
    if (grade < 0 || grade > 5) {
        toast("La nota debe estar entre 0 y 5");
        return;
    }

    const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name, age, grade })
    });

    if (!res.ok) {
        toast("Error al actualizar estudiante, " + res.status + " " + res.detail);
        return;
    }

    toast("Actualizado");
    cargar();
}

// logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

cargar();