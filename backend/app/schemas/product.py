from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class CategoryOut(BaseModel):
    id: int
    name_en: str
    name_bm: str
    slug: str
    image_url: Optional[str]
    sort_order: int

    model_config = {"from_attributes": True}


class MotorcycleBrandOut(BaseModel):
    id: int
    name: str
    logo_url: Optional[str]

    model_config = {"from_attributes": True}


class MotorcycleModelOut(BaseModel):
    id: int
    brand_id: int
    name: str
    year_from: int
    year_to: Optional[int]

    model_config = {"from_attributes": True}


class EngineSizeOut(BaseModel):
    id: int
    cc: int
    label: str

    model_config = {"from_attributes": True}


class ProductImageOut(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


class ProductVariantOut(BaseModel):
    id: int
    variant_name: str
    price_modifier: Decimal
    stock_qty: int
    sku: str

    model_config = {"from_attributes": True}


class ProductFitmentOut(BaseModel):
    id: int
    brand_id: int
    model_id: int
    engine_size_id: Optional[int]

    model_config = {"from_attributes": True}


class ReviewOut(BaseModel):
    id: int
    user_id: int
    rating: int
    comment: Optional[str]
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: int
    name_en: str
    name_bm: str
    slug: str
    description_en: Optional[str]
    description_bm: Optional[str]
    price: Decimal
    compare_price: Optional[Decimal]
    sku: str
    stock_qty: int
    weight_kg: Optional[Decimal]
    is_active: bool
    category_id: Optional[int]
    images: List[ProductImageOut] = []
    variants: List[ProductVariantOut] = []
    fitments: List[ProductFitmentOut] = []
    reviews: List[ReviewOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    id: int
    name_en: str
    name_bm: str
    slug: str
    price: Decimal
    compare_price: Optional[Decimal]
    stock_qty: int
    is_active: bool
    images: List[ProductImageOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    name_en: str
    name_bm: str
    slug: str
    description_en: Optional[str] = None
    description_bm: Optional[str] = None
    price: Decimal
    compare_price: Optional[Decimal] = None
    sku: str
    stock_qty: int = 0
    weight_kg: Optional[Decimal] = None
    category_id: Optional[int] = None
    is_active: bool = True


class ProductUpdate(BaseModel):
    name_en: Optional[str] = None
    name_bm: Optional[str] = None
    description_en: Optional[str] = None
    description_bm: Optional[str] = None
    price: Optional[Decimal] = None
    compare_price: Optional[Decimal] = None
    stock_qty: Optional[int] = None
    weight_kg: Optional[Decimal] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None


class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None

    model_config = {}
