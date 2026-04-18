"""
Claims router — users can submit warranty/defect/refund claims with file attachments.
AI extraction endpoint uses Claude vision to auto-fill claim details from an uploaded image.
"""
import os
import uuid
import base64
from pathlib import Path
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.claim import Claim, ClaimAttachment, ClaimType, ClaimStatus
from app.utils.jwt import get_current_user_id, require_admin

router = APIRouter(prefix="/claims", tags=["claims"])

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf",
}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


# ── Schemas ──────────────────────────────────────────────────────────────────

class ClaimCreate(BaseModel):
    title: str
    claim_type: ClaimType = ClaimType.other
    description: Optional[str] = None
    amount: Optional[float] = None


class ClaimUpdate(BaseModel):
    title: Optional[str] = None
    claim_type: Optional[ClaimType] = None
    description: Optional[str] = None
    amount: Optional[float] = None


class AdminClaimUpdate(BaseModel):
    status: Optional[ClaimStatus] = None
    admin_notes: Optional[str] = None


def claim_to_dict(claim: Claim) -> dict:
    return {
        "id": claim.id,
        "user_id": claim.user_id,
        "user_name": claim.user.name if claim.user else None,
        "user_email": claim.user.email if claim.user else None,
        "title": claim.title,
        "claim_type": claim.claim_type,
        "description": claim.description,
        "amount": claim.amount,
        "status": claim.status,
        "admin_notes": claim.admin_notes,
        "created_at": claim.created_at.isoformat() if claim.created_at else None,
        "updated_at": claim.updated_at.isoformat() if claim.updated_at else None,
        "attachments": [
            {
                "id": a.id,
                "file_url": a.file_url,
                "file_type": a.file_type,
                "original_filename": a.original_filename,
            }
            for a in claim.attachments
        ],
    }


# ── File save helper ──────────────────────────────────────────────────────────

async def save_attachment(file: UploadFile) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only images (jpg/png/webp/gif) and PDF files are allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File must be under 10 MB")

    dest_dir = UPLOAD_DIR / "claims"
    dest_dir.mkdir(parents=True, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "bin"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest_path = dest_dir / filename

    with open(dest_path, "wb") as f:
        f.write(contents)

    public_id = f"claims/{filename}"
    file_url = f"{BACKEND_URL}/uploads/{public_id}"

    return {
        "file_url": file_url,
        "public_id": public_id,
        "file_type": file.content_type,
        "original_filename": file.filename,
        "contents": contents,
    }


# ── AI extraction ─────────────────────────────────────────────────────────────

async def extract_with_ai(contents: bytes, file_type: str) -> dict:
    """
    Send image to Claude vision API to extract claim details.
    Returns a dict with title, description, amount fields (best-effort).
    Falls back to empty dict if ANTHROPIC_API_KEY is not set.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {}

    # Only images are supported for vision (not PDF)
    if not file_type.startswith("image/"):
        return {}

    try:
        import httpx
        b64 = base64.standard_b64encode(contents).decode("utf-8")
        media_type = file_type  # e.g. image/jpeg

        payload = {
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 512,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": (
                                "You are helping a user fill in a claim form. "
                                "Look at this image (it may be a receipt, invoice, product photo, or damage photo). "
                                "Extract the following details if visible:\n"
                                "- title: a short 5-10 word summary of the claim\n"
                                "- description: a brief 1-3 sentence description of the issue\n"
                                "- amount: the monetary amount in RM (number only, no currency symbol), or null if not visible\n"
                                "- claim_type: one of warranty, defect, wrong_item, refund, service, other\n\n"
                                "Respond ONLY with a JSON object like:\n"
                                '{"title":"...","description":"...","amount":null,"claim_type":"other"}'
                            ),
                        },
                    ],
                }
            ],
        }

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                json=payload,
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
            )
            resp.raise_for_status()
            text = resp.json()["content"][0]["text"].strip()

            # Parse JSON from response
            import json
            # Handle case where Claude wraps in ```json
            if "```" in text:
                text = text.split("```")[1].replace("json", "").strip()
            result = json.loads(text)
            return result

    except Exception:
        return {}


# ── User endpoints ─────────────────────────────────────────────────────────────

@router.post("/extract")
async def extract_from_file(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
):
    """Upload a file and get AI-extracted claim details back (no DB write)."""
    saved = await save_attachment(file)
    extracted = await extract_with_ai(saved["contents"], saved["file_type"])
    return {
        "extracted": extracted,
        "attachment": {
            "file_url": saved["file_url"],
            "public_id": saved["public_id"],
            "file_type": saved["file_type"],
            "original_filename": saved["original_filename"],
        },
    }


@router.post("")
async def create_claim(
    title: str = Form(...),
    claim_type: ClaimType = Form(ClaimType.other),
    description: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    claim = Claim(
        user_id=user_id,
        title=title,
        claim_type=claim_type,
        description=description,
        amount=amount,
    )
    db.add(claim)
    db.flush()  # get claim.id before attachments

    if files:
        for f in files:
            if f.filename:
                saved = await save_attachment(f)
                att = ClaimAttachment(
                    claim_id=claim.id,
                    file_url=saved["file_url"],
                    public_id=saved["public_id"],
                    file_type=saved["file_type"],
                    original_filename=saved["original_filename"],
                )
                db.add(att)

    db.commit()
    db.refresh(claim)
    return claim_to_dict(claim)


@router.get("/my")
def list_my_claims(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    claims = (
        db.query(Claim)
        .filter(Claim.user_id == user_id)
        .order_by(Claim.created_at.desc())
        .all()
    )
    return [claim_to_dict(c) for c in claims]


@router.get("/{claim_id}")
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your claim")
    return claim_to_dict(claim)


@router.put("/{claim_id}")
def update_claim(
    claim_id: int,
    data: ClaimUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your claim")
    if claim.status != ClaimStatus.pending:
        raise HTTPException(status_code=400, detail="Only pending claims can be edited")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(claim, field, val)

    db.commit()
    db.refresh(claim)
    return claim_to_dict(claim)


@router.post("/{claim_id}/attachments")
async def add_attachment(
    claim_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your claim")

    saved = await save_attachment(file)
    att = ClaimAttachment(
        claim_id=claim.id,
        file_url=saved["file_url"],
        public_id=saved["public_id"],
        file_type=saved["file_type"],
        original_filename=saved["original_filename"],
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return {"id": att.id, "file_url": att.file_url, "file_type": att.file_type, "original_filename": att.original_filename}


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get("/admin/all")
def admin_list_claims(
    status: Optional[ClaimStatus] = Query(None),
    db: Session = Depends(get_db),
    _: int = Depends(require_admin),
):
    q = db.query(Claim).order_by(Claim.created_at.desc())
    if status:
        q = q.filter(Claim.status == status)
    return [claim_to_dict(c) for c in q.all()]


@router.put("/admin/{claim_id}")
def admin_update_claim(
    claim_id: int,
    data: AdminClaimUpdate,
    db: Session = Depends(get_db),
    _: int = Depends(require_admin),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(claim, field, val)

    db.commit()
    db.refresh(claim)
    return claim_to_dict(claim)
