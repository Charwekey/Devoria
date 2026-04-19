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
    is_verified = Column(Integer, default=0) # 0: False, 1: True (Using Integer for compatibility)
    is_admin = Column(Integer, default=0)

    # Permissions (for assistants)
    permissions = relationship("AssistantPermission", back_populates="user", cascade="all, delete-orphan")

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

class AssistantPermission(Base):
    __tablename__ = "assistant_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(60), ForeignKey("users.id"))
    can_grade = Column(Integer, default=1)
    can_manage_attendance = Column(Integer, default=1)
    can_manage_assignments = Column(Integer, default=1)
    
    user = relationship("User", back_populates="permissions")

class Whitelist(Base):
    __tablename__ = "registration_whitelist"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(60), unique=True, index=True)
    role = Column(String(20), nullable=False) # student, instructor, assistant
    track = Column(String(60), nullable=False)
    invited_by = Column(String(60), ForeignKey("users.id"), nullable=True)
    is_used = Column(Integer, default=0)
