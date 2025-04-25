from datetime import datetime, timedelta
import os
from typing import Any, Dict
from passlib.context import CryptContext
from fastapi import HTTPException
from dotenv import load_dotenv
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError

# Load environment variables from .env file
load_dotenv()

# Constants
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: Dict[str, Any], expires_delta: timedelta = None) -> str:
    """
    Create a new JWT access token.
    """
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {**data, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_access_token(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token and return the decoded payload.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if "email" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token: email missing")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or malformed token")

def get_password_hash(password: str) -> str:
    """
    Hash a plain password.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if a plain password matches the hashed version.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_verification_token(email: str, secret_key: str, algorithm: str, expiry_hours: int = 5):
    # Calculate expiration time based on current UTC time
    expire = datetime.utcnow() + timedelta(hours=expiry_hours)
    
    # Convert the expiration time to a Unix timestamp (seconds since epoch)
    expire_timestamp = expire.timestamp()
    
    # Create the payload with the email and expiration time
    payload = {
        "email": email,
        "exp": expire_timestamp
    }
    
    # Generate the JWT token
    return jwt.encode(payload, secret_key, algorithm=algorithm)
