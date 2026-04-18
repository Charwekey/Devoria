from sqlalchemy.orm import Session
from utils.connections import SessionLocal
from models.class_students_models import ClassStudent
from models.users_models import User
import json

def debug_enrollments():
    db = SessionLocal()
    try:
        # Get all approved enrollments
        enrollments = db.query(ClassStudent).filter_by(status='approved').all()
        print(f"Total Approved Enrollments: {len(enrollments)}")
        
        for e in enrollments:
            print(f"--- Enrollment {e.id} ---")
            print(f"Student: {e.student.first_name if e.student else 'MISSING'}")
            print(f"Class: {e.classes.class_name if e.classes else 'MISSING'}")
            
    except Exception as e:
        print(f"Debug failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_enrollments()
