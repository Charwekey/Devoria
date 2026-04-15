from fastapi import APIRouter, Depends
from services.classes_services import ClassService
from utils.dependancies import get_current_user

router = APIRouter(prefix="/classes", tags=["Classes"])

class_service = ClassService()


#  CREATE CLASS (Instructor)
@router.post("/")
def create_class(class_name: str, track: str, user=Depends(get_current_user)):
    return class_service.create_class(user, class_name, track)


#  JOIN CLASS (Student)
@router.post("/join")
def join_class(class_code: str, user=Depends(get_current_user)):
    return class_service.join_class(user, class_code)


#  GET MY CLASSES (Instructor)
@router.get("/instructor")
def get_my_classes(user=Depends(get_current_user)):
    return class_service.get_my_classes(user)


#  GET MY CLASSES (Student)
@router.get("/student")
def get_student_classes(user=Depends(get_current_user)):
    return class_service.get_student_classes(user)


#  GET SINGLE CLASS
@router.get("/{class_id}")
def get_class(class_id: str):
    return class_service.get_class_by_id(class_id)


#  UPDATE CLASS
@router.put("/{class_id}")
def update_class(
    class_id: str,
    class_name: str = None,
    track: str = None,
    user=Depends(get_current_user)
):
    return class_service.update_class(
        user,
        class_id,
        class_name=class_name,
        track=track
    )


#  DELETE CLASS
@router.delete("/{class_id}")
def delete_class(class_id: str, user=Depends(get_current_user)):
    return class_service.delete_class(user, class_id)