from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.assignments_services import AssignmentService
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/assignments", tags=["Assignments"])

class AssignmentCreate(BaseModel):
    class_id: str
    title: str
    description: str
    file_url: str
    deadline: str

class AssignmentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    file_url: str | None = None
    deadline: str | None = None

#  CREATE ASSIGNMENT (Instructor)
@router.post("/")
def create_assignment(
    data: AssignmentCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment_service = AssignmentService(db)
    return assignment_service.create_assignment(
        user,
        data.class_id,
        data.title,
        data.description,
        data.file_url,
        data.deadline
    )

#  GET ALL ASSIGNMENTS
@router.get("/")
def get_all_assignments(db: Session = Depends(get_db)):
    assignment_service = AssignmentService(db)
    return assignment_service.get_all_assignments()


#  GET ASSIGNMENT BY ID
@router.get("/{assignment_id}")
def get_assignment(assignment_id: str, db: Session = Depends(get_db)):
    assignment_service = AssignmentService(db)
    return assignment_service.get_assignment_by_id(assignment_id)


#GET ASSIGNMENT BY TITLE
@router.get("/title/{title}")
def get_assignment_by_title(title: str, db: Session = Depends(get_db)):
    assignment_service = AssignmentService(db)
    return assignment_service.get_assignment_by_title(title)


#  GET ASSIGNMENTS BY CLASS
@router.get("/class/{class_id}")
def get_assignments_by_class(class_id: str, db: Session = Depends(get_db)):
    assignment_service = AssignmentService(db)
    return assignment_service.get_assignments_by_class(class_id)


#  UPDATE ASSIGNMENT
@router.put("/{assignment_id}")
def update_assignment(
    assignment_id: str,
    data: AssignmentUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment_service = AssignmentService(db)
    return assignment_service.update_assignment(
        user,
        assignment_id,
        title=data.title,
        description=data.description,
        file_url=data.file_url,
        deadline=data.deadline
    )


#  DELETE ASSIGNMENT
@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    assignment_service = AssignmentService(db)
    return assignment_service.delete_assignment(user, assignment_id)