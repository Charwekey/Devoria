from fastapi import APIRouter, Depends
from services.submissions_services import SubmissionService
from utils.dependancies import get_current_user

router = APIRouter(prefix="/submissions", tags=["Submissions"])

submission_service = SubmissionService()


#SUBMIT
@router.post("/")
def submit_assignment(assignment_id: str, submission_link: str, user=Depends(get_current_user)):
    return submission_service.submit_assignment(user, assignment_id, submission_link)


#GRADE
@router.post("/grade/{submission_id}")
def grade_submission(submission_id: str, score: int, feedback: str = None, user=Depends(get_current_user)):
    return submission_service.grade_submission(user, submission_id, score, feedback)


#GET MY SUBMISSIONS
@router.get("/me")
def get_my_submissions(user=Depends(get_current_user)):
    return submission_service.get_my_submissions(user)


#GET BY ASSIGNMENT
@router.get("/assignment/{assignment_id}")
def get_assignment_submissions(assignment_id: str, user=Depends(get_current_user)):
    return submission_service.get_assignment_submissions(user, assignment_id)


#UPDATE
@router.put("/{submission_id}")
def update_submission(submission_id: str, new_link: str, user=Depends(get_current_user)):
    return submission_service.update_submission(user, submission_id, new_link)


#DELETE
@router.delete("/{submission_id}")
def delete_submission(submission_id: str, user=Depends(get_current_user)):
    return submission_service.delete_submission(user, submission_id)