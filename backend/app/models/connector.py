"""ConnectorConfig — per-workspace connector credentials + schedule (C1, C2, C3)."""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class ConnectorPlatform(str, enum.Enum):
    REDDIT = "reddit"
    X = "x"


class ConnectorConfig(Base):
    __tablename__ = "connector_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    platform = Column(Enum(ConnectorPlatform), nullable=False)
    is_active = Column(String(8), nullable=False, default="true")

    # Encrypted credentials stored as JSONB (encrypt at app layer)
    credentials = Column(JSONB, nullable=True)

    # Budget caps (C3.2)
    daily_request_cap = Column(Integer, nullable=True)
    monthly_request_cap = Column(Integer, nullable=True)
    requests_today = Column(Integer, nullable=False, default=0)
    requests_this_month = Column(Integer, nullable=False, default=0)

    # Coverage indicator (C2.2)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="connectors")
