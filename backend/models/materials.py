from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid
from datetime import datetime


class Material(Base):
    __tablename__ = "materials"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    material_type = Column(String(50), nullable=False)  # document, video, presentation, link, etc.
    file_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    class_id = Column(String(60), ForeignKey("classes.id"))

    # RELATIONSHIPS
    classes = relationship("Class", back_populates="materials")
