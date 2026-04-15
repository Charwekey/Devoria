from fastapi import FastAPI, status, HTTPException, Body, APIRouter
from services.users_services import UserService

router = APIRouter(prefix="/users", tags=["Users"]) 

user_services = UserService()

#creating a user(registration)


#  CREATE USER
@router.post("/")
def create_user(
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    role: str,
    track: str
):
    return user_service.create_user(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
        role=role,
        track=track
    )


#  GET ALL USERS
@router.get("/")
def get_all_users():
    return user_service.get_all_users()


#  GET USER BY ID
@router.get("/{user_id}")
def get_user_by_id(user_id: str):
    return user_service.get_user_by_id(user_id)


#  UPDATE USER
@router.put("/{user_id}")
def update_user(
    user_id: str,
    first_name: str = None,
    last_name: str = None,
    email: str = None,
    password: str = None,
    role: str = None,
    track: str = None
):
    return user_service.update_user(
        user_id=user_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
        role=role,
        track=track
    )


#  DELETE USER
@router.delete("/{user_id}")
def delete_user(user_id: str):
    return user_service.delete_user(user_id)
