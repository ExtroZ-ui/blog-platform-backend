from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


CommentStatus = Literal["pending", "approved", "rejected"]


class CommentCreate(BaseModel):
    article_id: int = Field(
        ...,
        ge=1,
        examples=[1],
    )
    text: str = Field(
        ...,
        min_length=2,
        max_length=2000,
        examples=["Очень полезная статья, спасибо автору."],
    )


class CommentUpdate(BaseModel):
    text: str = Field(
        ...,
        min_length=2,
        max_length=2000,
        examples=["Обновлённый текст комментария."],
    )


class CommentModerateRequest(BaseModel):
    moderation_status: CommentStatus = Field(
        ...,
        examples=["approved"],
    )


class CommentRead(BaseModel):
    id: int
    text: str
    moderation_status: str
    author_id: int
    author_login: str | None = None
    author_name: str | None = None
    article_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)