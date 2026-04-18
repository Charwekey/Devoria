from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import all routes
from routes import (
    user_routes,
    classes_routes,
    assignments_routes,
    submissions_routes,
    projects_routes,
    attendance_routes,
    class_students_routes
)

app = FastAPI()

# CORS - allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy import text
from utils.connections import engine
from models.base import Base

# Automatic Database Migration Check
def ensure_schema_sync():
    try:
        with engine.connect() as connection:
            # Check for the status column in class_student table
            print("Checking for missing 'status' column in 'class_student'...")
            connection.execute(text("ALTER TABLE class_student ADD COLUMN status VARCHAR(20) DEFAULT 'pending'"))
            connection.commit()
            print("Successfully added missing 'status' column.")
    except Exception as e:
        # If the column already exists, MySQL returns code 1060
        if "Duplicate column name" in str(e) or "1060" in str(e):
            print("Schema is already up to date. No action needed.")
        else:
            print(f"Schema sync warning: {e}")

# Apply migrations and create tables
Base.metadata.create_all(bind=engine)
ensure_schema_sync()

# include routers
app.include_router(user_routes.router)
app.include_router(classes_routes.router)
app.include_router(assignments_routes.router)
app.include_router(submissions_routes.router)
app.include_router(projects_routes.router)
app.include_router(attendance_routes.router)
app.include_router(class_students_routes.router)