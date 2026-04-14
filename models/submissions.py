from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid
from sqlalchemy import datetime

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    submission_link= Column(String(255), nullable=False)
    score = Column(Integer, nullable=True)
    feedback = Column(String(300), nullable=True)
    graded_at = Column(DateTime)

    assigment_id = Column(String(60), ForeignKey("assigments.id"))
    student_id = Column(String(60), ForeignKey("users.id"))

#relationship
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
