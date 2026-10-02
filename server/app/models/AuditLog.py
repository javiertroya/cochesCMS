from typing import Optional
from pydantic import BaseModel


class AuditLogQuery(BaseModel):
    action: Optional[str] = None
    resource_type: Optional[str] = None
    search: Optional[str] = None
