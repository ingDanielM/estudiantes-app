from jose import JWTError, jwt
import datetime
from fastapi import HTTPException, Security, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import os
from sqlalchemy.orm import Session

# En un entorno real, esto vendría de variables de entorno (.env)
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_temporary_key_for_dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 días

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        return email
    except JWTError:
      raise HTTPException(status_code=401, detail="Could not validate credentials")
