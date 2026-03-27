from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BlogPostCreate(BaseModel):
    title_en: str
    title_bm: str
    slug: str
    body_en: Optional[str] = None
    body_bm: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: bool = False


class BlogPostUpdate(BaseModel):
    title_en: Optional[str] = None
    title_bm: Optional[str] = None
    body_en: Optional[str] = None
    body_bm: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: Optional[bool] = None


class BlogPostOut(BaseModel):
    id: int
    title_en: str
    title_bm: str
    slug: str
    body_en: Optional[str]
    body_bm: Optional[str]
    cover_image_url: Optional[str]
    author_id: int
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
