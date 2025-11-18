from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import crud, schemas
from database import get_db
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# -------------------------
# Password utils
# -------------------------
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)


# -------------------------
# JWT utils
# -------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT with role/email, and doctor_id if doctor"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str):
    """Decode JWT safely"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# -------------------------
# Current user getters
# -------------------------
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email: str = payload.get("email")
    role: str = payload.get("role")

    if not email or not role:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch entity by role
    if role == schemas.UserRole.USER:
        user = crud.get_user_by_email(db, email=email)
    elif role == schemas.UserRole.DOCTOR:
        user = crud.get_doctor_by_email(db, email=email)
    elif role == schemas.UserRole.ADMIN:
        user = crud.get_admin_by_email(db, email=email)
    else:
        raise HTTPException(status_code=401, detail="Invalid role")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


async def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    """Check active/verified users"""
    if hasattr(current_user, "is_verified") and not current_user.is_verified:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_doctor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email: str = payload.get("email")
    role: str = payload.get("role")

    if not email or role != schemas.UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Not authorized")

    doctor = crud.get_doctor_by_email(db, email=email)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


async def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email: str = payload.get("email")
    role: str = payload.get("role")

    if not email or role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    admin = crud.get_admin_by_email(db, email=email)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin


# -------------------------
# Role-based access control
# -------------------------
def require_role(required_role: schemas.UserRole):
    async def role_checker(current_user=Depends(get_current_user)):
        if getattr(current_user, "role", None) != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role} role"
            )
        return current_user
    return role_checker
