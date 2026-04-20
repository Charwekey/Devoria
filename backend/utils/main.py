from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# import all routes
from routes import (
    user_routes,
    classes_routes,
    assignments_routes,
    submissions_routes,
    projects_routes,
    attendance_routes,
    class_students_routes,
    admin_routes,
    instructor_routes,
    materials_routes
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
        if "Duplicate column name" not in str(e) and "1060" not in str(e):
            print(f"Schema sync warning (class_student): {e}")

    # Assignments Table Sync
    try:
        with engine.connect() as connection:
            print("Syncing 'assignments' table...")
            # Change description to TEXT
            connection.execute(text("ALTER TABLE assignments MODIFY description TEXT"))
            # Add preview_url if missing
            try:
                connection.execute(text("ALTER TABLE assignments ADD COLUMN preview_url VARCHAR(255)"))
            except Exception as e:
                if "Duplicate column name" not in str(e) and "1060" not in str(e):
                    raise e
            connection.commit()
            print("Successfully synced 'assignments' table.")
    except Exception as e:
        print(f"Schema sync warning (assignments): {e}")

    # Classes Table Sync
    try:
        with engine.connect() as connection:
            print("Syncing 'classes' table...")
            try:
                connection.execute(text("ALTER TABLE classes ADD COLUMN total_classes INT DEFAULT 24"))
            except Exception as e:
                if "Duplicate column name" not in str(e) and "1060" not in str(e):
                    raise e
            connection.commit()
            print("Successfully synced 'classes' table.")
    except Exception as e:
        print(f"Schema sync warning (classes): {e}")

    # Attendance Table Sync
    try:
        with engine.connect() as connection:
            print("Syncing 'attendance' table...")
            try:
                connection.execute(text("ALTER TABLE attendance ADD COLUMN slot INT NULL"))
            except Exception as e:
                if "Duplicate column name" not in str(e) and "1060" not in str(e):
                    raise e
            connection.commit()
            print("Successfully synced 'attendance' table.")
    except Exception as e:
        print(f"Schema sync warning (attendance): {e}")

    # Submissions Table Sync
    try:
        with engine.connect() as connection:
            print("Syncing 'submissions' table...")
            # Add submission_file_url if missing
            try:
                connection.execute(text("ALTER TABLE submissions ADD COLUMN submission_file_url VARCHAR(255) NULL"))
            except Exception as e:
                if "Duplicate column name" not in str(e) and "1060" not in str(e):
                    raise e
            
            # Add submitted_at if missing
            try:
                connection.execute(text("ALTER TABLE submissions ADD COLUMN submitted_at DATETIME NULL"))
            except Exception as e:
                if "Duplicate column name" not in str(e) and "1060" not in str(e):
                    raise e
            
            # Modify submission_link to be optional
            try:
                connection.execute(text("ALTER TABLE submissions MODIFY COLUMN submission_link VARCHAR(255) NULL"))
            except Exception as e:
                print(f"Submissions sync Link Nullable Warning: {e}")

            connection.commit()
            print("Successfully synced 'submissions' table.")
    except Exception as e:
        print(f"Schema sync warning (submissions): {e}")

    # Materials Table Sync
    try:
        with engine.connect() as connection:
            print("Syncing 'materials' table...")
            # Add missing columns if needed
            try:
                connection.execute(text("ALTER TABLE materials ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            except Exception as e:
                if "Duplicate column name" not in str(e) and "1060" not in str(e):
                    pass  # Column likely already exists
            
            try:
                connection.execute(text("ALTER TABLE materials ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
            except Exception as e:
                if "Duplicate column name" not in str(e) and "1060" not in str(e):
                    pass  # Column likely already exists
            
            connection.commit()
            print("Successfully synced 'materials' table.")
    except Exception as e:
        print(f"Schema sync warning (materials): {e}")

# include routers
app.include_router(user_routes.router)
app.include_router(classes_routes.router)
app.include_router(assignments_routes.router)
app.include_router(submissions_routes.router)
app.include_router(projects_routes.router)
app.include_router(attendance_routes.router)
app.include_router(class_students_routes.router)
app.include_router(admin_routes.router)
app.include_router(instructor_routes.router)
app.include_router(materials_routes.router)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
def startup_event():
    # Apply migrations and create tables ONLY on app startup
    print("Starting database schema synchronization...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_sync()
    print("Database schema synchronization complete.")