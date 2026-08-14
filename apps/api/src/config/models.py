from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Uuid, func, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class BaseModel(Base):
    """Base model with a UUID primary key and audit timestamps."""

    __abstract__ = True

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        onupdate=func.now(),
        nullable=False,
    )
