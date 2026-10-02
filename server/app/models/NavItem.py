from typing import Optional

from pydantic import BaseModel


class NavItemCreate(BaseModel):
    page_id: int
    icon: Optional[str] = None
    order: int = 100
    parent_id: Optional[int] = None


class NavItemUpdate(BaseModel):
    icon: Optional[str] = None
    order: Optional[int] = None
    parent_id: Optional[int] = None
