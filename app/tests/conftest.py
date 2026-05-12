from collections.abc import Callable
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models import Article, Category, Comment, Like, User


TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(autouse=True)
def prepare_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(db_session: Session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def create_auth_context(client: TestClient) -> Callable[..., dict[str, Any]]:
    counter = {
        "value": 0,
    }

    def _create_auth_context(
        login: str | None = None,
        password: str = "password123",
        first_name: str = "Иван",
        last_name: str = "Иванов",
    ) -> dict[str, Any]:
        counter["value"] += 1

        user_login = login or f"user{counter['value']}"

        user_payload = {
            "first_name": first_name,
            "last_name": last_name,
            "login": user_login,
            "password": password,
        }

        register_response = client.post(
            "/auth/register",
            json=user_payload,
        )

        assert register_response.status_code == 201

        login_response = client.post(
            "/auth/login",
            data={
                "username": user_login,
                "password": password,
            },
        )

        assert login_response.status_code == 200

        tokens = login_response.json()

        return {
            "user": register_response.json(),
            "payload": user_payload,
            "tokens": tokens,
            "headers": {
                "Authorization": f"Bearer {tokens['access_token']}",
            },
        }

    return _create_auth_context


@pytest.fixture()
def auth_context(create_auth_context):
    return create_auth_context(
        login="ivan",
    )


@pytest.fixture()
def create_category(client: TestClient) -> Callable[..., dict[str, Any]]:
    def _create_category(
        headers: dict[str, str],
        name: str = "Технологии",
    ) -> dict[str, Any]:
        response = client.post(
            "/categories",
            json={
                "name": name,
            },
            headers=headers,
        )

        assert response.status_code == 201

        return response.json()

    return _create_category


@pytest.fixture()
def create_article(
    client: TestClient,
    create_category,
) -> Callable[..., dict[str, Any]]:
    counter = {
        "value": 0,
    }

    def _create_article(
        headers: dict[str, str],
        category_id: int | None = None,
        title: str = "Новая статья о технологиях",
        content: str = (
            "Это отличный и полезный материал о развитии технологий. "
            "В статье рассказывается про обучение, интернет и успех."
        ),
        status: str = "draft",
    ) -> dict[str, Any]:
        counter["value"] += 1

        if category_id is None:
            category = create_category(
                headers=headers,
                name=f"Технологии {counter['value']}",
            )
            category_id = category["id"]

        response = client.post(
            "/articles",
            json={
                "title": title,
                "content": content,
                "category_id": category_id,
                "status": status,
            },
            headers=headers,
        )

        assert response.status_code == 201

        return response.json()

    return _create_article


@pytest.fixture()
def publish_article(client: TestClient) -> Callable[..., dict[str, Any]]:
    def _publish_article(
        headers: dict[str, str],
        article_id: int,
    ) -> dict[str, Any]:
        response = client.post(
            f"/articles/{article_id}/publish",
            headers=headers,
        )

        assert response.status_code == 200

        return response.json()

    return _publish_article


@pytest.fixture()
def create_published_article(
    create_article,
    publish_article,
) -> Callable[..., dict[str, Any]]:
    def _create_published_article(
        headers: dict[str, str],
        category_id: int | None = None,
        title: str = "Опубликованная статья",
        content: str = (
            "Это полезная статья о развитии технологий. "
            "В ней есть обучение, интернет и полезные выводы."
        ),
    ) -> dict[str, Any]:
        article = create_article(
            headers=headers,
            category_id=category_id,
            title=title,
            content=content,
            status="draft",
        )

        return publish_article(
            headers=headers,
            article_id=article["id"],
        )

    return _create_published_article


@pytest.fixture()
def create_comment(client: TestClient) -> Callable[..., dict[str, Any]]:
    def _create_comment(
        headers: dict[str, str],
        article_id: int,
        text: str = "Очень полезная статья, спасибо автору.",
    ) -> dict[str, Any]:
        response = client.post(
            "/comments",
            json={
                "article_id": article_id,
                "text": text,
            },
            headers=headers,
        )

        assert response.status_code == 201

        return response.json()

    return _create_comment