from typing import Optional
from pydantic import BaseModel


class RedirectCreate(BaseModel):
    from_path: str
    to_path: str
    status_code: int = 301
    is_active: bool = True


class RedirectUpdate(BaseModel):
    from_path: Optional[str] = None
    to_path: Optional[str] = None
    status_code: Optional[int] = None
    is_active: Optional[bool] = None
