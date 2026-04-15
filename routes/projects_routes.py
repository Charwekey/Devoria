from fastapi import APIRouter, Depends
from services.projects_services import ProjectService
from utils.dependancies import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

project_service = ProjectService()


#  SUBMIT PROJECT
@router.post("/")
def submit_project(
    title: str,
    description: str,
    github_link: str,
    demo_link: str,
    user=Depends(get_current_user)
):
    return project_service.submit_project(
        user, title, description, github_link, demo_link
    )


#  GET ALL PROJECTS (SHOWCASE PAGE)
@router.get("/")
def get_all_projects():
    return project_service.get_all_projects()


#  GET SINGLE PROJECT by id
@router.get("/{project_id}")
def get_project(project_id: str):
    return project_service.get_project_by_id(project_id)

#  GET SINGLE PROJECT by title
@router.get("/{title}")
def get_project(title: str):
    return project_service.get_project_by_title(title)

#  GET MY PROJECTS
@router.get("/me")
def get_my_projects(user=Depends(get_current_user)):
    return project_service.get_my_projects(user)


#  UPDATE PROJECT
@router.put("/{project_id}")
def update_project(
    project_id: str,
    title: str = None,
    description: str = None,
    github_link: str = None,
    demo_link: str = None,
    user=Depends(get_current_user)
):
    return project_service.update_project(
        user,
        project_id,
        title=title,
        description=description,
        github_link=github_link,
        demo_link=demo_link
    )


#  DELETE PROJECT
@router.delete("/{project_id}")
def delete_project(project_id: str, user=Depends(get_current_user)):
    return project_service.delete_project(user, project_id)