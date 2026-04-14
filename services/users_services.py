from models.users_models import User
from utils.connections import db_session
from fastapi import HTTPException
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, session=db_session):
        self.session = session

    #  Hash password
    def hash_password(self, password):
        return pwd_context.hash(password)

    # Create user
    def create_user(self, first_name, last_name, email, password, role, track):
        
        # check if user already exists
        existing_user = self.session.query(User).filter_by(email=email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=self.hash_password(password),  # hashed
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
                    setattr(user, key, self.hash_password(value))
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