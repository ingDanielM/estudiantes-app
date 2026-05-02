from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import models
import auth
import email_utils
import secrets
import datetime
from database import engine, SessionLocal

# Crear tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuracion CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia Base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esquemas de validación (Pydantic)
class StudentCreate(BaseModel):
    name: str
    age: int
    grade: float

class StudentResponse(BaseModel):
    id: int
    name: str
    age: int
    grade: float

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str


# Autenticación OTP

@app.post("/auth/request-otp")
def request_otp(request: OTPRequest, db: Session = Depends(get_db)):
    # 1. Buscar o crear el usuario
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        user = models.User(email=request.email)
        db.add(user)
        db.commit()
        db.refresh(user)

    # 2. Generar código OTP de 6 dígitos
    otp_code = "".join([str(secrets.choice(range(10))) for _ in range(6)])
    
    # 3. Guardar en base de datos con expiración (10 minutos)
    user.otp_code = otp_code
    user.otp_created_at = datetime.datetime.utcnow()
    db.commit()

    # 4. Enviar correo
    email_sent = email_utils.send_otp_email(to_email=user.email, otp_code=otp_code)
    
    if not email_sent:
        raise HTTPException(status_code=500, detail="Error al enviar el correo. Verifica las credenciales SMTP.")

    return {"message": "Código OTP enviado exitosamente al correo."}


@app.post("/auth/verify-otp", response_model=Token)
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    if not user.otp_code or user.otp_code != data.otp_code:
        raise HTTPException(status_code=400, detail="Código OTP incorrecto.")
        
    # Verificar si el código ha expirado (10 minutos)
    if not user.otp_created_at:
        raise HTTPException(status_code=400, detail="El código OTP no es válido.")
        
    expiration_time = user.otp_created_at + datetime.timedelta(minutes=10)
    if datetime.datetime.utcnow() > expiration_time:
        raise HTTPException(status_code=400, detail="El código OTP ha expirado. Solicita uno nuevo.")

    # El código es válido. Limpiar OTP y generar token JWT
    user.otp_code = None
    user.otp_created_at = None
    db.commit()
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(email: str = Depends(auth.verify_token), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# CRUD Estudiantes
# Para este CRUD se necesita verificar el token JWT en cada endpoint.

# GET - Obtener todos los estudiantes
@app.get("/students", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db), email: str = Depends(auth.verify_token)):
    if not email:
        raise HTTPException(status_code=401, detail="Unauthorized")
    students = db.query(models.Student).all()
    return students


# POST - Crear estudiante
@app.post("/students", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db), email: str = Depends(auth.verify_token)):
    if not email:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    new_student = models.Student(
        name=student.name,
        age=student.age,
        grade=student.grade
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


# PUT - Actualizar estudiante
@app.put("/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student: StudentCreate, db: Session = Depends(get_db), email: str = Depends(auth.verify_token)):
    if not email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()

    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db_student.name = student.name
    db_student.age = student.age
    db_student.grade = student.grade

    db.commit()
    db.refresh(db_student)
    return db_student


# DELETE - Eliminar estudiante
@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), email: str = Depends(auth.verify_token)):
    if not email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()

    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(db_student)
    db.commit()

    return {"message": "Student deleted successfully"}