from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/instructor", tags=["Instructor"])

class EmailWhitelistRequest(BaseModel):
    email: str

class StudentUpdateRequest(BaseModel):
    student_id: str
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    password: str | None = None

def verify_instructor(user = Depends(get_current_user)):
    if user.role != "instructor":
        raise HTTPException(status_code=403, detail="Instructor privileges required")
    return user

@router.post("/whitelist-student")
def whitelist_student(data: EmailWhitelistRequest, instructor = Depends(verify_instructor), db: Session = Depends(get_db)):
    from services.instructor_services import InstructorService
    instructor_service = InstructorService(db)
    return instructor_service.whitelist_student(instructor, data.email)

@router.post("/invite-assistant")
def invite_assistant(data: EmailWhitelistRequest, instructor = Depends(verify_instructor), db: Session = Depends(get_db)):
    from services.instructor_services import InstructorService
    instructor_service = InstructorService(db)
    return instructor_service.invite_assistant(instructor, data.email)

@router.get("/my-whitelist")
def get_my_whitelist(instructor = Depends(verify_instructor), db: Session = Depends(get_db)):
    from services.instructor_services import InstructorService
    instructor_service = InstructorService(db)
    return instructor_service.get_my_staff_and_students(instructor)

@router.delete("/whitelist/{email}")
def remove_from_whitelist(email: str, instructor = Depends(verify_instructor), db: Session = Depends(get_db)):
    from services.instructor_services import InstructorService
    instructor_service = InstructorService(db)
    return instructor_service.remove_from_whitelist(instructor, email)

@router.put("/update-student")
def update_student(data: StudentUpdateRequest, instructor = Depends(verify_instructor), db: Session = Depends(get_db)):
    from services.instructor_services import InstructorService
    instructor_service = InstructorService(db)
    # Convert Pydantic to Dict excluding student_id
    update_data = data.dict(exclude={"student_id"}, exclude_unset=True)
    return instructor_service.update_student(instructor, data.student_id, update_data)

@router.delete("/delete-student/{student_id}")
def delete_student(student_id: str, instructor = Depends(verify_instructor), db: Session = Depends(get_db)):
    from services.instructor_services import InstructorService
    instructor_service = InstructorService(db)
    return instructor_service.delete_student(instructor, student_id)
