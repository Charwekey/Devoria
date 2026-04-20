from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid


class Class(Base):
    __tablename__ = "classes"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    class_name = Column(String(60), nullable=False)
    track = Column(String(60), nullable=False)
    class_code = Column(String(60), unique=True)
    total_classes = Column(Integer, default=24)

    instructor_id = Column(String(60), ForeignKey("users.id"))

    # RELATIONSHIPS
    instructor = relationship("User", back_populates="classes")

    class_student = relationship("ClassStudent", back_populates="classes")
    attendance = relationship("Attendance", back_populates="classes")
    assignments = relationship("Assignment", back_populates="classes")
    materials = relationship("Material", back_populates="classes")