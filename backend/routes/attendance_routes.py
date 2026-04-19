from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.attendance_services import AttendanceService
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/attendance", tags=["Attendance"])

class AttendanceCreate(BaseModel):
    class_id: str
    student_id: str
    status: str
    slot: int | None = None

#  MARK ATTENDANCE
@router.post("/")
def mark_attendance(
    data: AttendanceCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attendance_service = AttendanceService(db)
    return attendance_service.mark_attendance(
        user, 
        data.class_id, 
        data.student_id, 
        data.status,
        slot=data.slot
    )


#  GET CLASS ATTENDANCE (Instructor)
@router.get("/class/{class_id}")
def get_class_attendance(class_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    attendance_service = AttendanceService(db)
    return attendance_service.get_class_attendance(user, class_id)


#  GET MY ATTENDANCE (Student)
@router.get("/me")
def get_my_attendance(user=Depends(get_current_user), db: Session = Depends(get_db)):
    attendance_service = AttendanceService(db)
    return attendance_service.get_my_attendance(user)


#  GET STUDENT ATTENDANCE IN CLASS
@router.get("/class/{class_id}/student/{student_id}")
def get_student_attendance(class_id: str, student_id: str, db: Session = Depends(get_db)):
    attendance_service = AttendanceService(db)
    return attendance_service.get_student_attendance_in_class(class_id, student_id)


#  DELETE ATTENDANCE
@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    attendance_service = AttendanceService(db)
    return attendance_service.delete_attendance(user, attendance_id)