from models.classes_models import Class
from models.class_students_models import ClassStudent
from models.attendance import Attendance
from models.submissions import Submission
from models.assignments import Assignment
from fastapi import HTTPException
import random
import string

class ClassService:
    def __init__(self, session):
        self.session = session

    # ... [skipping generate_class_code to find index] ...

    # GET CLASS ANALYTICS (For Instructor Environment)
    def get_class_analytics(self, user, class_id):
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can view class analytics")

        class_obj = self.get_class_by_id(class_id)
        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        # 1. Get all approved students
        students = self.session.query(ClassStudent).filter_by(
            class_id=class_id, 
            status="approved"
        ).all()

        # 2. Get all assignments for this class
        assignments = self.session.query(Assignment).filter_by(class_id=class_id).all()
        total_assignments = len(assignments)

        # 3. Get total attendance sessions for this class (approximate by distinct dates in attendance table for this class)
        # In a more robust system, we'd have a 'Sessions' table. For now, we count unique dates.
        total_sessions = self.session.query(Attendance.date).filter_by(class_id=class_id).distinct().count()
        if total_sessions == 0: total_sessions = 1 # Avoid division by zero

        analytics_data = []

        for enrollment in students:
            student = enrollment.student
            
            # Attendance Rate
            present_count = self.session.query(Attendance).filter_by(
                student_id=student.id,
                class_id=class_id,
                status="present"
            ).count()
            attendance_rate = (present_count / total_sessions) * 100

            # Grade Average
            # Get all submissions by this student for assignments in this class
            assignment_ids = [a.id for a in assignments]
            submissions = self.session.query(Submission).filter(
                Submission.student_id == student.id,
                Submission.assignment_id.in_(assignment_ids)
            ).all()

            sum_scores = sum([float(s.score) for s in submissions if s.score is not None])
            
            # User suggested "Assignment completion basically the average"
            # We treat total_assignments as the denominator to account for 0s on unskipped work
            grade_average = (sum_scores / total_assignments) if total_assignments > 0 else 0

            analytics_data.append({
                "student_id": student.id,
                "name": f"{student.first_name} {student.last_name}",
                "track": student.track,
                "attendance_rate": round(min(attendance_rate, 100), 1),
                "grade_average": round(min(grade_average, 100), 1),
                "submission_count": len(submissions)
            })

        return {
            "class_name": class_obj.class_name,
            "total_students": len(students),
            "total_assignments": total_assignments,
            "students": analytics_data
        }


    # GET ENROLLMENT SUMMARY (For UI logic)

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

        # CASE INSENSITIVE CODE MATCHING
        class_obj = self.session.query(Class).filter(Class.class_code == class_code.upper()).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Invalid class code")

        # Check if already enrolled
        existing = self.session.query(ClassStudent).filter_by(
            student_id=user.id,
            class_id=class_obj.id
        ).first()

        if existing:
            return {"message": "Already applied to this class", "status": existing.status}

        enrollment = ClassStudent(
            student_id=user.id,
            class_id=class_obj.id,
            status="pending"
        )

        self.session.add(enrollment)
        self.session.commit()

        return {"message": "Application sent! Please wait for instructor approval.", "status": "pending"}


    # GET CLASSES FOR INSTRUCTOR
    def get_my_classes(self, user):
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can view their classes")

        return self.session.query(Class).filter_by(instructor_id=user.id).all()


    # GET CLASSES FOR STUDENT (Approved ONLY)
    def get_student_classes(self, user):
        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can view classes")

        enrollments = self.session.query(ClassStudent).filter_by(
            student_id=user.id, 
            status="approved"
        ).all()

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


    # GET ENROLLMENT SUMMARY (For UI logic)
    def get_enrollment_summary(self, user):
        if user.role != "student":
             return {"has_approved": False, "has_pending": False}
        
        pending_count = self.session.query(ClassStudent).filter_by(
            student_id=user.id,
            status="pending"
        ).count()
        
        approved_count = self.session.query(ClassStudent).filter_by(
            student_id=user.id,
            status="approved"
        ).count()
        
        return {
            "has_pending": pending_count > 0,
            "has_approved": approved_count > 0
        }


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