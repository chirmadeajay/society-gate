from pydantic import BaseModel
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
        orm_mode = True


class UserCreate(BaseModel):
    name: str
    phone: str
    flat: str
    role: str = "resident"
    password: str


class UserLogin(BaseModel):
    phone: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
