from models.submissions import Submission
from models.assignments import Assignment
from models.class_students_model import ClassStudent
from fastapi import HTTPException
from datetime import datetime

class SubmissionService:
    def __init__(self, session=db_session):
        self.session = session

    # STUDENT SUBMITS ASSIGNMENT
    def submit_assignment(self, user, assignment_id, submission_link):

        # 1Check role
        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can submit assignments")

        #  Check assignment exists
        assignment = self.session.query(Assignment).filter_by(id=assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        # Check student is enrolled in class
        enrolled = self.session.query(ClassStudent).filter_by(
            student_id=user.id,
            class_id=assignment.class_id
        ).first()

        if not enrolled:
            raise HTTPException(status_code=403, detail="You are not enrolled in this class")

        #  Check if submission already exists
        existing_submission = self.session.query(Submission).filter_by(
            assignment_id=assignment_id,
            student_id=student.id
        ).first()

        # RESUBMISSION LOGIC (better than blocking)
        if existing_submission:
            existing_submission.submission_link = submission_link
            existing_submission.score = None
            existing_submission.feedback = None
            existing_submission.graded_at = None

            self.session.commit()
            self.session.refresh(existing_submission)

            return existing_submission

        # Create new submission
        submission = Submission(
            assignment_id=assignment_id,
            student_id=user.id,
            submission_link=submission_link,
            score=None,
            feedback=None,
            graded_at=None
        )

        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)

        return submission

    #  INSTRUCTOR GRADES SUBMISSION
    def grade_submission(self, instructor, submission_id, score, feedback=None):

        #  Check role
        if instructor.role != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can grade submissions")

        #  Get submission
        submission = self.session.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        # Check instructor owns the class
        assignment = submission.assignment
        if assignment.class_.instructor_id != instructor.id:
            raise HTTPException(status_code=403, detail="You are not allowed to grade this submission")

        # Assign score + feedback
        submission.score = score
        submission.feedback = feedback
        submission.graded_at = datetime.utcnow()

        self.session.commit()
        self.session.refresh(submission)

        return submission

    # GET STUDENT SUBMISSIONS
    def get_student_submissions(self, user):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can view their submissions")

        return self.session.query(Submission).filter_by(student_id=user.id).all()

    #  GET SUBMISSIONS FOR AN ASSIGNMENT (Instructor view)
    def get_assignment_submissions(self, instructor, assignment_id):

        assignment = self.session.query(Assignment).filter_by(id=assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        if assignment.classes.instructor_id != instructor.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        return self.session.query(Submission).filter_by(assignment_id=assignment_id).all()




     
    def update_submission(self, user, submission_id, new_link):
        if student.role != "student":
            raise HTTPException(status_code=403, detail="Only students can update submissions")

    # Get submission
        submission = self.session.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

    # Check ownership
       if submission.student_id != student.id:
        raise HTTPException(status_code=403, detail="You can only update your own submission")

    # NEW RULE: Cannot update if already graded
       if submission.score is not None:
        raise HTTPException(
            status_code=400,
            detail="Cannot update submission after it has been graded"
        )

    # Update submission
      submission.submission_link = new_lin
      self.session.commit()
      self.session.refresh(submission)

      return submission

    def delete_submission(self, user, submission_id):
        # Get submission
        submission = self.session.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

    # Allow only:
    # - owner (student)
    # - instructor of the class

        if user.role == "student":
            if submission.student_id != user.id:
                raise HTTPException(status_code=403, detail="Not allowed to delete this submission")

        elif user.role == "instructor":
            assignment = submission.assignment
            if assignment.class_student.instructor_id != user.id:
                raise HTTPException(status_code=403, detail="Not your class")

        else:
            raise HTTPException(status_code=403, detail="Unauthorized")

    #  Delete
        self.session.delete(submission)
        self.session.commit()

        return {"message": "Submission deleted successfully"}