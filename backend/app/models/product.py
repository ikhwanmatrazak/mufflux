from sqlalchemy import Column, Integer, String, Boolean, Text, DECIMAL, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name_en = Column(String(120), nullable=False)
    name_bm = Column(String(120), nullable=False)
    slug = Column(String(160), nullable=False, unique=True)
    image_url = Column(String(500), nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())

    children = relationship("Category", backref="parent", remote_side=[id])
    products = relationship("Product", back_populates="category")


class MotorcycleBrand(Base):
    __tablename__ = "motorcycle_brands"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    logo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    models = relationship("MotorcycleModel", back_populates="brand", cascade="all, delete-orphan")
    fitments = relationship("ProductFitment", back_populates="brand")


class MotorcycleModel(Base):
    __tablename__ = "motorcycle_models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    brand_id = Column(Integer, ForeignKey("motorcycle_brands.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    year_from = Column(Integer, nullable=False)
    year_to = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    brand = relationship("MotorcycleBrand", back_populates="models")
    fitments = relationship("ProductFitment", back_populates="model")


class EngineSize(Base):
    __tablename__ = "engine_sizes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cc = Column(Integer, nullable=False, unique=True)
    label = Column(String(20), nullable=False)

    fitments = relationship("ProductFitment", back_populates="engine_size")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name_en = Column(String(255), nullable=False)
    name_bm = Column(String(255), nullable=False)
    slug = Column(String(300), nullable=False, unique=True)
    description_en = Column(Text, nullable=True)
    description_bm = Column(Text, nullable=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    compare_price = Column(DECIMAL(10, 2), nullable=True)
    sku = Column(String(100), nullable=False, unique=True)
    stock_qty = Column(Integer, nullable=False, default=0)
    weight_kg = Column(DECIMAL(5, 2), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    fitments = relationship("ProductFitment", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    public_id = Column(String(255), nullable=True)
    is_primary = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)

    product = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_name = Column(String(100), nullable=False)
    price_modifier = Column(DECIMAL(10, 2), nullable=False, default=0)
    stock_qty = Column(Integer, nullable=False, default=0)
    sku = Column(String(100), nullable=False, unique=True)

    product = relationship("Product", back_populates="variants")
    order_items = relationship("OrderItem", back_populates="variant")


class ProductFitment(Base):
    __tablename__ = "product_fitments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_id = Column(Integer, ForeignKey("motorcycle_brands.id"), nullable=False, index=True)
    model_id = Column(Integer, ForeignKey("motorcycle_models.id"), nullable=False, index=True)
    engine_size_id = Column(Integer, ForeignKey("engine_sizes.id", ondelete="SET NULL"), nullable=True)

    product = relationship("Product", back_populates="fitments")
    brand = relationship("MotorcycleBrand", back_populates="fitments")
    model = relationship("MotorcycleModel", back_populates="fitments")
    engine_size = relationship("EngineSize", back_populates="fitments")


class ProductReview(Base):
    __tablename__ = "product_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    is_approved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "product_id"),)

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")
