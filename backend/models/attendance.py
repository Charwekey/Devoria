from sqlalchemy import Column, String, ForeignKey, DateTime, Integer
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(60), primary_key=True, default=generative_uuid)

    class_id = Column(String(60), ForeignKey("classes.id"))
    student_id = Column(String(60), ForeignKey("users.id"))

    date = Column(DateTime, nullable=False)
    slot = Column(Integer, nullable=True)
    status = Column(String(60), nullable=False)  # present / absent

    # RELATIONSHIPS
    classes = relationship("Class", back_populates="attendance")
    student = relationship("User", back_populates="attendance")
    