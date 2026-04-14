from models.projects import Project
from fastapi import HTTPException
from utils.connections import db_session


class ProjectService:
    def __init__(self, session=db_session):
        self.session = session

    #SUBMIT PROJECT
    def submit_project(self, user, title, description, github_link, demo_link):

        # Check role
        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can submit projects")

        #Create project
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

    #GET ALL PROJECTS (for showcase)
    def get_all_projects(self):
        return self.session.query(Project).all()

    #GET SINGLE PROJECT BY ID
    def get_project_by_id(self, project_id):
        project = self.session.query(Project).filter_by(id=project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    # GET PROJECTS BY STUDENT (very important 🔥)
    def get_my_projects(self, user):

        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can view their projects")

        return self.session.query(Project).filter_by(student_id=user.id).all()

    #UPDATE PROJECT
    def update_project(self, user, project_id, **kwargs):

        #Check role
        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students can update projects")

        # Get project
        project = self.session.query(Project).filter_by(id=project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check ownership
        if project.student_id != user.id:
            raise HTTPException(status_code=403, detail="You can only update your own project")

        #Update dynamically (clean 🔥)
        allowed_fields = ["title", "description", "github_link", "demo_link"]

        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(project, key, value)

        self.session.commit()
        self.session.refresh(project)

        return project

    # DELETE PROJECT
    def delete_project(self, user, project_id):

        #Get project
        project = self.session.query(Project).filter_by(id=project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        #Authorization
        if user.role == "student":
            if project.student_id != user.id:
                raise HTTPException(status_code=403, detail="Not allowed to delete this project")

        elif user.role == "instructor":
            # instructors can delete any project (optional rule)
            pass

        else:
            raise HTTPException(status_code=403, detail="Unauthorized")

        #Delete
        self.session.delete(project)
        self.session.commit()

        return {"message": "Project deleted successfully"}
        