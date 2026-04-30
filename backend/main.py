from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
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


# CRUD Estudiantes

# GET - Obtener todos los estudiantes
@app.get("/students", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return students


# POST - Crear estudiante
@app.post("/students", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
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
def update_student(student_id: int, student: StudentCreate, db: Session = Depends(get_db)):
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
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()

    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(db_student)
    db.commit()

    return {"message": "Student deleted successfully"}