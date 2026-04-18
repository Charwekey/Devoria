from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.class_students_services import ClassStudentService
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/class_students", tags=["Class Students"])

class AddStudent(BaseModel):
    class_id: str
    student_id: str

class ApproveStudent(BaseModel):
    class_id: str
    student_id: str


#  ENROLL STUDENT (Manual add by Instructor)
@router.post("/add")
def add_student(data: AddStudent, user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = ClassStudentService(db)
    return service.add_student_to_class(user, data.class_id, data.student_id)


#  GET PENDING JOIN REQUESTS (For Instructor)
@router.get("/pending/{class_id}")
def get_pending_requests(class_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = ClassStudentService(db)
    return service.get_pending_requests(user, class_id)


#  APPROVE JOIN REQUEST (For Instructor)
@router.post("/approve")
def approve_student(data: ApproveStudent, user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = ClassStudentService(db)
    return service.approve_student(user, data.class_id, data.student_id)


#  GET STUDENTS IN CLASS (Approved only)
@router.get("/class/{class_id}")
def get_students_in_class(class_id: str, db: Session = Depends(get_db)):
    service = ClassStudentService(db)
    return service.get_students_in_class(class_id)


#  GET CLASSES FOR STUDENT
@router.get("/student/{student_id}")
def get_classes_for_student(student_id: str, db: Session = Depends(get_db)):
    service = ClassStudentService(db)
    return service.get_classes_for_student(student_id)


#  REMOVE STUDENT FROM CLASS
@router.delete("/class/{class_id}/student/{student_id}")
def remove_student_from_class(
    class_id: str, 
    student_id: str, 
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ClassStudentService(db)
    return service.remove_student_from_class(user, class_id, student_id)