from utils.connections import engine
from models.base import Base

# Import all models to ensure they are registered with Base metadata
from models.users_models import User
from models.classes_models import Class
from models.assignments import Assignment
from models.submissions import Submission
from models.projects import Project
from models.attendance import Attendance
from models.class_students_models import ClassStudent

from sqlalchemy import text

print("Dropping all existing tables...")
with engine.connect() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    Base.metadata.drop_all(bind=conn)
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    conn.commit()

print("Recreating all tables cleanly...")
with engine.connect() as conn:
    Base.metadata.create_all(bind=conn)
    conn.commit()

print("Database reset successfully! You can now start the server.")
