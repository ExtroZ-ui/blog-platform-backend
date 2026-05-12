from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ArticleStatus = Literal["draft", "published"]
ArticleSentiment = Literal["positive", "negative", "neutral"]
ArticleAgeRating = Literal["0+", "12+", "16+", "18+"]


class ArticleCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=255,
        examples=["Новая статья о технологиях"],
    )
    content: str = Field(
        ...,
        min_length=10,
        examples=["Это полезная статья о развитии технологий."],
    )
    category_id: int = Field(
        ...,
        ge=1,
        examples=[1],
    )
    status: ArticleStatus = Field(
        default="draft",
        examples=["draft"],
    )


class ArticleUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=255,
        examples=["Обновлённое название статьи"],
    )
    content: str | None = Field(
        default=None,
        min_length=10,
        examples=["Обновлённый текст статьи."],
    )
    category_id: int | None = Field(
        default=None,
        ge=1,
        examples=[1],
    )
    status: ArticleStatus | None = Field(
        default=None,
        examples=["published"],
    )


class ArticleRead(BaseModel):
    id: int
    title: str
    content: str
    status: str
    sentiment: str
    age_rating: str
    views_count: int
    author_id: int
    category_id: int
    likes_count: int
    comments_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ArticleStats(BaseModel):
    article_id: int
    views_count: int
    likes_count: int
    comments_count: int
    sentiment: str
    age_rating: str


class ArticleLikeResponse(BaseModel):
    article_id: int
    liked: bool
    likes_count: int