from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    loyalty_points: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class AddressCreate(BaseModel):
    label: str = "Home"
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postcode: str
    is_default: bool = False


class AddressOut(BaseModel):
    id: int
    label: str
    address_line1: str
    address_line2: Optional[str]
    city: str
    state: str
    postcode: str
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}
