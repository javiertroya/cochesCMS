from typing import Any, Optional
from pydantic import BaseModel, Field


class PageBase(BaseModel):
    title: str
    slug: str
    status: str = "published"
    order: int = 100
    requires_auth: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_og_image: Optional[str] = None
    seo_canonical: Optional[str] = None
    page_color: Optional[str] = None
    components: list[dict[str, Any]] = Field(default_factory=list)
    header_slides: list[dict[str, Any]] = Field(default_factory=list)
    # Nav fields (stored in nav_items table)
    nav_visible: bool = False
    nav_parent_slug: Optional[str] = None
    nav_order: int = 100
    nav_icon: Optional[str] = None


class CmsPage(PageBase):
    # Accept is_published as alias for status
    is_published: Optional[bool] = None

    def model_post_init(self, __context):
        if self.is_published is not None and self.status == "published":
            object.__setattr__(self, 'status', 'published' if self.is_published else 'draft')


class CmsPageUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    status: Optional[str] = None
    order: Optional[int] = None
    requires_auth: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_og_image: Optional[str] = None
    seo_canonical: Optional[str] = None
    page_color: Optional[str] = None
    components: Optional[list[dict[str, Any]]] = None
    header_slides: Optional[list[dict[str, Any]]] = None
    # Backward-compatible nav fields
    is_published: Optional[bool] = None
    nav_visible: Optional[bool] = None
    nav_parent_slug: Optional[str] = None
    nav_order: Optional[int] = None
    nav_icon: Optional[str] = None
