from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class VisitorCreate(BaseModel):
    name: str
    flat: str
    purpose: Optional[str] = None
    phone: Optional[str] = None


class VisitorOut(BaseModel):
    id: int
    name: str
    flat: str
    purpose: Optional[str]
    phone: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    phone: str
    flat: str
    role: str = "resident"
    password: str = Field(..., max_length=72)


class UserLogin(BaseModel):
    phone: str
    password: str = Field(..., max_length=72)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
