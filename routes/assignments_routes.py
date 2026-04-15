from fastapi import APIRouter, Depends
from services.assignments_services import AssignmentService
from utils.dependancies import get_current_user

router = APIRouter(prefix="/assignments", tags=["Assignments"])

assignment_service = AssignmentService()


#  CREATE ASSIGNMENT (Instructor)
@router.post("/")
def create_assignment(
    class_id: str,
    title: str,
    description: str,
    file_url: str,
    deadline: str,  
    user=Depends(get_current_user)
):
    return assignment_service.create_assignment(
        user,
        class_id,
        title,
        description,
        file_url,
        deadline
    )


#  GET ALL ASSIGNMENTS
@router.get("/")
def get_all_assignments():
    return assignment_service.get_all_assignments()


#  GET ASSIGNMENT BY ID
@router.get("/{assignment_id}")
def get_assignment(assignment_id: str):
    return assignment_service.get_assignment_by_id(assignment_id)


#GET ASSIGNMENT BY TITLE
@router.get("/{title}")
def get_assignment(title: str):
    return assignment_service.get_assignment_by_title(title)


#  GET ASSIGNMENTS BY CLASS
@router.get("/class/{class_id}")
def get_assignments_by_class(class_id: str):
    return assignment_service.get_assignments_by_class(class_id)


#  UPDATE ASSIGNMENT
@router.put("/{assignment_id}")
def update_assignment(
    assignment_id: str,
    title: str = None,
    description: str = None,
    file_url: str = None,
    deadline: str = None,
    user=Depends(get_current_user)
):
    return assignment_service.update_assignment(
        user,
        assignment_id,
        title=title,
        description=description,
        file_url=file_url,
        deadline=deadline
    )


#  DELETE ASSIGNMENT
@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: str, user=Depends(get_current_user)):
    return assignment_service.delete_assignment(user, assignment_id)