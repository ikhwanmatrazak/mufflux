from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc
from typing import Optional, List
from app.database import get_db
from app.models.product import Product, ProductImage, ProductVariant, ProductFitment, ProductReview, Category, MotorcycleBrand, MotorcycleModel, EngineSize, Wishlist
from app.schemas.product import (
    ProductOut, ProductCreate, ProductUpdate, ProductListOut,
    CategoryOut, ReviewCreate, ReviewOut,
    MotorcycleBrandOut, MotorcycleModelOut, EngineSizeOut
)
from app.utils.jwt import get_current_user_id, require_admin
from app.utils.cloudinary import upload_image

router = APIRouter(tags=["products"])


@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.sort_order).all()


@router.get("/motorcycle/brands", response_model=List[MotorcycleBrandOut])
def list_brands(db: Session = Depends(get_db)):
    return db.query(MotorcycleBrand).order_by(MotorcycleBrand.name).all()


@router.get("/motorcycle/models", response_model=List[MotorcycleModelOut])
def list_models(brand_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(MotorcycleModel)
    if brand_id:
        q = q.filter(MotorcycleModel.brand_id == brand_id)
    return q.order_by(MotorcycleModel.name).all()


@router.get("/motorcycle/engines", response_model=List[EngineSizeOut])
def list_engines(db: Session = Depends(get_db)):
    return db.query(EngineSize).order_by(EngineSize.cc).all()


@router.get("/products", response_model=List[ProductListOut])
def list_products(
    category: Optional[str] = None,
    brand_id: Optional[int] = None,
    model_id: Optional[int] = None,
    cc: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort: str = "newest",
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(Product).options(joinedload(Product.images)).filter(Product.is_active == True)

    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
            q = q.filter(Product.category_id == cat.id)

    if brand_id or model_id or cc:
        engine_id = None
        if cc:
            eng = db.query(EngineSize).filter(EngineSize.cc == cc).first()
            engine_id = eng.id if eng else None

        fitment_q = db.query(ProductFitment.product_id)
        if brand_id:
            fitment_q = fitment_q.filter(ProductFitment.brand_id == brand_id)
        if model_id:
            fitment_q = fitment_q.filter(ProductFitment.model_id == model_id)
        if engine_id:
            fitment_q = fitment_q.filter(ProductFitment.engine_size_id == engine_id)
        product_ids = [r[0] for r in fitment_q.all()]
        q = q.filter(Product.id.in_(product_ids))

    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)

    if sort == "price_asc":
        q = q.order_by(asc(Product.price))
    elif sort == "price_desc":
        q = q.order_by(desc(Product.price))
    else:
        q = q.order_by(desc(Product.created_at))

    offset = (page - 1) * limit
    return q.offset(offset).limit(limit).all()


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.fitments),
            joinedload(Product.reviews),
        )
        .filter(Product.slug == slug, Product.is_active == True)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=ProductOut)
def create_product(payload: ProductCreate, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}


@router.post("/products/{product_id}/images")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    is_primary: bool = False,
    admin_id: int = Depends(require_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    result = await upload_image(file, folder="mufflux/products")
    max_order = db.query(func.max(ProductImage.sort_order)).filter(ProductImage.product_id == product_id).scalar() or 0

    if is_primary:
        db.query(ProductImage).filter(ProductImage.product_id == product_id).update({"is_primary": False})

    image = ProductImage(
        product_id=product_id,
        image_url=result["image_url"],
        public_id=result["public_id"],
        is_primary=is_primary,
        sort_order=max_order + 1,
    )
    db.add(image)
    db.commit()
    return result


@router.get("/wishlist")
def get_wishlist(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    items = db.query(Wishlist).options(joinedload(Wishlist.product)).filter(Wishlist.user_id == user_id).all()
    return [{"id": w.id, "product": w.product} for w in items]


@router.post("/wishlist/{product_id}")
def add_to_wishlist(product_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    existing = db.query(Wishlist).filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id).first()
    if existing:
        return {"detail": "Already in wishlist"}
    db.add(Wishlist(user_id=user_id, product_id=product_id))
    db.commit()
    return {"detail": "Added to wishlist"}


@router.delete("/wishlist/{product_id}")
def remove_from_wishlist(product_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db.query(Wishlist).filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id).delete()
    db.commit()
    return {"detail": "Removed from wishlist"}


@router.post("/reviews", response_model=ReviewOut)
def submit_review(payload: ReviewCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    if not 1 <= payload.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    review = ProductReview(product_id=payload.product_id, user_id=user_id, rating=payload.rating, comment=payload.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.put("/reviews/{review_id}/approve")
def approve_review(review_id: int, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = True
    db.commit()
    return {"detail": "Review approved"}
