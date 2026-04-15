from models.classes_models import Class
from models.class_students_models import ClassStudent
from fastapi import HTTPException
from utils.connections import db_session
import random
import string


class ClassService:
    def __init__(self, session=db_session):
        self.session = session

    # GENERATE UNIQUE CLASS CODE
    def generate_class_code(self, length=6):
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
            exists = self.session.query(Class).filter_by(class_code=code).first()
            if not exists:
                return code


    # CREATE CLASS (Instructor)
    def create_class(self, user, class_name, track):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can create classes")

        class_code = self.generate_class_code()

        new_class = Class(
            class_name=class_name,
            track=track,
            class_code=class_code,
            instructor_id=user.id
        )

        self.session.add(new_class)
        self.session.commit()
        self.session.refresh(new_class)

        return new_class


    # JOIN CLASS (Student)
    def join_class(self, user, class_code):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can join classes")

        class_obj = self.session.query(Class).filter_by(class_code=class_code).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Invalid class code")

        # Check if already enrolled
        existing = self.session.query(ClassStudent).filter_by(
            student_id=user.id,
            class_id=class_obj.id
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Already joined this class")

        enrollment = ClassStudent(
            student_id=user.id,
            class_id=class_obj.id
        )

        self.session.add(enrollment)
        self.session.commit()

        return {"message": "Joined class successfully"}


    # GET CLASSES FOR INSTRUCTOR
    def get_my_classes(self, user):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can view their classes")

        return self.session.query(Class).filter_by(instructor_id=user.id).all()


    # GET CLASSES FOR STUDENT
    def get_student_classes(self, user):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can view classes")

        enrollments = self.session.query(ClassStudent).filter_by(student_id=user.id).all()

        # IMPORTANT: matches your relationship name "classes"
        return [enrollment.classes for enrollment in enrollments]


    # GET SINGLE CLASS
    def get_class_by_id(self, class_id):

        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")

        return class_obj


    # UPDATE CLASS
    def update_class(self, user, class_id, **kwargs):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can update classes")

        class_obj = self.get_class_by_id(class_id)

        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        allowed_fields = ["class_name", "track"]

        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(class_obj, key, value)

        self.session.commit()
        self.session.refresh(class_obj)

        return class_obj


    # DELETE CLASS
    def delete_class(self, user, class_id):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can delete classes")

        class_obj = self.get_class_by_id(class_id)

        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        self.session.delete(class_obj)
        self.session.commit()

        return {"message": "Class deleted successfully"}