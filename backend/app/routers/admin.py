from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models.order import Order
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
