from fastapi.testclient import TestClient


def test_register_user_success(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "first_name": "Иван",
            "last_name": "Иванов",
            "login": "ivan",
            "password": "password123",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["id"] == 1
    assert data["first_name"] == "Иван"
    assert data["last_name"] == "Иванов"
    assert data["login"] == "ivan"
    assert data["is_active"] is True
    assert "hashed_password" not in data
    assert "password" not in data


def test_register_duplicate_login_returns_400(client: TestClient):
    payload = {
        "first_name": "Иван",
        "last_name": "Иванов",
        "login": "ivan",
        "password": "password123",
    }

    first_response = client.post(
        "/auth/register",
        json=payload,
    )

    second_response = client.post(
        "/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == (
        "Пользователь с таким логином уже существует"
    )


def test_register_with_short_password_returns_422(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "first_name": "Иван",
            "last_name": "Иванов",
            "login": "ivan",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_login_success_returns_tokens(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "first_name": "Иван",
            "last_name": "Иванов",
            "login": "ivan",
            "password": "password123",
        },
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "ivan",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert isinstance(data["refresh_token"], str)
    assert len(data["access_token"]) > 20
    assert len(data["refresh_token"]) > 20


def test_login_with_wrong_password_returns_401(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "first_name": "Иван",
            "last_name": "Иванов",
            "login": "ivan",
            "password": "password123",
        },
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "ivan",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Неверный логин или пароль"


def test_get_me_success(client: TestClient, auth_context):
    response = client.get(
        "/auth/me",
        headers=auth_context["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == auth_context["user"]["id"]
    assert data["login"] == auth_context["user"]["login"]


def test_get_me_without_token_returns_401(client: TestClient):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_refresh_token_success(client: TestClient, auth_context):
    response = client.post(
        "/auth/refresh",
        json={
            "refresh_token": auth_context["tokens"]["refresh_token"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert isinstance(data["refresh_token"], str)


def test_change_password_success(client: TestClient, auth_context):
    response = client.post(
        "/auth/change-password",
        json={
            "old_password": "password123",
            "new_password": "newpassword123",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Пароль успешно изменён"

    old_login_response = client.post(
        "/auth/login",
        data={
            "username": "ivan",
            "password": "password123",
        },
    )

    new_login_response = client.post(
        "/auth/login",
        data={
            "username": "ivan",
            "password": "newpassword123",
        },
    )

    assert old_login_response.status_code == 401
    assert new_login_response.status_code == 200


def test_change_password_with_wrong_old_password_returns_400(
    client: TestClient,
    auth_context,
):
    response = client.post(
        "/auth/change-password",
        json={
            "old_password": "wrong-password",
            "new_password": "newpassword123",
        },
        headers=auth_context["headers"],
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Старый пароль указан неверно"