from fastapi.testclient import TestClient


def test_create_category_success(client: TestClient, auth_context):
    response = client.post(
        "/categories",
        json={
            "name": "Технологии",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 201

    data = response.json()

    assert data["id"] == 1
    assert data["name"] == "Технологии"


def test_create_category_without_auth_returns_401(client: TestClient):
    response = client.post(
        "/categories",
        json={
            "name": "Технологии",
        },
    )

    assert response.status_code == 401


def test_create_duplicate_category_returns_400(
    client: TestClient,
    auth_context,
):
    payload = {
        "name": "Технологии",
    }

    first_response = client.post(
        "/categories",
        json=payload,
        headers=auth_context["headers"],
    )

    second_response = client.post(
        "/categories",
        json=payload,
        headers=auth_context["headers"],
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == (
        "Категория с таким названием уже существует"
    )


def test_get_categories_with_pagination(
    client: TestClient,
    auth_context,
    create_category,
):
    create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )
    create_category(
        headers=auth_context["headers"],
        name="Наука",
    )
    create_category(
        headers=auth_context["headers"],
        name="Образование",
    )

    response = client.get(
        "/categories",
        params={
            "skip": 1,
            "limit": 2,
        },
    )

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_category_by_id_success(
    client: TestClient,
    auth_context,
    create_category,
):
    category = create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )

    response = client.get(f"/categories/{category['id']}")

    assert response.status_code == 200
    assert response.json()["name"] == "Технологии"


def test_get_unknown_category_returns_404(client: TestClient):
    response = client.get("/categories/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Категория не найдена"


def test_update_category_success(
    client: TestClient,
    auth_context,
    create_category,
):
    category = create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )

    response = client.patch(
        f"/categories/{category['id']}",
        json={
            "name": "IT и технологии",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 200
    assert response.json()["name"] == "IT и технологии"


def test_update_category_to_existing_name_returns_400(
    client: TestClient,
    auth_context,
    create_category,
):
    first_category = create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )
    create_category(
        headers=auth_context["headers"],
        name="Наука",
    )

    response = client.patch(
        f"/categories/{first_category['id']}",
        json={
            "name": "Наука",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Категория с таким названием уже существует"
    )


def test_delete_category_success(
    client: TestClient,
    auth_context,
    create_category,
):
    category = create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )

    delete_response = client.delete(
        f"/categories/{category['id']}",
        headers=auth_context["headers"],
    )

    get_response = client.get(f"/categories/{category['id']}")

    assert delete_response.status_code == 204
    assert get_response.status_code == 404


def test_delete_category_with_articles_returns_400(
    client: TestClient,
    auth_context,
    create_category,
    create_article,
):
    category = create_category(
        headers=auth_context["headers"],
        name="Технологии",
    )

    create_article(
        headers=auth_context["headers"],
        category_id=category["id"],
    )

    response = client.delete(
        f"/categories/{category['id']}",
        headers=auth_context["headers"],
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Нельзя удалить категорию, в которой есть статьи"
    )