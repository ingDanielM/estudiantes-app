import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Cargar variables de entorno
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_otp_email(to_email: str, otp_code: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print("ADVERTENCIA: Credenciales SMTP no configuradas. El correo no se enviará.")
        return False

    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = "Tu Código de Verificación OTP"

    body = f"""
    Hola,
    
    Tu código de verificación para iniciar sesión es: {otp_code}
    
    Este código expirará en 10 minutos.
    Si no solicitaste este código, puedes ignorar este correo.
    
    Saludos,
    El Equipo de Estudiantes App
    """
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USER, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        return False