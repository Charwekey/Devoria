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
    classes = relationship("Class", back_populates="instructor")

    #enrolled
    class_student = relationship("ClassStudent", back_populates="student")

    #attendance
    attendance = relationship("Attendance", back_populates="student")

    #submissions
    submissions = relationship("Submission", back_populates="student")

    #projects 
    projects = relationship("Project", back_populates="student")
