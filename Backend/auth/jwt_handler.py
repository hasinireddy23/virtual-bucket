import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import datetime
import os
from typing import Any, Dict
from passlib.context import CryptContext
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Constants
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: Dict[str, Any], expires_delta: datetime.timedelta = None) -> str:
    """
    Create a new JWT access token.

    Args:
        data (Dict): The payload to encode into the token.
        expires_delta (datetime.timedelta, optional): Custom expiration.

    Returns:
        str: Encoded JWT token.
    """
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {**data, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token and return the decoded payload.

    Args:
        token (str): JWT token to verify.

    Returns:
        dict: Decoded payload if valid, else raises HTTPException.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if "email" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token: email missing")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or malformed token")


def get_password_hash(password: str) -> str:
    """
    Hash a plain password.

    Args:
        password (str): Raw password.

    Returns:
        str: Hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if a plain password matches the hashed version.

    Args:
        plain_password (str): Raw password.
        hashed_password (str): Hashed password.

    Returns:
        bool: True if match, else False.
    """
    return pwd_context.verify(plain_password, hashed_password)
