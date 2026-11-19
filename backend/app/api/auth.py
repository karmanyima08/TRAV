"""
Authentication API Endpoints: Register, Login, Get Current User Profile.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    IN_MEMORY_USERS
)
import uuid

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    """Register a new user account."""
    if user_in.email in IN_MEMORY_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_id = f"user_{uuid.uuid4().hex[:10]}"
    user_record = {
        "id": user_id,
        "name": user_in.name,
        "email": user_in.email,
        "password_hash": hash_password(user_in.password),
        "preferences": {},
        "saved_trips": []
    }
    IN_MEMORY_USERS[user_in.email] = user_record

    access_token = create_access_token(data={"sub": user_in.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_in.name,
            "email": user_in.email,
            "preferences": {},
            "saved_trips_count": 0
        }
    }


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Authenticate existing user and return access token."""
    user = IN_MEMORY_USERS.get(credentials.email)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "preferences": user.get("preferences", {}),
            "saved_trips_count": len(user.get("saved_trips", []))
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Fetch current user profile."""
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "preferences": current_user.get("preferences", {}),
        "saved_trips_count": len(current_user.get("saved_trips", []))
    }

