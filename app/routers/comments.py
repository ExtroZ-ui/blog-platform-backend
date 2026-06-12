from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.article import Article
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import (
    CommentCreate,
    CommentModerateRequest,
    CommentRead,
    CommentUpdate,
)
from app.services.comment_ai_moderation import moderate_comment_text


router = APIRouter(
    prefix="/comments",
    tags=["Comments"],
)


def get_comment_or_404(
    comment_id: int,
    db: Session,
) -> Comment:
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
    ).first()

    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Комментарий не найден",
        )

    return comment


def get_published_article_or_404(
    article_id: int,
    db: Session,
) -> Article:
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.status == "published",
    ).first()

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Опубликованная статья не найдена",
        )

    return article


def check_comment_owner(
    comment: Comment,
    user: User,
) -> None:
    if comment.author_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можно изменять только свои комментарии",
        )


def check_article_owner_for_comment(
    comment: Comment,
    user: User,
) -> None:
    if comment.article.author_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Модерировать комментарии может только автор статьи",
        )


@router.post(
    "",
    response_model=CommentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    comment_data: CommentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = get_published_article_or_404(
        article_id=comment_data.article_id,
        db=db,
    )

    comment = Comment(
        text=comment_data.text,
        moderation_status=moderate_comment_text(comment_data.text),
        author_id=current_user.id,
        article_id=article.id,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


@router.get(
    "/article/{article_id}",
    response_model=list[CommentRead],
)
def get_article_comments(
    article_id: int,
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
):
    get_published_article_or_404(
        article_id=article_id,
        db=db,
    )

    comments = db.query(Comment).filter(
        Comment.article_id == article_id,
        Comment.moderation_status == "approved",
    ).order_by(
        Comment.created_at.desc(),
    ).offset(skip).limit(limit).all()

    return comments


@router.get(
    "/my",
    response_model=list[CommentRead],
)
def get_my_comments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    moderation_status: str | None = Query(
        default=None,
        pattern="^(pending|approved|rejected)$",
    ),
):
    query = db.query(Comment).filter(
        Comment.author_id == current_user.id,
    )

    if moderation_status is not None:
        query = query.filter(
            Comment.moderation_status == moderation_status,
        )

    comments = query.order_by(
        Comment.created_at.desc(),
    ).offset(skip).limit(limit).all()

    return comments


@router.patch(
    "/{comment_id}",
    response_model=CommentRead,
)
def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    comment = get_comment_or_404(
        comment_id=comment_id,
        db=db,
    )

    check_comment_owner(
        comment=comment,
        user=current_user,
    )

    comment.text = comment_data.text
    comment.moderation_status = moderate_comment_text(
        comment_data.text,
    )

    db.commit()
    db.refresh(comment)

    return comment


@router.delete(
    "/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    comment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    comment = get_comment_or_404(
        comment_id=comment_id,
        db=db,
    )

    check_comment_owner(
        comment=comment,
        user=current_user,
    )

    db.delete(comment)
    db.commit()

    return None


@router.patch(
    "/{comment_id}/moderate",
    response_model=CommentRead,
)
def moderate_comment(
    comment_id: int,
    moderation_data: CommentModerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    comment = get_comment_or_404(
        comment_id=comment_id,
        db=db,
    )

    check_article_owner_for_comment(
        comment=comment,
        user=current_user,
    )

    comment.moderation_status = moderation_data.moderation_status

    db.commit()
    db.refresh(comment)

    return comment