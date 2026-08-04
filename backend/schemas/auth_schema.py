from pydantic import BaseModel, Field, EmailStr

class UserSignup(BaseModel):
    username: str = Field(..., min_length=3)
    actual_name: str = Field(..., min_length=1)
    email: EmailStr
    # 10 digits exactly
    phone: str = Field(..., pattern=r"^\d{10}$") 
    # Password regex
    password: str = Field(..., pattern=r"^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$")