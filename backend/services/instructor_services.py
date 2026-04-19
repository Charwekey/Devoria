from sqlalchemy.orm import Session
from models.users_models import User, Whitelist
from fastapi import HTTPException
from utils.auth import get_password_hash

class InstructorService:
    def __init__(self, db: Session):
        self.db = db

    def whitelist_student(self, instructor: User, student_email: str):
        """Allows an instructor to whitelist a student for their own track."""
        student_email = student_email.lower().strip()
        # Check if already whitelisted
        existing = self.db.query(Whitelist).filter(Whitelist.email == student_email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Student already whitelisted")

        new_entry = Whitelist(
            email=student_email,
            role="student",
            track=instructor.track,
            invited_by=instructor.id
        )
        self.db.add(new_entry)
        self.db.commit()
        return {"message": f"Student {student_email} whitelisted for {instructor.track}"}

    def invite_assistant(self, instructor: User, assistant_email: str):
        """Allows an instructor to invite a teaching assistant to their track."""
        assistant_email = assistant_email.lower().strip()
        existing = self.db.query(Whitelist).filter(Whitelist.email == assistant_email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Assistant already whitelisted")

        new_entry = Whitelist(
            email=assistant_email,
            role="assistant",
            track=instructor.track,
            invited_by=instructor.id
        )
        self.db.add(new_entry)
        self.db.commit()
        return {"message": f"Assistant {assistant_email} invited to {instructor.track} cohort"}

    def get_my_staff_and_students(self, instructor: User):
        """Get the whitelist entries and active staff for this instructor's cohort."""
        whitelist_entries = self.db.query(Whitelist).filter(Whitelist.invited_by == instructor.id).all()
        # Also return verified assistants for the same track
        assistants = self.db.query(User).filter(
            User.role == "assistant",
            User.track == instructor.track,
            User.is_verified == 1
        ).all()
        
        return {
            "whitelist": whitelist_entries,
            "assistants": assistants
        }

    def remove_from_whitelist(self, instructor: User, email: str):
        """Allows an instructor to remove an entry they previously whitelisted."""
        email = email.lower().strip()
        
        entry = self.db.query(Whitelist).filter(
            Whitelist.email == email,
            Whitelist.invited_by == instructor.id
        ).first()
        
        if not entry:
            raise HTTPException(status_code=404, detail="Identity not found in your cohort whitelist")
            
        self.db.delete(entry)
        self.db.commit()
        return {"message": f"Identity {email} removed from your cohort registration"}

    def update_student(self, instructor: User, student_id: str, data: dict):
        """Allows instructor to update student details if they share the same track."""
        student = self.db.query(User).filter(User.id == student_id, User.track == instructor.track).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found in your cohort")

        # Update fields
        for key, value in data.items():
            if value is not None:
                if key == "password":
                    setattr(student, key, get_password_hash(value))
                elif key in ["first_name", "last_name", "email", "track"]:
                    setattr(student, key, value)
        
        self.db.commit()
        self.db.refresh(student)
        return student

    def delete_student(self, instructor: User, student_id: str):
        """Allows instructor to delete a student user if they are in their track."""
        student = self.db.query(User).filter(User.id == student_id, User.track == instructor.track).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found in your cohort")
        
        # Also remove from whitelist if exists so they can't re-register without new whitelist
        self.db.query(Whitelist).filter(Whitelist.email == student.email).delete()
        
        self.db.delete(student)
        self.db.commit()
        return {"message": "Student deleted from platform"}
