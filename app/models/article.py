from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[str] = mapped_column(
        String(30),
        default="draft",
        nullable=False,
    )

    sentiment: Mapped[str] = mapped_column(
        String(30),
        default="neutral",
        nullable=False,
    )

    age_rating: Mapped[str] = mapped_column(
        String(10),
        default="0+",
        nullable=False,
    )

    ai_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ai_keywords: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reading_time_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    moderation_risk: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    ai_recommendation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    views_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    author = relationship(
        "User",
        back_populates="articles",
    )

    category = relationship(
        "Category",
        back_populates="articles",
    )

    comments = relationship(
        "Comment",
        back_populates="article",
        cascade="all, delete-orphan",
    )

    likes = relationship(
        "Like",
        back_populates="article",
        cascade="all, delete-orphan",
    )