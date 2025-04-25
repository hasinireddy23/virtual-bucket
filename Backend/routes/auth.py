from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from auth.jwt_handler import create_access_token, get_password_hash, verify_password
from auth.jwt_bearer import get_current_user
from utils.db import user_table
from models.user import User
from auth.jwt_handler import SECRET_KEY, ALGORITHM
import boto3
from fastapi import Request
from utils.ses import send_verification_email
from auth.jwt_handler import create_verification_token
from jose import JWTError, jwt
from datetime import datetime

# Define the router
router = APIRouter()

# === Routes ===

@router.post("/signup")
def signup(user: User, request: Request):
    # Check if user already exists
    existing = user_table.get_item(Key={"email": user.email})
    if "Item" in existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash and store password
    hashed_pw = get_password_hash(user.password)
    user_table.put_item(Item={
        "email": user.email,
        "hashed_password": hashed_pw,
        "verified": False
    })

    # Create verification token with expiry of 1 hour
    token = create_verification_token(user.email, SECRET_KEY, ALGORITHM, expiry_hours=5)

    # Send verification email
    verify_link = f"{request.base_url}auth/verify-email?token={token}"
    send_verification_email(user.email, verify_link)

    return {"message": "User registered successfully. Please verify your email."}


@router.post("/signin")
def signin(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticates a user by verifying credentials and returning a JWT access token.
    Only verified users can log in.
    """
    # Fetch user from DynamoDB
    res = user_table.get_item(Key={"email": form_data.username})
    user = res.get("Item")

    # Validate credentials
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Block unverified users
    if not user.get("verified"):
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in."
        )

    # Generate JWT token
    token = create_access_token(data={"email": user["email"]})

    return {
        "message": "User login successful",
        "access_token": token,
        "token_type": "bearer",
        "email": user["email"]
    }


@router.get("/verify-email")
def verify_email(token: str):
    try:
        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        exp = payload.get("exp")

        if email is None or exp is None:
            raise HTTPException(status_code=400, detail="Invalid token")

        if datetime.utcnow().timestamp() > exp:
            raise HTTPException(status_code=400, detail="Verification link has expired")

        # Update user verification in DB
        user = user_table.get_item(Key={"email": email}).get("Item")
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user["verified"] = True
        user_table.put_item(Item=user)

        return {"message": "Email successfully verified!"}

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")

