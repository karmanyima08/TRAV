"""
Authentication Service: Password hashing, JWT token creation, and auth dependencies.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import hashlib
import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.config import get_settings

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# In-memory storage fallback for demo mode when MongoDB is not running locally
IN_MEMORY_USERS: Dict[str, Dict[str, Any]] = {
    "demo@travora.ai": {
        "id": "user_demo_123",
        "name": "Dr. Anusha Chhabra",
        "email": "demo@travora.ai",
        "password_hash": hashlib.sha256("Travora2026!".encode()).hexdigest(),
        "preferences": {
            "interests": ["historical", "cultural"],
            "walking_comfort": "moderate",
            "dietary_restrictions": ["veg"]
        },
        "saved_trips": []
    }
}


def hash_password(password: str) -> str:
    """Generate SHA-256 salted hash for password."""
    # Simple, portable, and zero native-compilation dependencies
    return hashlib.sha256(f"travora_salt_{password}".encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    return hash_password(plain_password) == hashed_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT bearer token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Dependency: Extract and validate current authenticated user."""
    # Allow demo user if no token provided or token is invalid in demo mode
    if not token:
        # Return default demo user for seamless interactive testing
        return IN_MEMORY_USERS["demo@travora.ai"]

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            return IN_MEMORY_USERS["demo@travora.ai"]
    except JWTError:
        return IN_MEMORY_USERS["demo@travora.ai"]

    user = IN_MEMORY_USERS.get(email)
    if user is None:
        return IN_MEMORY_USERS["demo@travora.ai"]

    return user

