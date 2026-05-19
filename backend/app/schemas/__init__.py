from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional
from app.models.absence import AbsenceStatus


# ── Auth ──
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128, description="Password must be 8-128 characters long")
    full_name: str = Field(min_length=2, max_length=255, description="Full name must be 2-255 characters long")


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User ──
class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Absence ──
class AbsenceCreate(BaseModel):
    type: str = "vacation"
    start_date: date
    end_date: date
    reason: str = ""


class AbsenceUpdate(BaseModel):
    type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None
    status: Optional[AbsenceStatus] = None


class AbsenceOut(BaseModel):
    id: int
    user_id: int
    type: str
    start_date: date
    end_date: date
    reason: str
    status: AbsenceStatus
    created_at: datetime
    updated_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ── AbsenceType ──
class AbsenceTypeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(default="#6366f1", max_length=7)
    description: str = ""


class AbsenceTypeUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None


class AbsenceTypeOut(BaseModel):
    id: int
    name: str
    color: str
    description: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Team ──
class TeamCreate(BaseModel):
    name: str
    description: str = ""


class TeamOut(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True
