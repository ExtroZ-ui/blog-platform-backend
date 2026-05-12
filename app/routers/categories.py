from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.category import Category
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
)


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category_data: CategoryCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    existing_category = db.query(Category).filter(
        Category.name == category_data.name,
    ).first()

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Категория с таким названием уже существует",
        )

    category = Category(
        name=category_data.name,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.get(
    "",
    response_model=list[CategoryRead],
)
def get_categories(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(
        default=0,
        ge=0,
        description="Сколько записей пропустить",
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Сколько записей вернуть",
    ),
):
    categories = db.query(Category).offset(skip).limit(limit).all()

    return categories


@router.get(
    "/{category_id}",
    response_model=CategoryRead,
)
def get_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    category = db.query(Category).filter(
        Category.id == category_id,
    ).first()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена",
        )

    return category


@router.patch(
    "/{category_id}",
    response_model=CategoryRead,
)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    category = db.query(Category).filter(
        Category.id == category_id,
    ).first()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена",
        )

    existing_category = db.query(Category).filter(
        Category.name == category_data.name,
        Category.id != category_id,
    ).first()

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Категория с таким названием уже существует",
        )

    category.name = category_data.name

    db.commit()
    db.refresh(category)

    return category


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category(
    category_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    category = db.query(Category).filter(
        Category.id == category_id,
    ).first()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена",
        )

    if category.articles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить категорию, в которой есть статьи",
        )

    db.delete(category)
    db.commit()

    return None