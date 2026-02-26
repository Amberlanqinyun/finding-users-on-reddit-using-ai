"""Draft + DraftVariant — tickets F1, F2, F3."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Draft(Base):
    """A set of reply variants generated for one opportunity."""

    __tablename__ = "drafts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    brief_id = Column(UUID(as_uuid=True), ForeignKey("product_briefs.id"), nullable=True)
    is_dm = Column(Boolean, nullable=False, default=False)  # F2 — DM drafts
    dm_invitation_confirmed = Column(Boolean, nullable=True)  # F2.1 safety gate
    tone = Column(String(64), nullable=True)
    post_excerpt = Column(Text, nullable=True)  # specific detail referenced (F1.1)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    opportunity = relationship("Opportunity", back_populates="drafts")
    variants = relationship("DraftVariant", back_populates="draft", cascade="all, delete-orphan")


class DraftVariant(Base):
    """One draft reply variant. Users copy from these — never auto-posted."""

    __tablename__ = "draft_variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    draft_id = Column(UUID(as_uuid=True), ForeignKey("drafts.id", ondelete="CASCADE"), nullable=False)
    variant_index = Column(Integer, nullable=False)  # 0, 1, 2
    body = Column(Text, nullable=False)
    salesiness_score = Column(Float, nullable=True)   # F1.2
    warnings = Column(JSONB, nullable=True)            # F1.2 highlighted issues
    copied_at = Column(DateTime, nullable=True)        # H2.2 telemetry: draft_copied

    draft = relationship("Draft", back_populates="variants")
