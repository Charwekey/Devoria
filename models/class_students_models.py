from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid

class ClassStudent(Base):
    __tablename__ = "class_student"

    id = Column(String(60), primary_key=True, default=generative_uuid)

    students_id = Column(String(60), ForeignKey("users.id"))
    class_id = Column(String(60), ForeignKey("classes.id"))


#relationship
    student = relationship("User", back_populates="class_student")
    classes = relationship("Class", back_populates="class_student")