from models.class_students_models import ClassStudent
from models.classes_models import Class
from models.users_models import User
from fastapi import HTTPException

class ClassStudentService:
    def __init__(self, session):
        self.session = session

    # ENROLL STUDENT INTO CLASS (Manual by Instructor)
    def add_student_to_class(self, user, class_id, student_id):
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can add students")

        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")

        student = self.session.query(User).filter_by(id=student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        existing = self.session.query(ClassStudent).filter_by(
            student_id=student_id,
            class_id=class_id
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Student already recorded in this class")

        enrollment = ClassStudent(
            student_id=student_id,
            class_id=class_id,
            status="approved" # Direct adds are pre-approved
        )

        self.session.add(enrollment)
        self.session.commit()

        return {"message": "Student added to class"}

    # APPROVE PENDING JOIN REQUEST
    def approve_student(self, user, class_id, student_id):
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can approve students")

        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
             raise HTTPException(status_code=404, detail="Class not found")
        
        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        enrollment = self.session.query(ClassStudent).filter_by(
            student_id=student_id,
            class_id=class_id
        ).first()

        if not enrollment:
            raise HTTPException(status_code=404, detail="Enrollment request not found")

        enrollment.status = "approved"
        self.session.commit()

        return {"message": "Student approved successfully"}

    # GET PENDING REQUESTS FOR A CLASS
    def get_pending_requests(self, user, class_id):
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can view requests")

        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        enrollments = self.session.query(ClassStudent).filter_by(
            class_id=class_id, 
            status="pending"
        ).all()

        return [
            {
                "id": e.student.id,
                "first_name": e.student.first_name,
                "last_name": e.student.last_name,
                "email": e.student.email,
                "track": e.student.track
            } for e in enrollments
        ]

    # GET ALL APPROVED STUDENTS IN A CLASS (For attendance list)
    def get_students_in_class(self, class_id):
        enrollments = self.session.query(ClassStudent).filter_by(
            class_id=class_id,
            status="approved"
        ).all()
        return [enrollment.student for enrollment in enrollments]

    # REMOVE STUDENT FROM CLASS
    def remove_student_from_class(self, user, class_id, student_id):
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can remove students")

        enrollment = self.session.query(ClassStudent).filter_by(
            student_id=student_id,
            class_id=class_id
        ).first()

        if not enrollment:
            raise HTTPException(status_code=404, detail="Student not in class")

        self.session.delete(enrollment)
        self.session.commit()

        return {"message": "Student removed from class"}