from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from passlib.context import CryptContext
from app.database import get_db
from app.models.user import User, Address
from app.schemas.user import UserOut, UserUpdate, AddressCreate, AddressOut
from app.utils.jwt import get_current_user_id, require_admin

router = APIRouter(tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/users", response_model=List[UserOut])
def list_users(admin_id: int = Depends(require_admin), db: Session = Depends(get_db), page: int = 1, limit: int = 50):
    return db.query(User).order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()


@router.put("/users/me", response_model=UserOut)
def update_profile(payload: UserUpdate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.name:
        user.name = payload.name
    if payload.phone:
        user.phone = payload.phone
    if payload.password:
        if len(payload.password) < 8:
            raise HTTPException(status_code=400, detail="Password too short")
        user.password_hash = pwd_context.hash(payload.password)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users/me/addresses", response_model=List[AddressOut])
def get_addresses(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return db.query(Address).filter(Address.user_id == user_id).order_by(Address.is_default.desc()).all()


@router.post("/users/me/addresses", response_model=AddressOut)
def add_address(payload: AddressCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    if payload.is_default:
        db.query(Address).filter(Address.user_id == user_id).update({"is_default": False})
    address = Address(user_id=user_id, **payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/users/me/addresses/{address_id}", response_model=AddressOut)
def update_address(address_id: int, payload: AddressCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if payload.is_default:
        db.query(Address).filter(Address.user_id == user_id).update({"is_default": False})
    for field, value in payload.model_dump().items():
        setattr(address, field, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/users/me/addresses/{address_id}")
def delete_address(address_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(address)
    db.commit()
    return {"detail": "Address deleted"}
