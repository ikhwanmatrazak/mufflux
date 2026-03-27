from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.order import Order, Payment
from app.utils.jwt import get_current_user_id
from app.utils.billplz import create_bill, verify_signature
import os

router = APIRouter(prefix="/payments", tags=["payments"])

FRONTEND_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:3000").replace("api.", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


@router.post("/billplz")
async def create_billplz_payment(
    order_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()

    amount_sen = int(float(order.total_amount) * 100)

    result = await create_bill(
        order_id=order.id,
        amount_sen=amount_sen,
        email=user.email,
        name=user.name,
        description=f"Mufflux Order #{order.id}",
        callback_url=f"{BACKEND_URL}/payments/billplz/callback",
        redirect_url=f"{FRONTEND_URL}/checkout/confirmation?order_id={order.id}",
    )

    payment = Payment(
        order_id=order.id,
        gateway="billplz",
        billplz_bill_id=result["bill_id"],
        billplz_url=result["payment_url"],
        amount_myr=order.total_amount,
        status="pending",
    )
    db.add(payment)
    db.commit()

    return {"payment_url": result["payment_url"], "bill_id": result["bill_id"]}


@router.post("/billplz/callback")
async def billplz_callback(
    request: Request,
    x_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    form = await request.form()
    payload = dict(form)

    if x_signature and not verify_signature(payload, x_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    bill_id = payload.get("id")
    paid = payload.get("paid") == "true"

    payment = db.query(Payment).filter(Payment.billplz_bill_id == bill_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    if paid:
        payment.status = "paid"
        from datetime import datetime
        payment.paid_at = datetime.utcnow()
        payment.callback_data = payload

        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "paid"
            order.payment_ref = bill_id
    else:
        payment.status = "failed"

    db.commit()
    return {"detail": "Webhook processed"}
