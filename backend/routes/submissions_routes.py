from fastapi import APIRouter, Depends, Form, File, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.submissions_services import SubmissionService
from utils.dependancies import get_current_user, get_db
from typing import Optional

router = APIRouter(prefix="/submissions", tags=["Submissions"])

class SubmissionGrade(BaseModel):
    grade: str
    feedback: Optional[str] = None


#  SUBMIT ASSIGNMENT (Student)
@router.post("/")
def submit_assignment(
    assignment_id: str = Form(...),
    submission_link: str = Form(None),
    project_title: str = Form(None),
    project_description: str = Form(None),
    github_link: str = Form(None),
    demo_link: str = Form(None),
    file: UploadFile = File(None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submission_service = SubmissionService(db)
    return submission_service.submit_assignment(
        user, 
        assignment_id, 
        submission_link=submission_link,
        file=file,
        project_title=project_title,
        project_description=project_description,
        github_link=github_link,
        demo_link=demo_link
    )


#  GET ALL SUBMISSIONS (Instructor)
@router.get("/")
def get_all_submissions(user=Depends(get_current_user), db: Session = Depends(get_db)):
    submission_service = SubmissionService(db)
    return submission_service.get_all_submissions(user)


#  GET SUBMISSIONS BY ASSIGNMENT
@router.get("/assignment/{assignment_id}")
def get_submissions_by_assignment(
    assignment_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submission_service = SubmissionService(db)
    return submission_service.get_submissions_by_assignment(user, assignment_id)


#  GET MY SUBMISSIONS (Student)
@router.get("/me")
def get_my_submissions(user=Depends(get_current_user), db: Session = Depends(get_db)):
    submission_service = SubmissionService(db)
    return submission_service.get_my_submissions(user)


#  GRADE SUBMISSION (Instructor)
@router.put("/{submission_id}/grade")
def grade_submission(
    submission_id: str,
    data: SubmissionGrade,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submission_service = SubmissionService(db)
    return submission_service.grade_submission(user, submission_id, data.grade, data.feedback)


#  DELETE SUBMISSION
@router.delete("/{submission_id}")
def delete_submission(submission_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    submission_service = SubmissionService(db)
    return submission_service.delete_submission(user, submission_id)
