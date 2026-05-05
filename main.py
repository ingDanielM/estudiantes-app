import sys
import os

# Agregamos la carpeta backend al path para que los imports internos funcionen
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Importamos la app real desde el backend
from backend.main import app
