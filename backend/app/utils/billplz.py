import hashlib
import hmac
import httpx
import os
from fastapi import HTTPException

BILLPLZ_API_KEY = os.getenv("BILLPLZ_API_KEY", "")
BILLPLZ_COLLECTION_ID = os.getenv("BILLPLZ_COLLECTION_ID", "")
BILLPLZ_SANDBOX = os.getenv("BILLPLZ_SANDBOX", "true").lower() == "true"

BASE_URL = "https://www.billplz-sandbox.com/api/v3" if BILLPLZ_SANDBOX else "https://www.billplz.com/api/v3"


async def create_bill(
    order_id: int,
    amount_sen: int,
    email: str,
    name: str,
    description: str,
    callback_url: str,
    redirect_url: str,
) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/bills",
            auth=(BILLPLZ_API_KEY, ""),
            data={
                "collection_id": BILLPLZ_COLLECTION_ID,
                "email": email,
                "name": name,
                "amount": str(amount_sen),
                "description": description,
                "callback_url": callback_url,
                "redirect_url": redirect_url,
                "reference_1_label": "Order ID",
                "reference_1": str(order_id),
            },
        )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Billplz bill creation failed")
    data = resp.json()
    return {"bill_id": data["id"], "payment_url": data["url"]}


def verify_signature(payload: dict, x_signature: str) -> bool:
    keys = sorted(payload.keys())
    source = "|".join(f"{k}{payload[k]}" for k in keys)
    expected = hmac.new(BILLPLZ_API_KEY.encode(), source.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, x_signature)
