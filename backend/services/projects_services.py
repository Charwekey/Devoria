from sqlalchemy.orm import joinedload
from fastapi import HTTPException
from models.projects import Project, ProjectLike

class ProjectService:
    def __init__(self, session):
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
    def get_all_projects(self, current_user=None, ip_address=None):
        projects = self.session.query(Project).options(
            joinedload(Project.student),
            joinedload(Project.likes)
        ).all()
        
        results = []
        for p in projects:
            has_liked = False
            if current_user:
                has_liked = any(l.student_id == current_user.id for l in p.likes)
            elif ip_address:
                has_liked = any(l.ip_address == ip_address and l.student_id is None for l in p.likes)

            results.append({
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "github_link": p.github_link,
                "demo_link": p.demo_link,
                "student_id": p.student_id,
                "student": p.student,
                "likes_count": len(p.likes),
                "has_liked": has_liked
            })
        return results

    #  GET ONE PROJECT by id
    def get_project_by_id(self, project_id, current_user=None, ip_address=None):
        project = self.session.query(Project).options(
            joinedload(Project.student),
            joinedload(Project.likes)
        ).filter_by(id=project_id).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        has_liked = False
        if current_user:
            has_liked = any(l.student_id == current_user.id for l in project.likes)
        elif ip_address:
            has_liked = any(l.ip_address == ip_address and l.student_id is None for l in project.likes)

        return {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "github_link": project.github_link,
            "demo_link": project.demo_link,
            "student_id": project.student_id,
            "student": project.student,
            "likes_count": len(project.likes),
            "has_liked": has_liked
        }

    #  GET MY PROJECTS
    def get_my_projects(self, user):
        if user.role != "student":
            raise HTTPException(status_code=403, detail="Only students allowed")

        projects = self.session.query(Project).options(
            joinedload(Project.student),
            joinedload(Project.likes)
        ).filter_by(student_id=user.id).all()

        results = []
        for p in projects:
            results.append({
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "github_link": p.github_link,
                "demo_link": p.demo_link,
                "student_id": p.student_id,
                "student": p.student,
                "likes_count": len(p.likes),
                "has_liked": any(l.student_id == user.id for l in p.likes)
            })
        return results

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
            pass

        else:
            raise HTTPException(status_code=403, detail="Unauthorized")

        self.session.delete(project)
        self.session.commit()
        return {"message": "Project deleted successfully"}

    def like_project(self, user, project_id, ip_address=None):
        project = self.session.query(Project).filter_by(id=project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if user:
            existing = self.session.query(ProjectLike).filter_by(
                project_id=project_id, 
                student_id=user.id
            ).first()
        else:
            existing = self.session.query(ProjectLike).filter_by(
                project_id=project_id, 
                ip_address=ip_address,
                student_id=None
            ).first()
        
        if existing:
            return {"message": "Already liked"}
            
        like = ProjectLike(
            project_id=project_id, 
            student_id=user.id if user else None,
            ip_address=ip_address if not user else None
        )
        self.session.add(like)
        self.session.commit()
        return {"message": "Project liked"}

    def unlike_project(self, user, project_id, ip_address=None):
        if user:
            like = self.session.query(ProjectLike).filter_by(
                project_id=project_id, 
                student_id=user.id
            ).first()
        else:
            like = self.session.query(ProjectLike).filter_by(
                project_id=project_id, 
                ip_address=ip_address,
                student_id=None
            ).first()
        
        if not like:
            return {"message": "Not liked yet"}
            
        self.session.delete(like)
        self.session.commit()
        return {"message": "Project unliked"}