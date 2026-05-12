from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    TokenRefreshRequest,
    TokenResponse,
)
from app.schemas.user import UserCreate, UserRead


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    db: Annotated[Session, Depends(get_db)],
):
    existing_user = db.query(User).filter(
        User.login == user_data.login,
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким логином уже существует",
        )

    user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        login=user_data.login,
        hashed_password=get_password_hash(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(
        User.login == form_data.username,
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь заблокирован",
        )

    return TokenResponse(
        access_token=create_access_token(user.login),
        refresh_token=create_refresh_token(user.login),
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh_token(
    token_data: TokenRefreshRequest,
    db: Annotated[Session, Depends(get_db)],
):
    login = decode_token(
        token=token_data.refresh_token,
        expected_type="refresh",
    )

    user = db.query(User).filter(
        User.login == login,
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь заблокирован",
        )

    return TokenResponse(
        access_token=create_access_token(user.login),
        refresh_token=create_refresh_token(user.login),
    )


@router.post("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not verify_password(
        password_data.old_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Старый пароль указан неверно",
        )

    current_user.hashed_password = get_password_hash(
        password_data.new_password,
    )

    db.commit()

    return {
        "message": "Пароль успешно изменён",
    }


@router.get(
    "/me",
    response_model=UserRead,
)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user