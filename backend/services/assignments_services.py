import os
import shutil
import uuid
import fitz  # PyMuPDF
from PIL import Image
from datetime import datetime, time
from models.assignments import Assignment
from models.classes_models import Class
from fastapi import HTTPException


class AssignmentService:
    def __init__(self, session):
        self.session = session
        self.static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
        self.upload_dir = os.path.join(self.static_dir, "uploads", "assignments")
        self.files_dir = os.path.join(self.upload_dir, "files")
        self.previews_dir = os.path.join(self.upload_dir, "previews")

        # Ensure directories exist
        os.makedirs(self.files_dir, exist_ok=True)
        os.makedirs(self.previews_dir, exist_ok=True)

    #  CREATE ASSIGNMENT
    def create_assignment(self, user, class_id, title, description, file, deadline, is_final_project=0):

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

        # Handle File Upload
        file_url = None
        preview_url = None

        if file:
            file_extension = os.path.splitext(file.filename)[1]
            unique_name = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(self.files_dir, unique_name)

            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_url = f"/static/uploads/assignments/files/{unique_name}"

            # Generate Preview
            preview_name = f"{uuid.uuid4()}.png"
            preview_path = os.path.join(self.previews_dir, preview_name)

            try:
                if file_extension.lower() == ".pdf":
                    # Generate PDF Preview (first page)
                    doc = fitz.open(file_path)
                    if len(doc) > 0:
                        page = doc.load_page(0)
                        pix = page.get_pixmap()
                        pix.save(preview_path)
                    doc.close()
                    preview_url = f"/static/uploads/assignments/previews/{preview_name}"
                
                elif file_extension.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
                    # Generate Image Preview (resized)
                    with Image.open(file_path) as img:
                        img.thumbnail((400, 400))
                        img.save(preview_path)
                    preview_url = f"/static/uploads/assignments/previews/{preview_name}"
            except Exception as e:
                print(f"Failed to generate preview: {e}")
                # We don't fail the whole request if preview fails
                preview_url = None

        # Normalizing deadline (set to end of day if only date is provided)
        clean_deadline = deadline
        if isinstance(deadline, str) and deadline:
            try:
                # If it's just YYYY-MM-DD
                dt = datetime.strptime(deadline, "%Y-%m-%d")
                clean_deadline = datetime.combine(dt.date(), time(23, 59, 59))
            except ValueError:
                # If it's already a full ISO string, keep as is
                pass

        # Create assignment
        assignment = Assignment(
            title=title,
            description=description,
            file_url=file_url,
            preview_url=preview_url,
            deadline=clean_deadline,
            class_id=class_id,
            is_final_project=is_final_project
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
        allowed_fields = ["title", "description", "file_url", "deadline", "is_final_project"]

        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                if key == "deadline" and isinstance(value, str) and value:
                    try:
                        dt = datetime.strptime(value, "%Y-%m-%d")
                        value = datetime.combine(dt.date(), time(23, 59, 59))
                    except ValueError:
                        pass
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
