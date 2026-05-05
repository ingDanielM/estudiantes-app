const API_URL = "";

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
      alert("Error al enviar OTP: " + (data.detail || "Error desconocido"));
    } else {
      alert(data.message || "OTP enviado al correo exitosamente.");
    }
  } catch (error) {
    alert("Error de red o conexión al intentar enviar el correo: " + error.message);
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
      alert("Login exitoso 🔥");
      window.location.href = "/static/index.html";
    } else {
      alert("Error al verificar OTP: " + (data.detail || "Código incorrecto"));
    }
  } catch (error) {
    alert("Error de red al verificar el código: " + error.message);
  }
});
