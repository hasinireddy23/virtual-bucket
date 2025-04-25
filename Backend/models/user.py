from pydantic import BaseModel, EmailStr
# === Pydantic Models ===
class User(BaseModel):
    email: EmailStr
    password: str