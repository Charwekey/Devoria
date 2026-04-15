from fastapi import HTTPException
from utils.connections import db_session
from models.projects import Project

class ProjectService:
    def __init__(self, session=db_session):
        self.session = session

    #  SUBMIT PROJECT
    def submit_project(self, user, title, description, github_link, demo_link):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can submit projects")

        project = Project(
            student_id=user.id,
            title=title,
            description=description,
            github_link=github_link,
            demo_link=demo_link
        )

        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)

        return project


    #  GET ALL PROJECTS (SHOWCASE)
    def get_all_projects(self):
        return self.session.query(Project).all()


    #  GET ONE PROJECT by id
    def get_project_by_id(self, project_id):
        project = self.session.query(Project).filter_by(id=project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    #GET ONE PROJECT by title
    def get_project_by_title(self, title):
        project = self.session.query(Project).filter_by(title=title).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    #  GET MY PROJECTS
    def get_my_projects(self, user):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students allowed")

        return self.session.query(Project).filter_by(student_id=user.id).all()


    #  UPDATE PROJECT
    def update_project(self, user, project_id, **kwargs):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can update")

        project = self.session.query(Project).filter_by(id=project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if project.student_id != user.id:
            raise HTTPException(status_code=403, detail="Not your project")

        allowed_fields = ["title", "description", "github_link", "demo_link"]

        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(project, key, value)

        self.session.commit()
        self.session.refresh(project)

        return project


    #  DELETE PROJECT
    def delete_project(self, user, project_id):

        project = self.session.query(Project).filter_by(id=project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if user.role == "student":
            if project.student_id != user.id:
                raise HTTPException(status_code=403, detail="Not allowed")

        elif user.role == "instructor":
            pass  # optional

        else:
            raise HTTPException(status_code=403, detail="Unauthorized")

        self.session.delete(project)
        self.session.commit()

        return {"message": "Project deleted successfully"}