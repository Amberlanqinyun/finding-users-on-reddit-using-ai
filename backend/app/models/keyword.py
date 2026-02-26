"""KeywordSet + KeywordSuggestion — tickets D1, D2."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class KeywordSet(Base):
    """User-managed keyword set with include/exclude lists (D1.1)."""

    __tablename__ = "keyword_sets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    include_keywords = Column(JSONB, nullable=False, default=list)  # list[str]
    exclude_keywords = Column(JSONB, nullable=False, default=list)  # list[str]
    subreddits = Column(JSONB, nullable=False, default=list)         # list[str]
    never_show_rules = Column(JSONB, nullable=False, default=list)   # D1.2 rules
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    suggestions = relationship("KeywordSuggestion", back_populates="keyword_set", cascade="all, delete-orphan")


class KeywordSuggestion(Base):
    """AI-generated keyword suggestions with approve/reject decisions (D2)."""

    __tablename__ = "keyword_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keyword_set_id = Column(UUID(as_uuid=True), ForeignKey("keyword_sets.id", ondelete="CASCADE"), nullable=False)
    keyword = Column(String(255), nullable=False)
    cluster = Column(String(64), nullable=True)  # e.g. "how_do_i", "alternatives"
    decision = Column(String(16), nullable=True)  # "approved" | "rejected" | None
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    keyword_set = relationship("KeywordSet", back_populates="suggestions")
