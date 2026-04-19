from sqlalchemy.orm import Session
from models.users_models import User, Whitelist
from fastapi import HTTPException

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def get_pending_staff(self):
        """Get all staff (instructors/assistants) who are not yet verified."""
        return self.db.query(User).filter(
            User.role.in_(["instructor", "assistant"]),
            User.is_verified == 0,
            User.is_admin == 0
        ).all()

    def verify_user(self, user_id: str):
        """Verify a user and grant them dashboard access."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_verified = 1
        self.db.commit()
        return {"message": f"User {user.email} verified successfully"}

    def add_to_whitelist(self, email: str, role: str, track: str, admin_id: str):
        """Add an email to the registration whitelist."""
        email = email.lower().strip()
        # Check if already whitelisted
        existing = self.db.query(Whitelist).filter(Whitelist.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already whitelisted")
        
        # Check if user already exists
        user_exists = self.db.query(User).filter(User.email == email).first()
        if user_exists:
            raise HTTPException(status_code=400, detail="User with this email already registered")

        new_entry = Whitelist(
            email=email,
            role=role,
            track=track,
            invited_by=admin_id
        )
        self.db.add(new_entry)
        self.db.commit()
        return {"message": f"Email {email} whitelisted for role {role}"}

    def get_whitelist(self):
        """List all whitelisted entries."""
        return self.db.query(Whitelist).all()

    def remove_from_whitelist(self, email: str):
        """Remove an entry from the whitelist."""
        email = email.lower().strip()
        entry = self.db.query(Whitelist).filter(Whitelist.email == email).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Whitelist entry not found")
        
        self.db.delete(entry)
        self.db.commit()
        return {"message": "Whitelist entry removed"}
