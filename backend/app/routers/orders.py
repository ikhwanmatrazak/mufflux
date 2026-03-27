from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.order import Order, OrderItem, OrderAddress, DiscountCode, InstallationBooking, ShippingRate
from app.models.product import Product, ProductVariant
from app.models.user import User, LoyaltyTransaction
from app.schemas.order import (
    OrderCreate, OrderOut, OrderStatusUpdate,
    InstallationBookingCreate, InstallationBookingOut,
    DiscountCodeValidate, DiscountCodeOut,
    ShippingRateOut,
)
from app.utils.jwt import get_current_user_id, require_admin
from decimal import Decimal

router = APIRouter(tags=["orders"])

LOYALTY_RATE = 10  # 1 point per RM10 spent
LOYALTY_MYR_PER_POINT = Decimal("0.10")  # RM0.10 per point


@router.post("/orders", response_model=OrderOut)
def create_order(payload: OrderCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    subtotal = Decimal("0")
    items_to_create = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        unit_price = product.price
        if item.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
            if variant:
                unit_price += variant.price_modifier
                if variant.stock_qty < item.qty:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for variant {variant.variant_name}")
        elif product.stock_qty < item.qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name_en}")

        item_subtotal = unit_price * item.qty
        subtotal += item_subtotal
        items_to_create.append((item, unit_price, item_subtotal))

    # Discount code
    discount_amount = Decimal("0")
    if payload.discount_code:
        code = db.query(DiscountCode).filter(
            DiscountCode.code == payload.discount_code,
            DiscountCode.is_active == True
        ).first()
        if code and subtotal >= code.min_order_myr:
            if code.max_uses is None or code.used_count < code.max_uses:
                if code.type == "percent":
                    discount_amount = subtotal * (code.value / 100)
                else:
                    discount_amount = min(code.value, subtotal)
                code.used_count += 1

    # Loyalty points
    loyalty_discount = Decimal("0")
    if payload.loyalty_points_used > 0:
        max_points = min(payload.loyalty_points_used, user.loyalty_points)
        loyalty_discount = min(max_points * LOYALTY_MYR_PER_POINT, subtotal - discount_amount)
        actual_points_used = int(loyalty_discount / LOYALTY_MYR_PER_POINT)
        user.loyalty_points -= actual_points_used
        db.add(LoyaltyTransaction(user_id=user_id, points=-actual_points_used, type="redeem", reference="order"))

    # Shipping fee (simple flat rate for now)
    shipping_fee = Decimal("0")
    if payload.shipping_type == "delivery":
        shipping_fee = Decimal("10.00")

    total_amount = subtotal - discount_amount - loyalty_discount + shipping_fee

    order = Order(
        user_id=user_id,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        discount_amount=discount_amount,
        loyalty_discount=loyalty_discount,
        total_amount=total_amount,
        shipping_type=payload.shipping_type,
        courier=payload.courier,
        notes=payload.notes,
    )
    db.add(order)
    db.flush()

    for item, unit_price, item_subtotal in items_to_create:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            qty=item.qty,
            unit_price=unit_price,
            subtotal=item_subtotal,
        ))
        # Deduct stock
        product = db.query(Product).filter(Product.id == item.product_id).first()
        product.stock_qty -= item.qty

    if payload.address and payload.shipping_type == "delivery":
        db.add(OrderAddress(order_id=order.id, **payload.address.model_dump()))

    # Earn loyalty points
    earned_points = int(float(total_amount) // LOYALTY_RATE)
    if earned_points > 0:
        user.loyalty_points += earned_points
        db.add(LoyaltyTransaction(user_id=user_id, points=earned_points, type="earn", reference=f"order_{order.id}"))

    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=List[OrderOut])
def list_orders(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 20,
):
    from sqlalchemy.orm import joinedload
    q = db.query(Order).options(joinedload(Order.items), joinedload(Order.address))
    q = q.filter(Order.user_id == user_id)
    return q.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit).all()


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    order = (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.address))
        .filter(Order.id == order_id, Order.user_id == user_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/orders/{order_id}/status")
def update_order_status(order_id: int, payload: OrderStatusUpdate, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    if payload.tracking_number:
        order.tracking_number = payload.tracking_number
    db.commit()
    return {"detail": "Order updated"}


@router.get("/shipping/rates", response_model=list)
def get_shipping_rates(courier: str = None, weight: float = None, db: Session = Depends(get_db)):
    q = db.query(ShippingRate).filter(ShippingRate.is_active == True)
    if courier:
        q = q.filter(ShippingRate.courier == courier)
    if weight:
        q = q.filter(ShippingRate.min_weight <= weight, ShippingRate.max_weight >= weight)
    return q.all()


@router.post("/installation/bookings", response_model=InstallationBookingOut)
def create_booking(payload: InstallationBookingCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    booking = InstallationBooking(user_id=user_id, **payload.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/installation/bookings", response_model=List[InstallationBookingOut])
def list_bookings(admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(InstallationBooking).order_by(InstallationBooking.preferred_date).all()


@router.put("/installation/bookings/{booking_id}")
def update_booking(booking_id: int, status: str, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    booking = db.query(InstallationBooking).filter(InstallationBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = status
    db.commit()
    return {"detail": "Booking updated"}


@router.post("/discount/validate", response_model=DiscountCodeOut)
def validate_discount(payload: DiscountCodeValidate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    code = db.query(DiscountCode).filter(
        DiscountCode.code == payload.code,
        DiscountCode.is_active == True
    ).first()
    if not code:
        raise HTTPException(status_code=404, detail="Discount code not found or inactive")

    if code.expires_at and code.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Discount code has expired")

    if payload.order_subtotal < code.min_order_myr:
        raise HTTPException(status_code=400, detail=f"Minimum order of RM{code.min_order_myr} required")

    if code.max_uses and code.used_count >= code.max_uses:
        raise HTTPException(status_code=400, detail="Discount code has reached maximum uses")

    if code.type == "percent":
        discount_amount = payload.order_subtotal * (code.value / 100)
    else:
        discount_amount = min(code.value, payload.order_subtotal)

    return DiscountCodeOut(code=code.code, type=code.type, value=code.value, discount_amount=discount_amount)
