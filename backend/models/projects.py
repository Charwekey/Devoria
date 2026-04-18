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
    
    students_id = Column(String(60), ForeignKey("users.id"))

    student = relationship("User", back_populates= "projects")