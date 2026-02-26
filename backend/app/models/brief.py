"""Product Brief — tickets B1, B2, B3."""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class BriefStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"


class ProductBrief(Base):
    __tablename__ = "product_briefs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, default="Default Brief")
    status = Column(Enum(BriefStatus), nullable=False, default=BriefStatus.DRAFT)

    # Structured brief fields (B2.2)
    icp_hypotheses = Column(JSONB, nullable=True)   # list of ICP hypothesis strings
    pains = Column(JSONB, nullable=True)            # list of pain descriptions
    value_props = Column(JSONB, nullable=True)      # list of value propositions
    taboo_phrases = Column(JSONB, nullable=True)    # "what not to say"
    tone_preset = Column(String(64), nullable=True, default="empathetic")
    tone_formality = Column(String(16), nullable=True, default="medium")  # low/medium/high
    voice_examples = Column(JSONB, nullable=True)   # list of example replies (B3.2)
    voice_style_notes = Column(Text, nullable=True) # extracted style notes

    # Source provenance
    source_url = Column(String(2048), nullable=True)  # B1 URL onboarding
    source_file_key = Column(String(512), nullable=True)  # B2 file upload

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="briefs")
    versions = relationship("BriefVersion", back_populates="brief", cascade="all, delete-orphan")


class BriefVersion(Base):
    """Snapshot of brief content at save time (B2.3 version history)."""

    __tablename__ = "brief_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brief_id = Column(UUID(as_uuid=True), ForeignKey("product_briefs.id", ondelete="CASCADE"), nullable=False)
    snapshot = Column(JSONB, nullable=False)  # full brief fields at save time
    saved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    brief = relationship("ProductBrief", back_populates="versions")
