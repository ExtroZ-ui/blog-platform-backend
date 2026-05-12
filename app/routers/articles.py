from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.article import Article
from app.models.category import Category
from app.models.comment import Comment
from app.models.like import Like
from app.models.user import User
from app.schemas.article import (
    ArticleCreate,
    ArticleLikeResponse,
    ArticleRead,
    ArticleStats,
    ArticleUpdate,
)
from app.services.article_ai import analyze_article_content


router = APIRouter(
    prefix="/articles",
    tags=["Articles"],
)


def get_article_or_404(
    article_id: int,
    db: Session,
) -> Article:
    article = db.query(Article).filter(
        Article.id == article_id,
    ).first()

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статья не найдена",
        )

    return article


def check_category_exists(
    category_id: int,
    db: Session,
) -> None:
    category = db.query(Category).filter(
        Category.id == category_id,
    ).first()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена",
        )


def check_article_owner(
    article: Article,
    user: User,
) -> None:
    if article.author_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можно изменять только свои статьи",
        )


def build_article_response(
    article: Article,
    db: Session,
) -> ArticleRead:
    likes_count = db.query(Like).filter(
        Like.article_id == article.id,
    ).count()

    comments_count = db.query(Comment).filter(
        Comment.article_id == article.id,
    ).count()

    return ArticleRead(
        id=article.id,
        title=article.title,
        content=article.content,
        status=article.status,
        sentiment=article.sentiment,
        age_rating=article.age_rating,
        views_count=article.views_count,
        author_id=article.author_id,
        category_id=article.category_id,
        likes_count=likes_count,
        comments_count=comments_count,
        created_at=article.created_at,
        updated_at=article.updated_at,
    )


@router.post(
    "",
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED,
)
def create_article(
    article_data: ArticleCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    check_category_exists(
        category_id=article_data.category_id,
        db=db,
    )

    ai_result = analyze_article_content(article_data.content)

    article = Article(
        title=article_data.title,
        content=article_data.content,
        status=article_data.status,
        sentiment=ai_result["sentiment"],
        age_rating=ai_result["age_rating"],
        author_id=current_user.id,
        category_id=article_data.category_id,
    )

    db.add(article)
    db.commit()
    db.refresh(article)

    return build_article_response(
        article=article,
        db=db,
    )


@router.get(
    "",
    response_model=list[ArticleRead],
)
def get_published_articles(
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
    category_id: int | None = Query(
        default=None,
        ge=1,
    ),
    sentiment: str | None = Query(
        default=None,
        pattern="^(positive|negative|neutral)$",
    ),
    age_rating: str | None = Query(
        default=None,
        pattern="^(0\\+|12\\+|16\\+|18\\+)$",
    ),
    search: str | None = Query(
        default=None,
        min_length=2,
        max_length=100,
    ),
):
    query = db.query(Article).filter(
        Article.status == "published",
    )

    if category_id is not None:
        query = query.filter(
            Article.category_id == category_id,
        )

    if sentiment is not None:
        query = query.filter(
            Article.sentiment == sentiment,
        )

    if age_rating is not None:
        query = query.filter(
            Article.age_rating == age_rating,
        )

    if search is not None:
        query = query.filter(
            Article.title.ilike(f"%{search}%"),
        )

    articles = query.order_by(
        Article.created_at.desc(),
    ).offset(skip).limit(limit).all()

    return [
        build_article_response(
            article=article,
            db=db,
        )
        for article in articles
    ]


@router.get(
    "/my",
    response_model=list[ArticleRead],
)
def get_my_articles(
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
    status_filter: str | None = Query(
        default=None,
        pattern="^(draft|published)$",
    ),
):
    query = db.query(Article).filter(
        Article.author_id == current_user.id,
    )

    if status_filter is not None:
        query = query.filter(
            Article.status == status_filter,
        )

    articles = query.order_by(
        Article.created_at.desc(),
    ).offset(skip).limit(limit).all()

    return [
        build_article_response(
            article=article,
            db=db,
        )
        for article in articles
    ]


@router.get(
    "/{article_id}",
    response_model=ArticleRead,
)
def get_article(
    article_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    article = get_article_or_404(
        article_id=article_id,
        db=db,
    )

    if article.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Опубликованная статья не найдена",
        )

    article.views_count += 1

    db.commit()
    db.refresh(article)

    return build_article_response(
        article=article,
        db=db,
    )


@router.patch(
    "/{article_id}",
    response_model=ArticleRead,
)
def update_article(
    article_id: int,
    article_data: ArticleUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = get_article_or_404(
        article_id=article_id,
        db=db,
    )

    check_article_owner(
        article=article,
        user=current_user,
    )

    update_data = article_data.model_dump(
        exclude_unset=True,
    )

    if "category_id" in update_data:
        check_category_exists(
            category_id=update_data["category_id"],
            db=db,
        )

    if "title" in update_data:
        article.title = update_data["title"]

    if "content" in update_data:
        article.content = update_data["content"]

        ai_result = analyze_article_content(article.content)
        article.sentiment = ai_result["sentiment"]
        article.age_rating = ai_result["age_rating"]

    if "category_id" in update_data:
        article.category_id = update_data["category_id"]

    if "status" in update_data:
        article.status = update_data["status"]

    db.commit()
    db.refresh(article)

    return build_article_response(
        article=article,
        db=db,
    )


@router.delete(
    "/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_article(
    article_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = get_article_or_404(
        article_id=article_id,
        db=db,
    )

    check_article_owner(
        article=article,
        user=current_user,
    )

    db.delete(article)
    db.commit()

    return None


@router.post(
    "/{article_id}/publish",
    response_model=ArticleRead,
)
def publish_article(
    article_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = get_article_or_404(
        article_id=article_id,
        db=db,
    )

    check_article_owner(
        article=article,
        user=current_user,
    )

    article.status = "published"

    db.commit()
    db.refresh(article)

    return build_article_response(
        article=article,
        db=db,
    )


@router.post(
    "/{article_id}/like",
    response_model=ArticleLikeResponse,
)
def toggle_like(
    article_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = get_article_or_404(
        article_id=article_id,
        db=db,
    )

    if article.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя поставить лайк черновику",
        )

    existing_like = db.query(Like).filter(
        Like.article_id == article_id,
        Like.user_id == current_user.id,
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()

        likes_count = db.query(Like).filter(
            Like.article_id == article_id,
        ).count()

        return ArticleLikeResponse(
            article_id=article_id,
            liked=False,
            likes_count=likes_count,
        )

    like = Like(
        article_id=article_id,
        user_id=current_user.id,
    )

    db.add(like)
    db.commit()

    likes_count = db.query(Like).filter(
        Like.article_id == article_id,
    ).count()

    return ArticleLikeResponse(
        article_id=article_id,
        liked=True,
        likes_count=likes_count,
    )


@router.get(
    "/{article_id}/stats",
    response_model=ArticleStats,
)
def get_article_stats(
    article_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    article = get_article_or_404(
        article_id=article_id,
        db=db,
    )

    check_article_owner(
        article=article,
        user=current_user,
    )

    likes_count = db.query(Like).filter(
        Like.article_id == article_id,
    ).count()

    comments_count = db.query(Comment).filter(
        Comment.article_id == article_id,
    ).count()

    return ArticleStats(
        article_id=article.id,
        views_count=article.views_count,
        likes_count=likes_count,
        comments_count=comments_count,
        sentiment=article.sentiment,
        age_rating=article.age_rating,
    )