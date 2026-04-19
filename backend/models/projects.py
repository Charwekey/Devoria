from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(60), primary_key=True, default= generative_uuid)
    title = Column(String(60), nullable=False)
    description = Column(String(300))
    github_link = Column(String(255))
    demo_link = Column(String(255))
    
    student_id = Column("students_id", String(60), ForeignKey("users.id"))

    student = relationship("User", back_populates= "projects")
    likes = relationship("ProjectLike", back_populates="project", cascade="all, delete-orphan")

class ProjectLike(Base):
    __tablename__ = "project_likes"
    id = Column(String(60), primary_key=True, default=generative_uuid)
    project_id = Column(String(60), ForeignKey("projects.id"), nullable=False)
    student_id = Column(String(60), ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(45), nullable=True) # Support IPv6

    project = relationship("Project", back_populates="likes")
    student = relationship("User") 