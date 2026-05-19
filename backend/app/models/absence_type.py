from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base
from datetime import datetime, timezone


class AbsenceTypeDef(Base):
    """Custom absence types defined by admins (global, not per-team for MVP)."""
    __tablename__ = "absence_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    color = Column(String(7), default="#6366f1")  # hex color for UI
    description = Column(String(500), default="")
    is_default = Column(Boolean, default=False)    # pre-defined, cannot be deleted
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
