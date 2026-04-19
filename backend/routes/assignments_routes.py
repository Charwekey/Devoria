from fastapi import APIRouter, Depends, Form, File, UploadFile
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
    is_final_project: int = 0

class AssignmentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    file_url: str | None = None
    deadline: str | None = None
    is_final_project: int | None = None

#  CREATE ASSIGNMENT (Instructor)
@router.post("/")
def create_assignment(
    class_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    deadline: str = Form(None),
    is_final_project: int = Form(0),
    file: UploadFile = File(None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment_service = AssignmentService(db)
    return assignment_service.create_assignment(
        user,
        class_id=class_id,
        title=title,
        description=description,
        file=file,
        deadline=deadline,
        is_final_project=is_final_project
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
        **data.dict(exclude_none=True)
    )


#  DELETE ASSIGNMENT
@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    assignment_service = AssignmentService(db)
    return assignment_service.delete_assignment(user, assignment_id)
