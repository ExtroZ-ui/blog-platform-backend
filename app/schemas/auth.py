from pydantic import BaseModel, Field, field_validator

from app.schemas.user import validate_password_strength


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(
        ...,
        examples=["your_refresh_token"],
    )


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        examples=["password123"],
    )
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        examples=["newpassword123"],
    )

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_strength(value)