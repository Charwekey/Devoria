from sqlalchemy import Column,  Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    submission_link = Column(String(255), nullable=True)
    submission_file_url = Column(String(255), nullable=True)
    
    # Project specific fields (Optional, used if assignment is final project)
    project_title = Column(String(100), nullable=True)
    project_description = Column(String(1000), nullable=True)
    github_link = Column(String(255), nullable=True)
    demo_link = Column(String(255), nullable=True)

    submitted_at = Column(DateTime)
    score = Column(Integer, nullable=True)
    feedback = Column(String(300), nullable=True)
    graded_at = Column(DateTime)

    assignment_id = Column(String(60), ForeignKey("assignments.id"))
    student_id = Column(String(60), ForeignKey("users.id"))

#relationship
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
