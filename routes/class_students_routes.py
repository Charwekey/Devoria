from fastapi import APIRouter, Depends
from services.class_students_services import ClassStudentService
from utils.dependancies import get_current_user

router = APIRouter(prefix="/class-students", tags=["Class Students"])

class_student_service = ClassStudentService()


#  ADD STUDENT (Instructor)
@router.post("/")
def add_student(class_id: str, student_id: str, user=Depends(get_current_user)):
    return class_student_service.add_student_to_class(user, class_id, student_id)


#  GET STUDENTS IN CLASS
@router.get("/class/{class_id}")
def get_students_in_class(class_id: str):
    return class_student_service.get_students_in_class(class_id)


#  GET CLASSES FOR STUDENT
@router.get("/student/{student_id}")
def get_classes_for_student(student_id: str):
    return class_student_service.get_classes_for_student(student_id)


#  REMOVE STUDENT
@router.delete("/")
def remove_student(class_id: str, student_id: str, user=Depends(get_current_user)):
    return class_student_service.remove_student_from_class(user, class_id, student_id)