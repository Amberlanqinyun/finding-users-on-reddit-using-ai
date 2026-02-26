"""
Opportunity — a scored SourceItem that enters the triage workflow (H1.1).

Status pipeline: New → Reviewed → Drafted → Posted → Replied → Follow-up → Won/Lost
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class OpportunityStatus(str, enum.Enum):
    NEW = "new"
    REVIEWED = "reviewed"
    DRAFTED = "drafted"
    POSTED = "posted"
    REPLIED = "replied"
    FOLLOW_UP = "follow_up"
    WON = "won"
    LOST = "lost"


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    source_item_id = Column(UUID(as_uuid=True), ForeignKey("source_items.id", ondelete="CASCADE"), nullable=False, unique=True)
    brief_id = Column(UUID(as_uuid=True), ForeignKey("product_briefs.id"), nullable=True)

    status = Column(Enum(OpportunityStatus), nullable=False, default=OpportunityStatus.NEW)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)

    # Digest membership — tracks which digest this item appeared in
    last_digest_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # auto-expire low-urgency (E3.2)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source_item = relationship("SourceItem", back_populates="opportunity")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    drafts = relationship("Draft", back_populates="opportunity", cascade="all, delete-orphan")
    activity = relationship("OpportunityActivity", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunityActivity(Base):
    """Audit trail for status changes and notes on an opportunity (H1.2)."""

    __tablename__ = "opportunity_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    event = Column(String(64), nullable=False)  # status_changed, note_added, assigned
    payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    opportunity = relationship("Opportunity", back_populates="activity")
