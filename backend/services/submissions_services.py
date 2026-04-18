from models.submissions import Submission
from models.assignments import Assignment
from models.class_students_models import ClassStudent
from fastapi import HTTPException
from datetime import datetime

class SubmissionService:
    def __init__(self, session):
        self.session = session

    # STUDENT SUBMITS / RESUBMITS
    def submit_assignment(self, user, assignment_id, submission_link):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can submit assignments")

        assignment = self.session.query(Assignment).filter_by(id=assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

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

        # 🔁 RESUBMIT
        if existing:
            existing.submission_link = submission_link
            existing.score = None
            existing.feedback = None
            existing.graded_at = None

            self.session.commit()
            self.session.refresh(existing)
            return existing

        # 🆕 NEW SUBMISSION
        submission = Submission(
            assignment_id=assignment_id,
            student_id=user.id,
            submission_link=submission_link
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


    # GET MY SUBMISSIONS (student)
    def get_my_submissions(self, user):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students allowed")

        return self.session.query(Submission).filter_by(student_id=user.id).all()


    # GET SUBMISSIONS FOR ASSIGNMENT (instructor)
    def get_assignment_submissions(self, user, assignment_id):

        assignment = self.session.query(Assignment).filter_by(id=assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        if assignment.classes.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        return self.session.query(Submission).filter_by(assignment_id=assignment_id).all()


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