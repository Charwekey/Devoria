from fastapi import FastAPI, status, HTTPException, Body, APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.users_services import UserService
from utils.auth import create_access_token, verify_password
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/users", tags=["Users"]) 

# LOGIN
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    from models.users_models import User
    email_input = form_data.username.lower().strip()
    user = db.query(User).filter_by(email=email_input).first()
    
    if not user:
        print(f"Login failed: User {email_input} not found.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.password):
        print(f"Login failed: Password mismatch for user {email_input}.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role,
            "track": user.track
        }
    }

# GET CURRENT USER - Moved ABOVE ID-based routes to prevent shadowing
@router.get("/me")
def get_user_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "role": current_user.role,
        "track": current_user.track
    }

# criando a user(registration)
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str
    track: str

#  CREATE USER
@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.create_user(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=user.password,
        role=user.role,
        track=user.track
    )

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    password: str | None = None
    role: str | None = None
    track: str | None = None

#  GET ALL USERS
@router.get("/")
def get_all_users(db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.get_all_users()

#  GET USER BY ID
@router.get("/{user_id}")
def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.get_user_by_id(user_id)

#  UPDATE USER
@router.put("/{user_id}")
def update_user(user_id: str, user: UserUpdate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.update_user(
        user_id=user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=user.password,
        role=user.role,
        track=user.track
    )

#  DELETE USER
@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.delete_user(user_id)

