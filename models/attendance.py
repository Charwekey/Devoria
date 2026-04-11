from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid
from datetime import datetime

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    class_id = Column(String(60), ForeignKey("classes.id"))
    student_id = Column(String(60), ForeignKey("users.id"))
    date = Column(DateTime)
    status = Column(String(60), nullable=False)

    #relationship
    classes_created= relationship("Class", back_populates="attendance")
    student = relationship("User", back_populates="attendance")