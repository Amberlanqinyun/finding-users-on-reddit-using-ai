"""Audit log — ticket A1.3."""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.core.database import Base

# Events that must always be logged (A1.3)
AUDITABLE_EVENTS = frozenset({
    "brief_edited",
    "connector_changed",
    "export_sync",
    "member_added",
    "member_removed",
    "member_role_changed",
    "feature_flag_toggled",
})


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    event = Column(String(64), nullable=False, index=True)
    payload = Column(JSONB, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
