from typing import Optional
from pydantic import BaseModel, Field


class PageViewCreate(BaseModel):
    path: str = Field(min_length=1, max_length=300)
    referrer: Optional[str] = Field(default=None, max_length=1000)
    utm_source: Optional[str] = Field(default=None, max_length=100)
    # Primera página vista al llegar al sitio desde fuera (o escribiendo la URL)
    entry: bool = False
