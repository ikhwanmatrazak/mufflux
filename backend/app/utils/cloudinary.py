import cloudinary
import cloudinary.uploader
import os
from fastapi import HTTPException, UploadFile

cloudinary.config(
    cloudinary_url=os.getenv("CLOUDINARY_URL")
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


async def upload_image(file: UploadFile, folder: str = "mufflux") -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only jpg, png, webp images allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        resource_type="image",
        transformation=[{"quality": "auto", "fetch_format": "auto"}],
    )
    return {
        "image_url": result["secure_url"],
        "public_id": result["public_id"],
    }


def delete_image(public_id: str):
    cloudinary.uploader.destroy(public_id)
