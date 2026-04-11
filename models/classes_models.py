from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid


class Class(Base):
    __tablename__ = "classes"

    id = Column(String(60), primary_key=True, default= generative_uuid)
    class_name = Column(String(60), nullable=False)
    track = Column(String(60), nullable=False)
    class_code = Column(String(60), unique=True)

    instructor_id = Column(String(60), ForeignKey("users.id"))

    #relationships
    class_student = relationship("ClassStudent", back_populates="classes")

    #attendance
    attendance = relationship("Attendance", back_populates= "classes")

    #assigments
    assigments = relationship("Assignments", back_populates="classes")

