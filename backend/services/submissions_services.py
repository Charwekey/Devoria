from sqlalchemy.orm import joinedload, Session
import os
import shutil
import uuid
from models.submissions import Submission
from models.assignments import Assignment
from models.classes_models import Class
from models.projects import Project
from models.class_students_models import ClassStudent
from fastapi import HTTPException
from datetime import datetime
from sqlalchemy.orm import joinedload

class SubmissionService:
    def __init__(self, session):
        self.session = session
        self.static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
        self.upload_dir = os.path.join(self.static_dir, "uploads", "submissions")
        os.makedirs(self.upload_dir, exist_ok=True)

    # STUDENT SUBMITS / RESUBMITS
    def submit_assignment(self, user, assignment_id, submission_link=None, file=None, **kwargs):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can submit assignments")

        assignment = self.session.query(Assignment).filter_by(id=assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        # 🛑 DEADLINE ENFORCEMENT
        if assignment.deadline and datetime.utcnow() > assignment.deadline:
            raise HTTPException(
                status_code=400, 
                detail=f"Submission closed. Deadline was {assignment.deadline.strftime('%Y-%m-%d %H:%M:%S')}"
            )

        # Check enrollment
        enrolled = self.session.query(ClassStudent).filter_by(
            student_id=user.id,
            class_id=assignment.class_id
        ).first()

        if not enrolled:
            raise HTTPException(status_code=403, detail="You are not enrolled in this class")

        # Check existing submission
        existing = self.session.query(Submission).filter_by(
            assignment_id=assignment_id,
            student_id=user.id
        ).first()

        # Handle File Upload
        submission_file_url = None
        if file:
            file_extension = os.path.splitext(file.filename)[1]
            unique_name = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(self.upload_dir, unique_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            submission_file_url = f"/static/uploads/submissions/{unique_name}"

        # Logic for Final Project mapping
        if assignment.is_final_project == 1:
            project_title = kwargs.get("project_title")
            project_description = kwargs.get("project_description")
            github_link = kwargs.get("github_link")
            demo_link = kwargs.get("demo_link")

            if not github_link:
                raise HTTPException(status_code=400, detail="GitHub link is required for Final Project")

            # 🔁 Update logic (If it exists, we update the showcase project too)
            if existing:
                if existing.score is not None:
                    raise HTTPException(status_code=400, detail="Cannot resubmit a graded assignment")
                
                existing.project_title = project_title
                existing.project_description = project_description
                existing.github_link = github_link
                existing.demo_link = demo_link
                existing.submission_file_url = submission_file_url if submission_file_url else existing.submission_file_url
                existing.submitted_at = datetime.utcnow()

                # Sync to Showcase Project
                # We find the project created by this submission
                # (Simple check: title + student + assignment class? Or we just create a new one? 
                # Better to find existing one and update it)
                project = self.session.query(Project).filter_by(
                    student_id=user.id,
                    title=project_title # Might not be reliable if they renamed it.
                ).first()
                if project:
                    project.title = project_title
                    project.description = project_description
                    project.github_link = github_link
                    project.demo_link = demo_link
                else:
                    # Create new if not found
                    new_proj = Project(
                        title=project_title or assignment.title,
                        description=project_description or assignment.description,
                        github_link=github_link,
                        demo_link=demo_link,
                        student_id=user.id
                    )
                    self.session.add(new_proj)
                
                self.session.commit()
                self.session.refresh(existing)
                return existing

            # 🆕 Create new submission & project record
            submission = Submission(
                assignment_id=assignment_id,
                student_id=user.id,
                project_title=project_title or assignment.title,
                project_description=project_description or assignment.description,
                github_link=github_link,
                demo_link=demo_link,
                submission_file_url=submission_file_url,
                submitted_at=datetime.utcnow()
            )
            
            # Showcase Creation
            new_proj = Project(
                title=project_title or assignment.title,
                description=project_description or assignment.description,
                github_link=github_link,
                demo_link=demo_link,
                student_id=user.id
            )

            self.session.add(submission)
            self.session.add(new_proj)
            self.session.commit()
            self.session.refresh(submission)
            return submission


        # 🔁 NORMAL RESUBMIT (Replace existing)
        if existing:
            if existing.score is not None:
                raise HTTPException(status_code=400, detail="Cannot resubmit a graded assignment")
            
            existing.submission_link = submission_link
            existing.submission_file_url = submission_file_url if submission_file_url else existing.submission_file_url
            existing.score = None
            existing.feedback = None
            existing.graded_at = None
            existing.submitted_at = datetime.utcnow()

            self.session.commit()
            self.session.refresh(existing)
            return existing

        # 🆕 NORMAL NEW SUBMISSION
        submission = Submission(
            assignment_id=assignment_id,
            student_id=user.id,
            submission_link=submission_link,
            submission_file_url=submission_file_url,
            submitted_at=datetime.utcnow()
        )

        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)

        return submission


    # INSTRUCTOR GRADES
    def grade_submission(self, user, submission_id, score, feedback=None):

        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can grade")

        submission = self.session.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        assignment = submission.assignment

        # Check ownership
        if assignment.classes.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not your class")

        submission.score = score
        submission.feedback = feedback
        submission.graded_at = datetime.utcnow()

        self.session.commit()
        self.session.refresh(submission)

        return submission


    # GET ALL SUBMISSIONS (Instructor)
    def get_all_submissions(self, user):
        if user.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can view all submissions")
        
        from models.classes_models import Class
        return self.session.query(Submission).options(
            joinedload(Submission.student),
            joinedload(Submission.assignment)
        ).join(Assignment).join(Class).filter(Class.instructor_id == user.id).all()


    # GET MY SUBMISSIONS (student)
    def get_my_submissions(self, user):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students allowed")

        return self.session.query(Submission).options(
            joinedload(Submission.student),
            joinedload(Submission.assignment)
        ).filter_by(student_id=user.id).all()


    # GET SUBMISSIONS BY ASSIGNMENT (instructor)
    def get_submissions_by_assignment(self, user, assignment_id):

        assignment = self.session.query(Assignment).filter_by(id=assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        if assignment.classes.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        return self.session.query(Submission).options(
            joinedload(Submission.student),
            joinedload(Submission.assignment)
        ).filter_by(assignment_id=assignment_id).all()


    # UPDATE SUBMISSION (ONLY BEFORE GRADING)
    def update_submission(self, user, submission_id, new_link):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can update")

        submission = self.session.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        if submission.student_id != user.id:
            raise HTTPException(status_code=403, detail="Not your submission")

        if submission.score is not None:
            raise HTTPException(
                status_code=400,
                detail="Cannot update after grading"
            )

        submission.submission_link = new_link

        self.session.commit()
        self.session.refresh(submission)

        return submission


    # DELETE SUBMISSION
    def delete_submission(self, user, submission_id):

        submission = self.session.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        # Student deletes own
        if user.role == "student":
            if submission.student_id != user.id:
                raise HTTPException(status_code=403, detail="Not allowed")
            
            # Google Classroom style: Cannot un-submit once graded
            if submission.score is not None:
                raise HTTPException(status_code=400, detail="Cannot un-submit a graded assignment")

        # Instructor deletes in their class
        elif user.role == "instructor":
            assignment = submission.assignment
            if assignment.classes.instructor_id != user.id:
                raise HTTPException(status_code=403, detail="Not your class")

        else:
            raise HTTPException(status_code=403, detail="Unauthorized")

        self.session.delete(submission)
        self.session.commit()

        return {"message": "Submission deleted"}
