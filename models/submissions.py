from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    submissions_link= Column(String(60), nullable=False)
    score = Column(Integer)

    assigment_id = Column(String(60), ForeignKey("assigments.id"))
    student_id = Column(String(60), ForeignKey("users.id"))

#relationship
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
