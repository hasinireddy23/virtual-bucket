from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from .jwt_handler import verify_access_token

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/signin")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Retrieves the current user by validating the provided JWT access token.

    Raises:
        HTTPException: If token is invalid or expired.

    Returns:
        dict: Decoded JWT payload containing user data.
    """
    payload = verify_access_token(token)
    print("Decoded JWT payload:", payload)
    return {"email": payload["email"]}
