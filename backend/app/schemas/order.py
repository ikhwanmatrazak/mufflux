from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class OrderAddressCreate(BaseModel):
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postcode: str


class CartItemIn(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    qty: int


class OrderCreate(BaseModel):
    items: List[CartItemIn]
    shipping_type: str = "delivery"
    courier: Optional[str] = None
    address: Optional[OrderAddressCreate] = None
    discount_code: Optional[str] = None
    loyalty_points_used: int = 0
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int]
    qty: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


class OrderAddressOut(BaseModel):
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str]
    city: str
    state: str
    postcode: str

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    subtotal: Decimal
    shipping_fee: Decimal
    discount_amount: Decimal
    loyalty_discount: Decimal
    total_amount: Decimal
    payment_method: Optional[str]
    payment_ref: Optional[str]
    shipping_type: str
    courier: Optional[str]
    tracking_number: Optional[str]
    notes: Optional[str]
    items: List[OrderItemOut] = []
    address: Optional[OrderAddressOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None


class ShippingRateOut(BaseModel):
    id: int
    courier: str
    zone: str
    min_weight: Decimal
    max_weight: Decimal
    rate_myr: Decimal

    model_config = {"from_attributes": True}


class InstallationBookingCreate(BaseModel):
    order_id: Optional[int] = None
    preferred_date: str
    preferred_time: str
    workshop_location: Optional[str] = None
    notes: Optional[str] = None


class InstallationBookingOut(BaseModel):
    id: int
    order_id: Optional[int]
    user_id: int
    preferred_date: str
    preferred_time: str
    workshop_location: Optional[str]
    status: str
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class DiscountCodeValidate(BaseModel):
    code: str
    order_subtotal: Decimal


class DiscountCodeOut(BaseModel):
    code: str
    type: str
    value: Decimal
    discount_amount: Decimal
