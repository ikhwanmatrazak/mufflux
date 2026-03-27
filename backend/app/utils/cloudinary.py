"""
Local file storage — replaces Cloudinary.
Images are saved to /app/uploads/ inside the container,
served via FastAPI StaticFiles at /uploads/{filename}.
"""
import os
import uuid
import shutil
from pathlib import Path
from fastapi import HTTPException, UploadFile

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# Set this to your public backend URL so the frontend can load images
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


async def upload_image(file: UploadFile, folder: str = "products") -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only jpg, png, webp, gif images allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")

    # Ensure subfolder exists
    dest_dir = UPLOAD_DIR / folder
    dest_dir.mkdir(parents=True, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest_path = dest_dir / filename

    with open(dest_path, "wb") as f:
        f.write(contents)

    public_id = f"{folder}/{filename}"
    image_url = f"{BACKEND_URL}/uploads/{public_id}"

    return {"image_url": image_url, "public_id": public_id}


def delete_image(public_id: str):
    target = UPLOAD_DIR / public_id
    if target.exists():
        target.unlink()
