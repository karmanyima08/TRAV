"""
Authentication Service: Password hashing, JWT token creation, and auth dependencies.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import hashlib
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.config import get_settings
from app.database.connection import get_database

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# In-memory storage for user accounts
IN_MEMORY_USERS: Dict[str, Dict[str, Any]] = {}


def hash_password(password: str) -> str:
    """Generate SHA-256 salted hash for password."""
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


async def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[Dict[str, Any]]:
    """Optional authentication: Returns user dict if valid token provided, else None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub", "").lower().strip()
        if not email:
            return None
    except JWTError:
        return None

    user = IN_MEMORY_USERS.get(email)
    if user is None:
        try:
            db = get_database()
            if db is not None:
                user = await db["users"].find_one({"email": email})
                if user:
                    IN_MEMORY_USERS[email] = user
        except Exception:
            pass
    return user


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Strict authentication dependency: Requires valid signed JWT bearer token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to your account.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub", "").lower().strip()
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = IN_MEMORY_USERS.get(email)
    if user is None:
        try:
            db = get_database()
            if db is not None:
                user = await db["users"].find_one({"email": email})
                if user:
                    IN_MEMORY_USERS[email] = user
        except Exception:
            pass

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found. Please sign up or sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
