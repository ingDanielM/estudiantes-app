import os
import requests
from dotenv import load_dotenv

# Cargar variables de entorno
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
SENDER_EMAIL = os.getenv("SMTP_USER") # Usaremos este como remitente

def send_otp_email(to_email: str, otp_code: str):
    if not BREVO_API_KEY or not SENDER_EMAIL:
        print("ADVERTENCIA: API Key de Brevo o correo remitente no configurados. El correo no se enviará.")
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"email": SENDER_EMAIL, "name": "Estudiantes App"},
        "to": [{"email": to_email}],
        "subject": "Tu Código de Verificación OTP",
        "htmlContent": f"""
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hola,</h2>
            <p>Tu código de verificación para iniciar sesión es: <strong style="font-size: 24px;">{otp_code}</strong></p>
            <p>Este código expirará en 10 minutos.</p>
            <p>Si no solicitaste este código, puedes ignorar este correo.</p>
            <br>
            <p>Saludos,<br>El Equipo de Estudiantes App</p>
        </div>
        """
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Error al enviar correo con Brevo: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Detalle Brevo: {e.response.text}")
        return False