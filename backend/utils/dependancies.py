from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models.users_models import User
from utils.auth import decode_access_token
from utils.connections import SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/users/login", auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme_optional), db = Depends(get_db)):
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter_by(id=user_id).first()
    except:
        return None