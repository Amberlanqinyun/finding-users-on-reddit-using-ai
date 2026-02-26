"""
SourceItem — normalized representation of a Reddit post, comment, or X post.

All connectors produce SourceItems via the connector interface (C1.1).
Deduplication is by (canonical_url, content_hash) — see C1.2.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class SourcePlatform(str, enum.Enum):
    REDDIT = "reddit"
    X = "x"


class SourceItemType(str, enum.Enum):
    POST = "post"
    COMMENT = "comment"


class SourceItem(Base):
    """Normalized ingested item from any connector."""

    __tablename__ = "source_items"
    __table_args__ = (
        Index("ix_source_items_canonical_url", "canonical_url"),
        Index("ix_source_items_content_hash", "content_hash"),
        Index("ix_source_items_workspace_id", "workspace_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)

    # Connector identity
    platform = Column(Enum(SourcePlatform), nullable=False)
    item_type = Column(Enum(SourceItemType), nullable=False, default=SourceItemType.POST)
    external_id = Column(String(255), nullable=False)  # Reddit post/comment ID, X tweet ID

    # Deduplication (C1.2)
    canonical_url = Column(String(2048), nullable=False)
    content_hash = Column(String(64), nullable=False)  # sha256 of normalized text

    # Content
    title = Column(String(1024), nullable=True)  # posts only
    body = Column(Text, nullable=False)
    author_handle = Column(String(255), nullable=True)
    subreddit = Column(String(255), nullable=True)  # Reddit only

    # Thread context (post → comments relationship)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("source_items.id"), nullable=True)

    # Raw platform metadata (upvotes, replies, etc.)
    platform_metadata = Column(JSONB, nullable=False, default=dict)

    # Scoring (populated after E1/E2)
    intent_label = Column(String(64), nullable=True)
    intent_confidence = Column(Float, nullable=True)
    opportunity_score = Column(Float, nullable=True)
    score_factors = Column(JSONB, nullable=True)  # top 3 factors for explanation

    posted_at = Column(DateTime, nullable=True)
    ingested_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    children = relationship("SourceItem", backref="parent", foreign_keys=[parent_id])
    opportunity = relationship("Opportunity", back_populates="source_item", uselist=False)
