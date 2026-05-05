const API_URL = "";

// Enviar OTP
document.getElementById("otpForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;

  const res = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  alert(data.message || "OTP enviado");
});

// Verificar OTP
document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const otp_code = document.getElementById("otp").value;

  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, otp_code })
  });

  const data = await res.json();

  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
    alert("Login exitoso 🔥");
    window.location.href = "/static/index.html";
  } else {
    alert("OTP incorrecto ❌");
  }
});
