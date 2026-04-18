from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.classes_services import ClassService
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/classes", tags=["Classes"])

class ClassCreate(BaseModel):
    class_name: str
    track: str

class ClassUpdate(BaseModel):
    class_name: str | None = None
    track: str | None = None

class ClassJoin(BaseModel):
    class_code: str


#  CREATE CLASS (Instructor)
@router.post("/")
def create_class(data: ClassCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.create_class(user, data.class_name, data.track)


#  JOIN CLASS (Student)
@router.post("/join")
def join_class(data: ClassJoin, user=Depends(get_current_user), db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.join_class(user, data.class_code)


#  GET MY CLASSES (Instructor)
@router.get("/instructor")
def get_my_classes(user=Depends(get_current_user), db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.get_my_classes(user)


#  GET MY ENROLLMENT STATUS (Student)
@router.get("/status")
def get_enrollment_status(user=Depends(get_current_user), db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.get_enrollment_summary(user)


#  GET MY CLASSES (Student)
@router.get("/student")
def get_student_classes(user=Depends(get_current_user), db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.get_student_classes(user)


#  GET CLASS ANALYTICS (Instructor)
@router.get("/{class_id}/analytics")
def get_class_analytics(class_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.get_class_analytics(user, class_id)


#  GET SINGLE CLASS
@router.get("/{class_id}")
def get_class(class_id: str, db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.get_class_by_id(class_id)


#  UPDATE CLASS
@router.put("/{class_id}")
def update_class(
    class_id: str,
    data: ClassUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    class_service = ClassService(db)
    return class_service.update_class(
        user,
        class_id,
        class_name=data.class_name,
        track=data.track
    )


#  DELETE CLASS
@router.delete("/{class_id}")
def delete_class(class_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    class_service = ClassService(db)
    return class_service.delete_class(user, class_id)