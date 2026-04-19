from models.users_models import User
from fastapi import HTTPException
from utils.auth import get_password_hash
from utils.uuid_generator import generative_uuid

class UserService:
    def __init__(self, session):
        self.session = session

    # Create user
    def create_user(self, first_name, last_name, email, password, role, track):
        from models.users_models import Whitelist, AssistantPermission
        email = email.lower().strip()
        
        # check if user already exists
        existing_user = self.session.query(User).filter_by(email=email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        is_verified = 0
        is_admin = 0
        final_role = role
        final_track = track

        # BOOTSTRAP ADMIN
        if email == "admin@devoria.com":
            is_verified = 1
            is_admin = 1
            final_role = "admin"
        else:
            # CHECK WHITELIST
            whitelist_entry = self.session.query(Whitelist).filter_by(email=email).first()
            if not whitelist_entry:
                raise HTTPException(
                    status_code=403, 
                    detail="Unauthorized: Your email is not whitelisted for this cohort."
                )
            
            # Force role/track from whitelist to prevent tampering
            final_role = whitelist_entry.role
            final_track = whitelist_entry.track
            
            # Students are verified immediately; Staff require admin approval
            if final_role == "student":
                is_verified = 1
            
            whitelist_entry.is_used = 1

        new_user = User(
            id=generative_uuid(),
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=get_password_hash(password),
            role=final_role,
            track=final_track,
            is_verified=is_verified,
            is_admin=is_admin
        )

        self.session.add(new_user)
        
        # If it's an assistant, create default permissions
        if final_role == "assistant":
            perms = AssistantPermission(user_id=new_user.id)
            self.session.add(perms)

        self.session.commit()
        self.session.refresh(new_user)

        return new_user

    # Get all users
    def get_all_users(self):
        return self.session.query(User).all()

    #  Get user by ID
    def get_user_by_id(self, user_id):
        user = self.session.query(User).filter_by(id=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    # Update user
    def update_user(self, user_id, **kwargs):
        user = self.get_user_by_id(user_id)

        for key, value in kwargs.items():
            if value is not None:
                if key == "password":
                    setattr(user, key, get_password_hash(value))
                else:
                    setattr(user, key, value)

        self.session.commit()
        self.session.refresh(user)

        return user

    # Delete user
    def delete_user(self, user_id):
        user = self.get_user_by_id(user_id)

        self.session.delete(user)
        self.session.commit()

        return {"message": f"User with id {user_id} deleted"}