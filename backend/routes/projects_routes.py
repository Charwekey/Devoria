from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.projects_services import ProjectService
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectCreate(BaseModel):
    title: str
    description: str
    github_link: str
    demo_link: str

class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    github_link: str | None = None
    demo_link: str | None = None

#  SUBMIT PROJECT
@router.post("/")
def submit_project(
    data: ProjectCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    return project_service.submit_project(
        user, data.title, data.description, data.github_link, data.demo_link
    )


#  GET ALL PROJECTS (SHOWCASE PAGE)
@router.get("/")
def get_all_projects(db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.get_all_projects()


#  GET MY PROJECTS
@router.get("/me")
def get_my_projects(user=Depends(get_current_user), db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.get_my_projects(user)

#  GET SINGLE PROJECT by id
@router.get("/{project_id}")
def get_project(project_id: str, db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.get_project_by_id(project_id)



#  UPDATE PROJECT
@router.put("/{project_id}")
def update_project(
    project_id: str,
    data: ProjectUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    return project_service.update_project(
        user,
        project_id,
        title=data.title,
        description=data.description,
        github_link=data.github_link,
        demo_link=data.demo_link
    )


#  DELETE PROJECT
@router.delete("/{project_id}")
def delete_project(project_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.delete_project(user, project_id)