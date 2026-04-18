from sqlalchemy import Column, Integer, String, Text, Float, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ClaimType(str, enum.Enum):
    warranty = "warranty"
    defect = "defect"
    wrong_item = "wrong_item"
    refund = "refund"
    service = "service"
    other = "other"


class ClaimStatus(str, enum.Enum):
    pending = "pending"
    reviewing = "reviewing"
    approved = "approved"
    rejected = "rejected"


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    claim_type = Column(Enum(ClaimType), nullable=False, default=ClaimType.other)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=True)
    status = Column(Enum(ClaimStatus), nullable=False, default=ClaimStatus.pending)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="claims")
    attachments = relationship("ClaimAttachment", back_populates="claim", cascade="all, delete-orphan")


class ClaimAttachment(Base):
    __tablename__ = "claim_attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    file_url = Column(String(500), nullable=False)
    public_id = Column(String(300), nullable=False)
    file_type = Column(String(50), nullable=False)   # image/jpeg, application/pdf, etc.
    original_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    claim = relationship("Claim", back_populates="attachments")
