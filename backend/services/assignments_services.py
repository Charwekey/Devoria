from models.assignments import Assignment
from models.classes_models import Class
from fastapi import HTTPException


class AssignmentService:
    def __init__(self, session):
        self.session = session

    #  CREATE ASSIGNMENT
    def create_assignment(self, user, class_id, title, description, file_url, deadline):

        # Check role
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can create assignments")

        # Check class exists
        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")

        #  Check ownership
        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        # Prevent duplicate title 
        existing = self.session.query(Assignment).filter_by(
            title=title,
            class_id=class_id
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Assignment with this title already exists")

        # Create assignment
        assignment = Assignment(
            title=title,
            description=description,
            file_url=file_url,
            deadline=deadline,
            class_id=class_id
        )

        self.session.add(assignment)
        self.session.commit()
        self.session.refresh(assignment)

        return assignment


    # GET ALL ASSIGNMENTS
    def get_all_assignments(self):
        return self.session.query(Assignment).all()


    # GET ASSIGNMENT BY ID
    def get_assignment_by_id(self, assignment_id):

        assignment = self.session.query(Assignment).filter_by(id=assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        return assignment

    #Get assignment by title
    def get_assignment_by_title(self, title):
        assignment = self.session.query(Assignment).filter_by(title=title).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        return assignment

    # GET ASSIGNMENTS BY CLASS 
    def get_assignments_by_class(self, class_id):

        return self.session.query(Assignment).filter_by(class_id=class_id).all()


    # UPDATE ASSIGNMENT
    def update_assignment(self, user, assignment_id, **kwargs):

        # Check role
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can update assignments")

        #  Get assignment
        assignment = self.get_assignment_by_id(assignment_id)

        # Check ownership
        if assignment.classes.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your assignment")

        # Update fields
        allowed_fields = ["title", "description", "file_url", "deadline"]

        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(assignment, key, value)

        self.session.commit()
        self.session.refresh(assignment)

        return assignment


    # 🔹 DELETE ASSIGNMENT
    def delete_assignment(self, user, assignment_id):

        #  Check role
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can delete assignments")

        # Get assignment
        assignment = self.get_assignment_by_id(assignment_id)

        #  Check ownership
        if assignment.classes.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your assignment")

        # Delete
        self.session.delete(assignment)
        self.session.commit()

        return {"message": "Assignment deleted successfully"}