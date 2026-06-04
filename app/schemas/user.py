from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator


NAME_PATTERN = re.compile(r"^[A-Za-zА-Яа-яЁё -]+$")
LOGIN_PATTERN = re.compile(r"^[A-Za-z0-9_]+$")


def validate_password_strength(password: str) -> str:
    if any(char.isspace() for char in password):
        raise ValueError("Пароль не должен содержать пробелы")

    if not any(char.isalpha() for char in password):
        raise ValueError("Пароль должен содержать хотя бы одну букву")

    if not any(char.isdigit() for char in password):
        raise ValueError("Пароль должен содержать хотя бы одну цифру")

    return password


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
        min_length=8,
        max_length=128,
        examples=["password123"],
    )

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        prepared_value = value.strip()

        if not prepared_value:
            raise ValueError("Имя и фамилия не могут быть пустыми")

        if not NAME_PATTERN.fullmatch(prepared_value):
            raise ValueError(
                "Имя и фамилия могут содержать только буквы, пробел и дефис"
            )

        return prepared_value

    @field_validator("login")
    @classmethod
    def validate_login(cls, value: str) -> str:
        prepared_value = value.strip()

        if not LOGIN_PATTERN.fullmatch(prepared_value):
            raise ValueError(
                "Логин может содержать только латинские буквы, цифры и _"
            )

        return prepared_value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    login: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)