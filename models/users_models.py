# Users
# id
# first_name
# last_name
# email
# password
# role
# track 

from sqlalchemy import Column,  Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.uuid_generator import generative_uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String(60), primary_key=True, default=generative_uuid)
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60), nullable=False)
    email = Column(String(60), unique=True)
    role = Column(String(60), nullable=False)
    password = Column(String(100), nullable=False)
    track= Column(String(60), nullable=False)

    #classescreated
    classes_created = relationship("Classes", back_populates="instructor")

    #enrolled
    class_student = relationship("ClassStudent", back_populates="students")

    #attendance
    attendance = relationship("Attendance", back_populates="students")

    #submissions
    submissions = relationship("Submissions", back_populates="students")

    #projects 
    projects = relationship("Projects", back_populates="students")
