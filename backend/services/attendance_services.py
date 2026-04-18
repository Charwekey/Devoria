from models.attendance import Attendance
from models.classes_models import Class
from models.class_students_models import ClassStudent
from fastapi import HTTPException
from datetime import datetime

class AttendanceService:
    def __init__(self, session):
        self.session = session

    #  MARK ATTENDANCE (Instructor)
    def mark_attendance(self, user, class_id, student_id, status):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can mark attendance")

        # Check class
        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")

        # Check ownership
        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        # Check student enrolled
        enrolled = self.session.query(ClassStudent).filter_by(
            student_id=student_id,
            class_id=class_id
        ).first()

        if not enrolled:
            raise HTTPException(status_code=403, detail="Student not in this class")

        # Prevent duplicate for same day
        today = datetime.utcnow().date()

        existing = self.session.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.class_id == class_id,
            Attendance.date >= datetime(today.year, today.month, today.day)
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Attendance already marked today")

        attendance = Attendance(
            class_id=class_id,
            student_id=student_id,
            date=datetime.utcnow(),
            status=status
        )

        self.session.add(attendance)
        self.session.commit()
        self.session.refresh(attendance)

        return attendance


    # GET ATTENDANCE FOR A CLASS (Instructor)
    def get_class_attendance(self, user, class_id):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can view class attendance")

        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")

        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        return self.session.query(Attendance).filter_by(class_id=class_id).all()


    # GET STUDENT ATTENDANCE (Student view)
    def get_my_attendance(self, user):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can view their attendance")

        return self.session.query(Attendance).filter_by(student_id=user.id).all()


    # GET ATTENDANCE FOR A STUDENT IN A CLASS
    def get_student_attendance_in_class(self, class_id, student_id):

        return self.session.query(Attendance).filter_by(
            class_id=class_id,
            student_id=student_id
        ).all()


    # DELETE ATTENDANCE (optional admin control)
    def delete_attendance(self, user, attendance_id):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can delete attendance")

        attendance = self.session.query(Attendance).filter_by(id=attendance_id).first()
        if not attendance:
            raise HTTPException(status_code=404, detail="Attendance not found")

        self.session.delete(attendance)
        self.session.commit()

        return {"message": "Attendance deleted successfully"}