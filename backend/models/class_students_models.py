from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid


class ClassStudent(Base):
    __tablename__ = "class_student"

    id = Column(String(60), primary_key=True, default=generative_uuid)

    student_id = Column(String(60), ForeignKey("users.id"))
    class_id = Column(String(60), ForeignKey("classes.id"))
    status = Column(String(20), default="pending") # pending, approved, rejected


    # RELATIONSHIPS
    student = relationship("User", back_populates="class_student")
    classes = relationship("Class", back_populates="class_student")