from models.users_models import User
from fastapi import HTTPException
from utils.auth import get_password_hash

class UserService:
    def __init__(self, session):
        self.session = session

    # Create user
    def create_user(self, first_name, last_name, email, password, role, track):
        email = email.lower().strip()
        # check if user already exists
        existing_user = self.session.query(User).filter_by(email=email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=get_password_hash(password),  # unified hashing
            role=role,
            track=track
        )

        self.session.add(new_user)
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