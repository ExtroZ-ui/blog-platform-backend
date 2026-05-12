from fastapi.testclient import TestClient


def test_create_comment_to_published_article_success(
    client: TestClient,
    auth_context,
    create_published_article,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    response = client.post(
        "/comments",
        json={
            "article_id": article["id"],
            "text": "Очень полезная статья, спасибо автору.",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 201

    data = response.json()

    assert data["text"] == "Очень полезная статья, спасибо автору."
    assert data["article_id"] == article["id"]
    assert data["author_id"] == auth_context["user"]["id"]
    assert data["moderation_status"] == "approved"


def test_cannot_comment_draft_article(
    client: TestClient,
    auth_context,
    create_article,
):
    article = create_article(
        headers=auth_context["headers"],
        status="draft",
    )

    response = client.post(
        "/comments",
        json={
            "article_id": article["id"],
            "text": "Комментарий к черновику.",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Опубликованная статья не найдена"


def test_comment_validation_short_text_returns_422(
    client: TestClient,
    auth_context,
    create_published_article,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    response = client.post(
        "/comments",
        json={
            "article_id": article["id"],
            "text": "",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 422


def test_public_comments_returns_only_approved_comments(
    client: TestClient,
    auth_context,
    create_published_article,
    create_comment,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    approved_comment = create_comment(
        headers=auth_context["headers"],
        article_id=article["id"],
        text="Очень полезная статья.",
    )

    pending_comment = create_comment(
        headers=auth_context["headers"],
        article_id=article["id"],
        text="Ужасная и опасная информация, есть конфликт.",
    )

    rejected_comment = create_comment(
        headers=auth_context["headers"],
        article_id=article["id"],
        text="Это спам и реклама.",
    )

    response = client.get(f"/comments/article/{article['id']}")

    assert response.status_code == 200

    comments = response.json()

    assert len(comments) == 1
    assert comments[0]["id"] == approved_comment["id"]

    assert pending_comment["moderation_status"] == "pending"
    assert rejected_comment["moderation_status"] == "rejected"


def test_get_my_comments_with_filter(
    client: TestClient,
    auth_context,
    create_published_article,
    create_comment,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    approved_comment = create_comment(
        headers=auth_context["headers"],
        article_id=article["id"],
        text="Хорошая статья.",
    )

    pending_comment = create_comment(
        headers=auth_context["headers"],
        article_id=article["id"],
        text="Ужасная и опасная информация.",
    )

    response = client.get(
        "/comments/my",
        params={
            "moderation_status": "pending",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 200

    comments = response.json()

    assert len(comments) == 1
    assert comments[0]["id"] == pending_comment["id"]
    assert comments[0]["id"] != approved_comment["id"]


def test_update_own_comment_recalculates_moderation_status(
    client: TestClient,
    auth_context,
    create_published_article,
    create_comment,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    comment = create_comment(
        headers=auth_context["headers"],
        article_id=article["id"],
        text="Хорошая статья.",
    )

    response = client.patch(
        f"/comments/{comment['id']}",
        json={
            "text": "Это спам и реклама.",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert data["text"] == "Это спам и реклама."
    assert data["moderation_status"] == "rejected"


def test_non_owner_cannot_update_comment(
    client: TestClient,
    create_auth_context,
    create_published_article,
    create_comment,
):
    owner = create_auth_context(login="owner")
    another_user = create_auth_context(login="another_user")

    article = create_published_article(
        headers=owner["headers"],
    )

    comment = create_comment(
        headers=owner["headers"],
        article_id=article["id"],
        text="Хороший комментарий.",
    )

    response = client.patch(
        f"/comments/{comment['id']}",
        json={
            "text": "Попытка изменить чужой комментарий.",
        },
        headers=another_user["headers"],
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "Можно изменять только свои комментарии"
    )


def test_delete_own_comment_success(
    client: TestClient,
    auth_context,
    create_published_article,
    create_comment,
):
    article = create_published_article(
        headers=auth_context["headers"],
    )

    comment = create_comment(
        headers=auth_context["headers"],
        article_id=article["id"],
    )

    delete_response = client.delete(
        f"/comments/{comment['id']}",
        headers=auth_context["headers"],
    )

    my_comments_response = client.get(
        "/comments/my",
        headers=auth_context["headers"],
    )

    assert delete_response.status_code == 204
    assert my_comments_response.status_code == 200
    assert my_comments_response.json() == []


def test_non_owner_cannot_delete_comment(
    client: TestClient,
    create_auth_context,
    create_published_article,
    create_comment,
):
    owner = create_auth_context(login="owner")
    another_user = create_auth_context(login="another_user")

    article = create_published_article(
        headers=owner["headers"],
    )

    comment = create_comment(
        headers=owner["headers"],
        article_id=article["id"],
    )

    response = client.delete(
        f"/comments/{comment['id']}",
        headers=another_user["headers"],
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "Можно изменять только свои комментарии"
    )


def test_article_author_can_moderate_comment(
    client: TestClient,
    create_auth_context,
    create_published_article,
    create_comment,
):
    article_author = create_auth_context(login="author")
    commenter = create_auth_context(login="commenter")

    article = create_published_article(
        headers=article_author["headers"],
    )

    comment = create_comment(
        headers=commenter["headers"],
        article_id=article["id"],
        text="Ужасная и опасная информация.",
    )

    assert comment["moderation_status"] == "pending"

    response = client.patch(
        f"/comments/{comment['id']}/moderate",
        json={
            "moderation_status": "approved",
        },
        headers=article_author["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert data["moderation_status"] == "approved"

    public_comments_response = client.get(
        f"/comments/article/{article['id']}",
    )

    assert public_comments_response.status_code == 200
    assert len(public_comments_response.json()) == 1


def test_non_article_author_cannot_moderate_comment(
    client: TestClient,
    create_auth_context,
    create_published_article,
    create_comment,
):
    article_author = create_auth_context(login="author")
    commenter = create_auth_context(login="commenter")
    stranger = create_auth_context(login="stranger")

    article = create_published_article(
        headers=article_author["headers"],
    )

    comment = create_comment(
        headers=commenter["headers"],
        article_id=article["id"],
        text="Ужасная и опасная информация.",
    )

    response = client.patch(
        f"/comments/{comment['id']}/moderate",
        json={
            "moderation_status": "approved",
        },
        headers=stranger["headers"],
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "Модерировать комментарии может только автор статьи"
    )


def test_moderate_comment_with_invalid_status_returns_422(
    client: TestClient,
    create_auth_context,
    create_published_article,
    create_comment,
):
    article_author = create_auth_context(login="author")
    commenter = create_auth_context(login="commenter")

    article = create_published_article(
        headers=article_author["headers"],
    )

    comment = create_comment(
        headers=commenter["headers"],
        article_id=article["id"],
        text="Ужасная и опасная информация.",
    )

    response = client.patch(
        f"/comments/{comment['id']}/moderate",
        json={
            "moderation_status": "unknown",
        },
        headers=article_author["headers"],
    )

    assert response.status_code == 422