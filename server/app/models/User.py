from math import ceil
from typing import Any, List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi_pagination import Params

UserRole = Literal["admin", "editor"]


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    role: UserRole = "editor"


class UserCounts(BaseModel):
    all: int
    admin: int
    editor: int
    inactive: int


class UserPage(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    counts: UserCounts

    @classmethod
    def from_result(cls, result: dict, params: Params) -> "UserPage":
        total = result["total"]
        return cls(
            items=result["items"],
            total=total,
            page=params.page,
            size=params.size,
            pages=ceil(total / params.size) if total else 1,
            counts=UserCounts(**result["counts"]),
        )


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None
