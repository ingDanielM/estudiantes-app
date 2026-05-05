const API_URL = "";

function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.opacity = 1;
    setTimeout(() => t.style.opacity = 0, 2000);
}

// Mostrar formulario de verificación OTP
function mostrarFormularioOTP() {
  console.log("Mostrando formulario de verificación OTP");
  document.getElementById("otpForm").style.transform = "translateY(50px)";
  document.getElementById("verifyForm").style.opacity = "1";
  document.getElementById("verifyForm").style.transform = "translateY(-50px)";
  document.getElementById("verifyForm").style.pointerEvents = "auto";
}

// Enviar OTP
document.getElementById("otpForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;

  try {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      toast("Error al enviar OTP: " + (data.detail || "Error desconocido"));
    } else {
      mostrarFormularioOTP();
      toast(data.message || "OTP enviado al correo exitosamente.");
    }
  } catch (error) {
    toast("Error de red o conexión al intentar enviar el correo: " + error.message);
  }
});

// Verificar OTP
document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const otp_code = document.getElementById("otp").value;

  try {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, otp_code })
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      localStorage.setItem("token", data.access_token);
      toast("Login exitoso 🔥");
      setTimeout(() => {
        window.location.href = "/static/index.html";
      }, 1000);
    } else {
      toast("Error al verificar OTP: " + (data.detail || "Código incorrecto"));
    }
  } catch (error) {
    toast("Error de red al verificar el código: " + error.message);
  }
});
