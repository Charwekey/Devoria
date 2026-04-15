from models.class_students_models import ClassStudent
from models.classes_models import Class
from models.users_models import User
from fastapi import HTTPException
from utils.connections import db_session


class ClassStudentService:
    def __init__(self, session=db_session):
        self.session = session

    # ENROLL STUDENT INTO CLASS
    def add_student_to_class(self, user, class_id, student_id):

        # Only instructor can manually add
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can add students")

        # Check class exists
        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")

        # Check student exists
        student = self.session.query(Users).filter_by(id=student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Prevent duplicate
        existing = self.session.query(ClassStudent).filter_by(
            student_id=student_id,
            class_id=class_id
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Student already in class")

        enrollment = ClassStudent(
            student_id=student_id,
            class_id=class_id
        )

        self.session.add(enrollment)
        self.session.commit()

        return {"message": "Student added to class"}


    # GET ALL STUDENTS IN A CLASS
    def get_students_in_class(self, class_id):

        enrollments = self.session.query(ClassStudent).filter_by(class_id=class_id).all()

        return [enrollment.student for enrollment in enrollments]


    # GET ALL CLASSES FOR A STUDENT
    def get_classes_for_student(self, student_id):

        enrollments = self.session.query(ClassStudent).filter_by(student_id=student_id).all()

        return [enrollment.classes for enrollment in enrollments]


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