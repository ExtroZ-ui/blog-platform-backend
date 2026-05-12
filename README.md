# Blog Platform

Backend API для платформы блогов, разработанный на FastAPI.

Проект позволяет пользователям регистрироваться, авторизоваться, создавать статьи, сохранять их в черновик, публиковать, комментировать статьи, ставить лайки и получать статистику. Также реализован модуль ИИ-анализа текста статьи.

---

## Описание проекта

Платформа для блогов — приложение, которое позволяет пользователям:

- читать опубликованные статьи;
- создавать собственные статьи;
- сохранять статьи в черновик;
- публиковать статьи;
- редактировать и удалять свои статьи;
- оставлять комментарии;
- ставить лайки;
- просматривать статистику по статьям;
- использовать ИИ-анализ содержания статьи.

---

## Стек технологий

- Python 3.11
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- PostgreSQL
- SQLite для локальной разработки
- JWT авторизация
- Pytest
- Docker
- Docker Compose
- Uvicorn

---

## Реализованный функционал

### Авторизация и пользователи

- регистрация пользователя;
- вход пользователя;
- JWT access token;
- JWT refresh token;
- обновление токена;
- смена пароля;
- получение данных текущего пользователя.

### Категории

- создание категории;
- получение списка категорий;
- получение категории по ID;
- редактирование категории;
- удаление категории;
- защита от удаления категории, если в ней есть статьи.

### Статьи

- создание статьи;
- редактирование статьи;
- удаление статьи;
- получение опубликованных статей;
- получение своих статей;
- сохранение статьи как черновика;
- публикация статьи;
- фильтрация статей;
- пагинация;
- просмотр статистики статьи.

### Комментарии

- создание комментария к опубликованной статье;
- просмотр комментариев статьи;
- просмотр своих комментариев;
- редактирование своего комментария;
- удаление своего комментария;
- автоматическая модерация комментариев;
- ручная модерация комментариев автором статьи.

### Лайки и статистика

- постановка лайка статье;
- повторный запрос снимает лайк;
- подсчёт количества лайков;
- подсчёт количества просмотров;
- подсчёт количества комментариев.

---

## ИИ-функции

В проекте реализован локальный модуль анализа статьи без подключения внешних API.

ИИ-модуль определяет:

- тональность статьи:
  - `positive`
  - `negative`
  - `neutral`

- возрастной рейтинг:
  - `0+`
  - `12+`
  - `16+`
  - `18+`

- краткое резюме статьи;
- ключевые слова;
- примерное время чтения;
- уровень модерационного риска:
  - `low`
  - `medium`
  - `high`

- рекомендацию автору перед публикацией.

Также реализован отдельный endpoint для предварительного анализа текста статьи перед созданием статьи.

---

## Модель данных

В проекте используются следующие основные таблицы:

### users

Пользователи системы.

Поля:

- `id`
- `first_name`
- `last_name`
- `login`
- `hashed_password`
- `is_active`
- `created_at`

### categories

Категории статей.

Поля:

- `id`
- `name`

### articles

Статьи пользователей.

Поля:

- `id`
- `title`
- `content`
- `status`
- `sentiment`
- `age_rating`
- `ai_summary`
- `ai_keywords`
- `reading_time_minutes`
- `moderation_risk`
- `ai_recommendation`
- `views_count`
- `author_id`
- `category_id`
- `created_at`
- `updated_at`

### comments

Комментарии к статьям.

Поля:

- `id`
- `text`
- `moderation_status`
- `author_id`
- `article_id`
- `created_at`

### likes

Лайки статей.

Поля:

- `id`
- `user_id`
- `article_id`
- `created_at`

---

## Структура проекта

```text
blog-platform-backend/
├── alembic/
│   ├── versions/
│   └── env.py
├── app/
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── article.py
│   │   ├── category.py
│   │   ├── comment.py
│   │   ├── like.py
│   │   └── user.py
│   ├── routers/
│   │   ├── articles.py
│   │   ├── auth.py
│   │   ├── categories.py
│   │   └── comments.py
│   ├── schemas/
│   │   ├── article.py
│   │   ├── auth.py
│   │   ├── category.py
│   │   ├── comment.py
│   │   └── user.py
│   ├── services/
│   │   ├── article_ai.py
│   │   └── comment_moderation.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_articles.py
│   │   ├── test_auth.py
│   │   ├── test_categories.py
│   │   └── test_comments.py
│   └── main.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── alembic.ini
├── pytest.ini
├── .env.example
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Установка и запуск локально

### 1. Клонировать репозиторий

```bash
git clone https://github.com/ExtroZ-ui/blog-platform-backend.git
cd blog-platform-backend
```

### 2. Создать виртуальное окружение

```bash
python -m venv venv
```

### 3. Активировать виртуальное окружение

Для Windows:

```bash
venv\Scripts\activate
```

Для Linux / macOS:

```bash
source venv/bin/activate
```

### 4. Установить зависимости

```bash
pip install -r requirements.txt
```

### 5. Создать файл `.env`

Можно скопировать пример:

```bash
copy .env.example .env
```

Для Linux / macOS:

```bash
cp .env.example .env
```

Пример содержимого `.env`:

```env
PROJECT_NAME=Blog Platform API

DATABASE_URL=sqlite:///./blog.db

SECRET_KEY=blog-platform-secret-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### 6. Применить миграции

```bash
alembic upgrade head
```

### 7. Запустить приложение

```bash
python -m uvicorn app.main:app --reload
```

После запуска API будет доступен по адресу:

```text
http://127.0.0.1:8000
```

Swagger-документация:

```text
http://127.0.0.1:8000/docs
```

---

## Запуск через Docker Compose

Для запуска проекта через Docker Compose используется PostgreSQL.

### 1. Собрать и запустить контейнеры

```bash
docker compose up --build
```

После запуска будут подняты два контейнера:

- `blog_platform_db` — база данных PostgreSQL;
- `blog_platform_api` — backend-приложение FastAPI.

API будет доступен по адресу:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

### 2. Остановить контейнеры

```bash
docker compose down
```

### 3. Остановить контейнеры и удалить данные БД

```bash
docker compose down -v
```

---

## Переменные окружения

Пример файла `.env.example`:

```env
PROJECT_NAME=Blog Platform API

DATABASE_URL=postgresql://blog_user:blog_password@db:5432/blog_platform

SECRET_KEY=blog-platform-secret-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Описание переменных:

| Переменная | Описание |
|---|---|
| `PROJECT_NAME` | Название проекта |
| `DATABASE_URL` | Строка подключения к базе данных |
| `SECRET_KEY` | Секретный ключ для JWT |
| `ALGORITHM` | Алгоритм шифрования JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни access token |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Время жизни refresh token |

---

## Миграции Alembic

Создание новой миграции:

```bash
alembic revision --autogenerate -m "migration name"
```

Применение миграций:

```bash
alembic upgrade head
```

Откат последней миграции:

```bash
alembic downgrade -1
```

Проверка текущей миграции:

```bash
alembic current
```

---

## Тестирование

В проекте реализованы функциональные тесты для проверки:

- регистрации;
- авторизации;
- refresh token;
- смены пароля;
- категорий;
- статей;
- ИИ-анализа статей;
- лайков;
- статистики;
- комментариев;
- модерации комментариев;
- прав доступа;
- валидации входных данных.

Запуск тестов:

```bash
python -m pytest
```

Запуск тестов с отчётом покрытия:

```bash
python -m pytest --cov=app --cov-report=term-missing
```

В проекте реализовано 49 тестов.

---

## Основные эндпойнты API

### Auth

| Метод | Endpoint | Описание |
|---|---|---|
| `POST` | `/auth/register` | Регистрация пользователя |
| `POST` | `/auth/login` | Авторизация пользователя |
| `POST` | `/auth/refresh` | Обновление токенов |
| `POST` | `/auth/change-password` | Смена пароля |
| `GET` | `/auth/me` | Получение текущего пользователя |

### Categories

| Метод | Endpoint | Описание |
|---|---|---|
| `POST` | `/categories` | Создание категории |
| `GET` | `/categories` | Получение списка категорий |
| `GET` | `/categories/{category_id}` | Получение категории по ID |
| `PATCH` | `/categories/{category_id}` | Редактирование категории |
| `DELETE` | `/categories/{category_id}` | Удаление категории |

### Articles

| Метод | Endpoint | Описание |
|---|---|---|
| `POST` | `/articles` | Создание статьи |
| `GET` | `/articles` | Получение опубликованных статей |
| `GET` | `/articles/my` | Получение своих статей |
| `GET` | `/articles/{article_id}` | Получение статьи по ID |
| `PATCH` | `/articles/{article_id}` | Редактирование статьи |
| `DELETE` | `/articles/{article_id}` | Удаление статьи |
| `POST` | `/articles/{article_id}/publish` | Публикация статьи |
| `POST` | `/articles/{article_id}/like` | Поставить или убрать лайк |
| `GET` | `/articles/{article_id}/stats` | Получение статистики статьи |
| `POST` | `/articles/ai-preview` | Предварительный ИИ-анализ текста |

### Comments

| Метод | Endpoint | Описание |
|---|---|---|
| `POST` | `/comments` | Создание комментария |
| `GET` | `/comments/article/{article_id}` | Получение комментариев статьи |
| `GET` | `/comments/my` | Получение своих комментариев |
| `PATCH` | `/comments/{comment_id}` | Редактирование комментария |
| `DELETE` | `/comments/{comment_id}` | Удаление комментария |
| `PATCH` | `/comments/{comment_id}/moderate` | Модерация комментария |

---

## Пример сценария работы с API

### 1. Регистрация

```json
{
  "first_name": "Иван",
  "last_name": "Иванов",
  "login": "ivan",
  "password": "password123"
}
```

### 2. Авторизация

В endpoint `/auth/login` передаются данные формы:

```text
username: ivan
password: password123
```

В ответ API возвращает:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### 3. Создание категории

```json
{
  "name": "Технологии"
}
```

### 4. Создание статьи

```json
{
  "title": "Новая статья о технологиях",
  "content": "Это полезная статья о развитии технологий. В ней рассказывается, как обучение помогает людям лучше понимать интернет.",
  "category_id": 1,
  "status": "draft"
}
```

### 5. Публикация статьи

```text
POST /articles/1/publish
```

### 6. Создание комментария

```json
{
  "article_id": 1,
  "text": "Очень полезная статья, спасибо автору."
}
```

---

## Обработка ошибок

Приложение обрабатывает основные ошибки:

- невалидные входные данные;
- повторная регистрация с тем же логином;
- неверный логин или пароль;
- отсутствие JWT-токена;
- попытка изменить чужую статью;
- попытка удалить чужой комментарий;
- попытка комментировать черновик;
- попытка поставить лайк черновику;
- попытка удалить категорию, в которой есть статьи;
- попытка модерировать комментарий не автором статьи.

---

## Особенности реализации

- Пароли пользователей хранятся в хешированном виде.
- Для авторизации используется JWT.
- Статьи имеют два состояния: `draft` и `published`.
- Публично отображаются только опубликованные статьи.
- Комментарии проходят автоматическую модерацию.
- Комментарии со статусом `pending` и `rejected` не отображаются публично.
- Автор статьи может вручную модерировать комментарии.
- ИИ-анализ выполняется локально и не требует подключения к внешним сервисам.
- При запуске через Docker Compose используется PostgreSQL.
- При локальном запуске можно использовать SQLite.

---
