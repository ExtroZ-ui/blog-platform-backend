from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    first_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["Иван"],
    )
    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["Иванов"],
    )
    login: str = Field(
        ...,
        min_length=3,
        max_length=100,
        examples=["ivan"],
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        examples=["password123"],
    )


class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    login: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)