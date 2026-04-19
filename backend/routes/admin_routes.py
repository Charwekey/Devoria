from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.dependancies import get_current_user, get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

class WhitelistCreate(BaseModel):
    email: str
    role: str
    track: str

# Helper to check if current user is admin
def verify_admin(user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

@router.get("/pending")
def get_pending_staff(admin = Depends(verify_admin), db: Session = Depends(get_db)):
    from services.admin_services import AdminService
    admin_service = AdminService(db)
    return admin_service.get_pending_staff()

@router.post("/verify/{user_id}")
def verify_staff(user_id: str, admin = Depends(verify_admin), db: Session = Depends(get_db)):
    from services.admin_services import AdminService
    admin_service = AdminService(db)
    return admin_service.verify_user(user_id)

@router.post("/whitelist")
def add_to_whitelist(data: WhitelistCreate, admin = Depends(verify_admin), db: Session = Depends(get_db)):
    from services.admin_services import AdminService
    admin_service = AdminService(db)
    return admin_service.add_to_whitelist(data.email, data.role, data.track, admin.id)

@router.get("/whitelist")
def get_whitelist(admin = Depends(verify_admin), db: Session = Depends(get_db)):
    from services.admin_services import AdminService
    admin_service = AdminService(db)
    return admin_service.get_whitelist()

@router.delete("/whitelist/{email}")
def remove_from_whitelist(email: str, admin = Depends(verify_admin), db: Session = Depends(get_db)):
    from services.admin_services import AdminService
    admin_service = AdminService(db)
    return admin_service.remove_from_whitelist(email)
