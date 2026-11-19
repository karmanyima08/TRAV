"""
Pydantic Schemas for User Authentication and Profile Management.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    preferences: Optional[Dict[str, Any]] = None
    saved_trips_count: int = 0


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None

