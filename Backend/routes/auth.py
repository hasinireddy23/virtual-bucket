from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from auth.jwt_handler import create_access_token, get_password_hash, verify_password
from auth.jwt_bearer import get_current_user
from utils.db import user_table
from models.user import User
import boto3

# Define the router
router = APIRouter()

# === Routes ===

@router.post("/signup")
def signup(user: User):
    """
    Registers a new user. The user's email and hashed password along with verification status are stored in DynamoDB.
    """
    # Check if user already exists
    existing = user_table.get_item(Key={"email": user.email})
    if "Item" in existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash and store password
    hashed_pw = get_password_hash(user.password)
    user_table.put_item(Item={
        "email": user.email,
        "hashed_password": hashed_pw,
        "verified": False  # This can be handled with email verification using SES later
    })

    return {"message": "User registered successfully"}


@router.post("/signin")
def signin(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticates a user by verifying credentials and returning a JWT access token.
    """
    # Fetch user from DynamoDB
    res = user_table.get_item(Key={"email": form_data.username})
    user = res.get("Item")

    # Validate credentials
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate JWT token
    token = create_access_token(data={"email": user["email"]})

    return {
        "message": "User login successful",
        "access_token": token,
        "token_type": "bearer",
        "email": user["email"]
    }
