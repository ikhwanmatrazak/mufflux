from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, HTMLResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timedelta
import csv
import io
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.product import Product
from app.utils.jwt import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def dashboard_stats(admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)

    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.status.in_(["paid", "processing", "shipped", "delivered"])
    ).scalar() or 0

    orders_today = db.query(func.count(Order.id)).filter(
        func.date(Order.created_at) == today
    ).scalar() or 0

    low_stock = db.query(func.count(Product.id)).filter(
        Product.stock_qty <= 5, Product.is_active == True
    ).scalar() or 0

    new_signups = db.query(func.count(User.id)).filter(
        func.date(User.created_at) >= month_start
    ).scalar() or 0

    # Revenue last 7 days
    revenue_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        rev = db.query(func.sum(Order.total_amount)).filter(
            func.date(Order.created_at) == day,
            Order.status.in_(["paid", "processing", "shipped", "delivered"])
        ).scalar() or 0
        revenue_chart.append({"date": str(day), "revenue": float(rev)})

    return {
        "total_revenue": float(total_revenue),
        "orders_today": orders_today,
        "low_stock_count": low_stock,
        "new_signups_this_month": new_signups,
        "revenue_chart": revenue_chart,
    }


@router.get("/orders")
def admin_list_orders(
    page: int = 1,
    limit: int = 100,
    status: str = None,
    admin_id: int = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.address),
        joinedload(Order.payment),
    )
    if status:
        q = q.filter(Order.status == status)
    orders = q.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "status": o.status,
            "total_amount": float(o.total_amount),
            "subtotal": float(o.subtotal),
            "shipping_fee": float(o.shipping_fee),
            "discount_amount": float(o.discount_amount),
            "loyalty_discount": float(o.loyalty_discount),
            "shipping_type": o.shipping_type,
            "courier": o.courier,
            "tracking_number": o.tracking_number,
            "payment_ref": o.payment_ref,
            "notes": o.notes,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "user": {"id": o.user.id, "name": o.user.name, "email": o.user.email, "phone": getattr(o.user, "phone", None)} if o.user else None,
            "items": [{"product_name": (i.product.name_en if i.product else "Unknown"), "qty": i.qty, "unit_price": float(i.unit_price), "subtotal": float(i.subtotal)} for i in o.items],
            "address": {"name": o.address.name, "phone": o.address.phone, "address_line1": o.address.address_line1, "address_line2": o.address.address_line2, "city": o.address.city, "state": o.address.state, "postcode": o.address.postcode} if o.address else None,
            "payment": {"status": o.payment.status, "paid_at": o.payment.paid_at.isoformat() if o.payment and o.payment.paid_at else None, "gateway": o.payment.gateway if o.payment else None} if o.payment else None,
        })
    return result


@router.get("/orders/{order_id}")
def admin_get_order(order_id: int, admin_id: int = Depends(require_admin), db: Session = Depends(get_db)):
    o = db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.address),
        joinedload(Order.payment),
    ).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": o.id,
        "status": o.status,
        "total_amount": float(o.total_amount),
        "subtotal": float(o.subtotal),
        "shipping_fee": float(o.shipping_fee),
        "discount_amount": float(o.discount_amount),
        "loyalty_discount": float(o.loyalty_discount),
        "shipping_type": o.shipping_type,
        "courier": o.courier,
        "tracking_number": o.tracking_number,
        "payment_ref": o.payment_ref,
        "notes": o.notes,
        "created_at": o.created_at.isoformat() if o.created_at else None,
        "user": {"id": o.user.id, "name": o.user.name, "email": o.user.email, "phone": getattr(o.user, "phone", None)} if o.user else None,
        "items": [{"product_name": (i.product.name_en if i.product else "Unknown"), "qty": i.qty, "unit_price": float(i.unit_price), "subtotal": float(i.subtotal)} for i in o.items],
        "address": {"name": o.address.name, "phone": o.address.phone, "address_line1": o.address.address_line1, "address_line2": o.address.address_line2, "city": o.address.city, "state": o.address.state, "postcode": o.address.postcode} if o.address else None,
        "payment": {"status": o.payment.status, "paid_at": o.payment.paid_at.isoformat() if o.payment and o.payment.paid_at else None, "gateway": o.payment.gateway if o.payment else None} if o.payment else None,
    }


@router.get("/reports/orders")
def download_orders_report(
    start_date: str = None,
    end_date: str = None,
    admin_id: int = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Order).options(joinedload(Order.user), joinedload(Order.address))
    if start_date:
        q = q.filter(Order.created_at >= start_date)
    if end_date:
        q = q.filter(Order.created_at <= end_date + " 23:59:59")
    orders = q.order_by(Order.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order ID", "Date", "Customer Name", "Customer Email",
        "Status", "Subtotal (RM)", "Shipping (RM)", "Discount (RM)",
        "Total (RM)", "Shipping Type", "Courier", "Tracking No",
        "Payment Ref", "Delivery Address",
    ])
    for o in orders:
        address_str = ""
        if o.address:
            parts = [o.address.address_line1, o.address.address_line2, o.address.city, o.address.state, o.address.postcode]
            address_str = ", ".join(p for p in parts if p)
        writer.writerow([
            f"#{o.id}",
            o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "",
            o.user.name if o.user else "",
            o.user.email if o.user else "",
            o.status,
            f"{float(o.subtotal):.2f}",
            f"{float(o.shipping_fee):.2f}",
            f"{float(o.discount_amount):.2f}",
            f"{float(o.total_amount):.2f}",
            o.shipping_type,
            o.courier or "",
            o.tracking_number or "",
            o.payment_ref or "",
            address_str,
        ])

    csv_bytes = output.getvalue().encode("utf-8-sig")  # utf-8-sig for Excel compatibility
    filename = f"mufflux_orders_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
