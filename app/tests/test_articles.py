from fastapi.testclient import TestClient


def test_ai_preview_returns_full_analysis(client: TestClient, auth_context):
    response = client.post(
        "/articles/ai-preview",
        json={
            "content": (
                "Это полезная статья о развитии технологий. "
                "В ней рассказывается, как обучение помогает людям "
                "лучше понимать интернет."
            ),
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert data["sentiment"] == "positive"
    assert data["age_rating"] == "12+"
    assert data["reading_time_minutes"] >= 1
    assert data["moderation_risk"] == "low"
    assert data["ai_summary"] != ""
    assert data["ai_keywords"] != ""
    assert data["ai_recommendation"] != ""


def test_ai_preview_requires_auth(client: TestClient):
    response = client.post(
        "/articles/ai-preview",
        json={
            "content": "Это полезная статья о развитии технологий.",
        },
    )

    assert response.status_code == 401


def test_create_article_success_with_ai_fields(
    client: TestClient,
    auth_context,
    create_category,
):
    category = create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )

    response = client.post(
        "/articles",
        json={
            "title": "Новая статья о технологиях",
            "content": (
                "Это полезная статья о развитии технологий. "
                "В ней рассказывается про обучение и интернет."
            ),
            "category_id": category["id"],
            "status": "draft",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Новая статья о технологиях"
    assert data["status"] == "draft"
    assert data["sentiment"] == "positive"
    assert data["age_rating"] == "12+"
    assert data["views_count"] == 0
    assert data["likes_count"] == 0
    assert data["comments_count"] == 0
    assert data["ai_summary"] != ""
    assert data["ai_keywords"] != ""
    assert data["reading_time_minutes"] >= 1
    assert data["moderation_risk"] == "low"
    assert data["ai_recommendation"] != ""


def test_create_article_with_unknown_category_returns_404(
    client: TestClient,
    auth_context,
):
    response = client.post(
        "/articles",
        json={
            "title": "Статья без категории",
            "content": "Это достаточно длинный текст для проверки.",
            "category_id": 999,
            "status": "draft",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Категория не найдена"


def test_create_article_with_short_content_returns_422(
    client: TestClient,
    auth_context,
    create_category,
):
    category = create_category(
        headers=auth_context["headers"],
    )

    response = client.post(
        "/articles",
        json={
            "title": "Короткая статья",
            "content": "мало",
            "category_id": category["id"],
            "status": "draft",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 422


def test_public_articles_hide_drafts_and_show_published(
    client: TestClient,
    auth_context,
    create_article,
    publish_article,
):
    article = create_article(
        headers=auth_context["headers"],
        status="draft",
    )

    draft_list_response = client.get("/articles")

    assert draft_list_response.status_code == 200
    assert draft_list_response.json() == []

    publish_article(
        headers=auth_context["headers"],
        article_id=article["id"],
    )

    published_list_response = client.get("/articles")

    assert published_list_response.status_code == 200
    assert len(published_list_response.json()) == 1
    assert published_list_response.json()[0]["status"] == "published"


def test_get_my_articles_with_status_filter(
    client: TestClient,
    auth_context,
    create_article,
    publish_article,
):
    draft_article = create_article(
        headers=auth_context["headers"],
        title="Черновик",
        status="draft",
    )

    published_article = create_article(
        headers=auth_context["headers"],
        title="Опубликованная статья",
        status="draft",
    )

    publish_article(
        headers=auth_context["headers"],
        article_id=published_article["id"],
    )

    draft_response = client.get(
        "/articles/my",
        params={
            "status_filter": "draft",
        },
        headers=auth_context["headers"],
    )

    published_response = client.get(
        "/articles/my",
        params={
            "status_filter": "published",
        },
        headers=auth_context["headers"],
    )

    assert draft_response.status_code == 200
    assert published_response.status_code == 200

    assert len(draft_response.json()) == 1
    assert draft_response.json()[0]["id"] == draft_article["id"]

    assert len(published_response.json()) == 1
    assert published_response.json()[0]["id"] == published_article["id"]


def test_get_article_increments_views_count(
    client: TestClient,
    auth_context,
    create_published_article,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    first_response = client.get(f"/articles/{article['id']}")
    second_response = client.get(f"/articles/{article['id']}")

    assert first_response.status_code == 200
    assert second_response.status_code == 200

    assert first_response.json()["views_count"] == 1
    assert second_response.json()["views_count"] == 2


def test_get_draft_article_publicly_returns_404(
    client: TestClient,
    auth_context,
    create_article,
):
    article = create_article(
        headers=auth_context["headers"],
        status="draft",
    )

    response = client.get(f"/articles/{article['id']}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Опубликованная статья не найдена"


def test_update_article_recalculates_ai_fields(
    client: TestClient,
    auth_context,
    create_article,
):
    article = create_article(
        headers=auth_context["headers"],
        status="draft",
    )

    response = client.patch(
        f"/articles/{article['id']}",
        json={
            "content": (
                "В статье описывается опасность, угрозы, "
                "насилие и оружие."
            ),
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert data["sentiment"] == "negative"
    assert data["age_rating"] == "18+"
    assert data["moderation_risk"] == "high"


def test_non_owner_cannot_update_article(
    client: TestClient,
    create_auth_context,
    create_article,
):
    owner = create_auth_context(login="owner")
    another_user = create_auth_context(login="another_user")

    article = create_article(
        headers=owner["headers"],
    )

    response = client.patch(
        f"/articles/{article['id']}",
        json={
            "title": "Попытка изменить чужую статью",
        },
        headers=another_user["headers"],
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Можно изменять только свои статьи"


def test_delete_article_success(
    client: TestClient,
    auth_context,
    create_article,
):
    article = create_article(
        headers=auth_context["headers"],
    )

    delete_response = client.delete(
        f"/articles/{article['id']}",
        headers=auth_context["headers"],
    )

    get_response = client.get(
        "/articles/my",
        headers=auth_context["headers"],
    )

    assert delete_response.status_code == 204
    assert get_response.status_code == 200
    assert get_response.json() == []


def test_non_owner_cannot_delete_article(
    client: TestClient,
    create_auth_context,
    create_article,
):
    owner = create_auth_context(login="owner")
    another_user = create_auth_context(login="another_user")

    article = create_article(
        headers=owner["headers"],
    )

    response = client.delete(
        f"/articles/{article['id']}",
        headers=another_user["headers"],
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Можно изменять только свои статьи"


def test_like_toggle_for_published_article(
    client: TestClient,
    auth_context,
    create_published_article,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    first_response = client.post(
        f"/articles/{article['id']}/like",
        headers=auth_context["headers"],
    )

    second_response = client.post(
        f"/articles/{article['id']}/like",
        headers=auth_context["headers"],
    )

    assert first_response.status_code == 200
    assert first_response.json()["liked"] is True
    assert first_response.json()["likes_count"] == 1

    assert second_response.status_code == 200
    assert second_response.json()["liked"] is False
    assert second_response.json()["likes_count"] == 0


def test_cannot_like_draft_article(
    client: TestClient,
    auth_context,
    create_article,
):
    article = create_article(
        headers=auth_context["headers"],
        status="draft",
    )

    response = client.post(
        f"/articles/{article['id']}/like",
        headers=auth_context["headers"],
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Нельзя поставить лайк черновику"


def test_get_article_stats_success(
    client: TestClient,
    auth_context,
    create_published_article,
):
    article = create_published_article(
        headers=auth_context["headers"],
        content=(
            "Это отличный и полезный материал о развитии технологий. "
            "В статье рассказывается про обучение, интернет и успех."
        ),
    )

    client.get(f"/articles/{article['id']}")

    client.post(
        f"/articles/{article['id']}/like",
        headers=auth_context["headers"],
    )

    response = client.get(
        f"/articles/{article['id']}/stats",
        headers=auth_context["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert data["article_id"] == article["id"]
    assert data["views_count"] == 1
    assert data["likes_count"] == 1
    assert data["comments_count"] == 0

    assert data["sentiment"] in [
        "positive",
        "negative",
        "neutral",
    ]

    assert data["age_rating"] in [
        "0+",
        "12+",
        "16+",
        "18+",
    ]

    assert data["reading_time_minutes"] >= 1

    assert data["moderation_risk"] in [
        "low",
        "medium",
        "high",
    ]


def test_public_article_filters_by_category(
    client: TestClient,
    auth_context,
    create_category,
    create_article,
    publish_article,
):
    tech_category = create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )

    science_category = create_category(
        headers=auth_context["headers"],
        name="Наука",
    )

    tech_article = create_article(
        headers=auth_context["headers"],
        category_id=tech_category["id"],
        title="Статья про технологии",
    )

    science_article = create_article(
        headers=auth_context["headers"],
        category_id=science_category["id"],
        title="Статья про науку",
    )

    publish_article(
        headers=auth_context["headers"],
        article_id=tech_article["id"],
    )

    publish_article(
        headers=auth_context["headers"],
        article_id=science_article["id"],
    )

    response = client.get(
        "/articles",
        params={
            "category_id": tech_category["id"],
        },
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == tech_article["id"]