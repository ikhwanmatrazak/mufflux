from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostOut
from app.utils.jwt import get_current_user_id, require_admin

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("", response_model=List[BlogPostOut])
def list_posts(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    return (
        db.query(BlogPost)
        .filter(BlogPost.is_published == True)
        .order_by(BlogPost.published_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )


@router.get("/{slug}", response_model=BlogPostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=BlogPostOut)
def create_post(payload: BlogPostCreate, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    post = BlogPost(
        **payload.model_dump(),
        author_id=admin_id,
        published_at=datetime.utcnow() if payload.is_published else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostOut)
def update_post(post_id: int, payload: BlogPostUpdate, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(post, field, value)

    if payload.is_published and not post.published_at:
        post.published_at = datetime.utcnow()

    db.commit()
    db.refresh(post)
    return post
