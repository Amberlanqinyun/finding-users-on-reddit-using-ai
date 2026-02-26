"""ExportIntegration + ExportRecord — tickets G2, G3."""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
import enum

from app.core.database import Base


class ExportProvider(str, enum.Enum):
    NOTION = "notion"
    GOOGLE_SHEETS = "google_sheets"


class ExportStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    PENDING = "pending"


class ExportIntegration(Base):
    """OAuth connection to Notion or Google Sheets (G2.1, G3.1)."""

    __tablename__ = "export_integrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    provider = Column(Enum(ExportProvider), nullable=False)
    # Encrypted OAuth tokens stored as JSONB
    credentials = Column(JSONB, nullable=True)
    # Notion: database_id / Sheets: spreadsheet_id + sheet_name
    destination_config = Column(JSONB, nullable=True)
    is_active = Column(String(8), default="true")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ExportRecord(Base):
    """Stable ID linking an Opportunity to its exported row (G2.2, G3.2)."""

    __tablename__ = "export_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    integration_id = Column(UUID(as_uuid=True), ForeignKey("export_integrations.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    # Stable external ID: Notion page ID or Sheets row ID
    external_id = Column(String(512), nullable=False)
    status = Column(Enum(ExportStatus), nullable=False, default=ExportStatus.PENDING)
    last_synced_at = Column(DateTime, nullable=True)
    error_message = Column(String(1024), nullable=True)
