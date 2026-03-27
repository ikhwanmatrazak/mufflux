from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, Enum, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(
        Enum("pending", "paid", "processing", "shipped", "delivered", "cancelled"),
        nullable=False, default="pending"
    )
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    shipping_fee = Column(DECIMAL(10, 2), nullable=False, default=0)
    discount_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    loyalty_discount = Column(DECIMAL(10, 2), nullable=False, default=0)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=True)
    payment_ref = Column(String(255), nullable=True)
    shipping_type = Column(Enum("delivery", "pickup", "installation"), nullable=False, default="delivery")
    courier = Column(String(50), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    address = relationship("OrderAddress", back_populates="order", uselist=False, cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    installation_booking = relationship("InstallationBooking", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    qty = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant", back_populates="order_items")


class OrderAddress(Base):
    __tablename__ = "order_addresses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postcode = Column(String(10), nullable=False)

    order = relationship("Order", back_populates="address")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    gateway = Column(Enum("billplz"), nullable=False, default="billplz")
    billplz_bill_id = Column(String(255), nullable=True)
    billplz_url = Column(String(500), nullable=True)
    amount_myr = Column(DECIMAL(10, 2), nullable=False)
    status = Column(Enum("pending", "paid", "failed"), nullable=False, default="pending")
    paid_at = Column(DateTime, nullable=True)
    callback_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", back_populates="payment")


class ShippingRate(Base):
    __tablename__ = "shipping_rates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    courier = Column(Enum("poslaju", "jnt", "dhl", "flat"), nullable=False)
    zone = Column(String(50), nullable=False)
    min_weight = Column(DECIMAL(5, 2), nullable=False, default=0)
    max_weight = Column(DECIMAL(5, 2), nullable=False)
    rate_myr = Column(DECIMAL(10, 2), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)


class InstallationBooking(Base):
    __tablename__ = "installation_bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    preferred_date = Column(String(10), nullable=False)
    preferred_time = Column(String(8), nullable=False)
    workshop_location = Column(String(255), nullable=True)
    status = Column(Enum("pending", "confirmed", "completed", "cancelled"), nullable=False, default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", back_populates="installation_booking")
    user = relationship("User", back_populates="installation_bookings")


class DiscountCode(Base):
    __tablename__ = "discount_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), nullable=False, unique=True)
    type = Column(Enum("percent", "fixed"), nullable=False)
    value = Column(DECIMAL(10, 2), nullable=False)
    min_order_myr = Column(DECIMAL(10, 2), nullable=False, default=0)
    max_uses = Column(Integer, nullable=True)
    used_count = Column(Integer, nullable=False, default=0)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
