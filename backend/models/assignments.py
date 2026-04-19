from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Integer
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    file_url = Column(String(255), nullable=True)
    preview_url = Column(String(255), nullable=True)
    deadline = Column(DateTime)
    is_final_project = Column(Integer, default=0) # 0 = Normal, 1 = Final Project

    class_id = Column(String(60), ForeignKey("classes.id"))

    # RELATIONSHIPS
    classes = relationship("Class", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")
