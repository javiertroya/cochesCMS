from typing import Any, Optional
from pydantic import BaseModel, Field


class CollectionCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    fields_schema: list[dict[str, Any]] = Field(default_factory=list)


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fields_schema: Optional[list[dict[str, Any]]] = None


class CollectionItemCreate(BaseModel):
    data: dict[str, Any] = Field(default_factory=dict)


class CollectionItemUpdate(BaseModel):
    data: dict[str, Any]
