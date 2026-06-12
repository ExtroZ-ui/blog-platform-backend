# Blog Platform

Полноценная платформа для блогов с backend API на FastAPI и frontend-интерфейсом на React.

Проект позволяет пользователям регистрироваться, авторизоваться, создавать статьи, сохранять их в черновик, публиковать, комментировать статьи, ставить лайки, просматривать статистику и использовать локальный модуль AI-анализа текста статьи.

---

## Быстрый доступ к опубликованному проекту

### Frontend

Публичная ссылка на пользовательский интерфейс:

```text
https://blog-platform-frontend-9qda.onrender.com
```

### Backend API

Публичная ссылка на backend:

```text
https://blog-platform-api-m7cc.onrender.com
```

### Swagger / OpenAPI

Документация API:

```text
https://blog-platform-api-m7cc.onrender.com/docs
```

### Health-check backend

Проверка доступности backend:

```text
https://blog-platform-api-m7cc.onrender.com/health
```

### GitHub

Репозиторий проекта:

```text
https://github.com/ExtroZ-ui/blog-platform-backend
```

---

## Описание проекта

Blog Platform — это веб-приложение для публикации и чтения статей.

Пользователь может:

* зарегистрироваться;
* войти в личный кабинет;
* создавать статьи;
* сохранять статьи в черновик;
* публиковать статьи;
* редактировать и удалять свои статьи;
* добавлять обложку статьи;
* использовать форматирование текста;
* просматривать опубликованные статьи;
* оставлять комментарии;
* ставить лайки;
* просматривать свои комментарии;
* менять пароль;
* использовать предварительный AI-анализ статьи.

Проект развёрнут на Render:

* frontend — Render Static Site;
* backend — Render Web Service Docker;
* database — Render PostgreSQL.

---

## Стек технологий

### Backend

* Python 3.11
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic
* Pydantic Settings
* PostgreSQL
* SQLite для локальной разработки без Docker
* JWT авторизация
* Passlib / bcrypt
* Pytest
* Uvicorn
* Docker

### Frontend

* JavaScript
* React
* Vite
* React Router
* Axios
* CSS
* PWA
* Service Worker
* Vite PWA
* Nginx для Docker-сборки

### Инфраструктура

* Docker
* Docker Compose
* Render
* Render PostgreSQL
* GitHub

---

## Реализованный функционал

### Авторизация и пользователи

* регистрация пользователя;
* вход пользователя;
* JWT access token;
* JWT refresh token;
* обновление токена;
* получение данных текущего пользователя;
* смена пароля;
* хранение паролей в хешированном виде;
* защита приватных страниц frontend.

### Категории

* создание категории;
* получение списка категорий;
* получение категории по ID;
* редактирование категории;
* удаление категории;
* защита от удаления категории, если в ней есть статьи.

### Статьи

* создание статьи;
* сохранение статьи как черновика;
* публикация статьи;
* редактирование статьи;
* удаление статьи;
* получение опубликованных статей;
* получение своих статей;
* открытие отдельной статьи;
* добавление URL обложки;
* отображение обложки в карточке и на странице статьи;
* форматированный текст статьи;
* фильтрация и пагинация;
* подсчёт просмотров;
* просмотр статистики статьи.

### Комментарии

* создание комментария к опубликованной статье;
* просмотр комментариев статьи;
* просмотр своих комментариев;
* редактирование своего комментария;
* удаление своего комментария;
* автоматическая модерация комментариев;
* ручная модерация комментариев автором статьи;
* публичное отображение только одобренных комментариев.

### Лайки

* постановка лайка статье;
* повторный запрос снимает лайк;
* отображение количества лайков;
* отображение состояния лайка в интерфейсе.

### Frontend

* главная страница со статьями;
* страница входа;
* страница регистрации;
* личный кабинет;
* страница категорий;
* страница создания и редактирования статьи;
* страница просмотра статьи;
* страница моих статей;
* страница моих комментариев;
* страница профиля;
* навигационное меню;
* карточки статей;
* формы ввода;
* адаптивная вёрстка;
* production-сборка через Vite;
* PWA и Service Worker.

---

## AI-функции

В проекте реализован локальный модуль анализа статьи без подключения внешних API.

AI-модуль определяет:

* тональность статьи:

  * `positive`;
  * `negative`;
  * `neutral`;

* возрастной рейтинг:

  * `0+`;
  * `6+`;
  * `12+`;
  * `16+`;
  * `18+`;

* краткое резюме статьи;

* ключевые слова;

* примерное время чтения;

* уровень модерационного риска:

  * `low`;
  * `medium`;
  * `high`;

* рекомендацию автору перед публикацией.

Также реализован отдельный endpoint для предварительного анализа текста статьи перед созданием или публикацией.

---

## Модель данных

В проекте используются основные таблицы:

### users

Пользователи системы.

Поля:

* `id`
* `first_name`
* `last_name`
* `login`
* `hashed_password`
* `is_active`
* `created_at`

### categories

Категории статей.

Поля:

* `id`
* `name`

### articles

Статьи пользователей.

Поля:

* `id`
* `title`
* `content`
* `cover_image_url`
* `status`
* `sentiment`
* `age_rating`
* `ai_summary`
* `ai_keywords`
* `reading_time_minutes`
* `moderation_risk`
* `ai_recommendation`
* `views_count`
* `author_id`
* `category_id`
* `created_at`
* `updated_at`

### comments

Комментарии к статьям.

Поля:

* `id`
* `text`
* `moderation_status`
* `author_id`
* `article_id`
* `created_at`

### likes

Лайки статей.

Поля:

* `id`
* `user_id`
* `article_id`
* `created_at`

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
│   │   └── comment_ai_moderation.py
│   └── main.py
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── tests/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── tests/
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── requirements.txt
├── alembic.ini
├── pytest.ini
├── .env.example
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Локальный запуск через Docker Compose

Основной рекомендуемый способ локального запуска — Docker Compose.

Он поднимает:

* PostgreSQL;
* FastAPI backend;
* React frontend через Nginx.

### Запуск

```bash
docker compose up --build
```

После запуска будут доступны:

### Frontend

```text
http://localhost:3000
```

### Backend API через Nginx frontend-контейнера

```text
http://localhost:3000/api/health
```

```text
http://localhost:3000/api/articles
```

```text
http://localhost:3000/api/categories
```

### Backend напрямую

```text
http://127.0.0.1:8000
```

### Swagger

```text
http://127.0.0.1:8000/docs
```

### Остановка контейнеров

```bash
docker compose down
```

### Остановка контейнеров с удалением данных базы

```bash
docker compose down -v
```

---

## Локальный запуск backend без Docker

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

Windows:

```bash
venv\Scripts\activate
```

Linux / macOS:

```bash
source venv/bin/activate
```

### 4. Установить зависимости

```bash
pip install -r requirements.txt
```

### 5. Создать файл `.env`

Можно скопировать пример:

Windows:

```bash
copy .env.example .env
```

Linux / macOS:

```bash
cp .env.example .env
```

Пример `.env`:

```env
PROJECT_NAME=Blog Platform API

DATABASE_URL=sqlite:///./blog.db

SECRET_KEY=blog-platform-secret-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
```

### 6. Применить миграции

```bash
alembic upgrade head
```

### 7. Запустить backend

```bash
python -m uvicorn app.main:app --reload
```

Backend будет доступен:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Локальный запуск frontend без Docker

Перейти в папку frontend:

```bash
cd frontend
```

Установить зависимости:

```bash
npm install
```

Запустить dev-сервер:

```bash
npm run dev
```

Frontend будет доступен:

```text
http://localhost:5173
```

Для работы frontend с локальным backend можно создать файл:

```text
frontend/.env
```

И указать:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Для Docker-запуска переменную указывать не нужно, так как frontend использует `/api`.

---

## Production-сборка frontend

Перейти в папку frontend:

```bash
cd frontend
```

Собрать проект:

```bash
npm run build
```

После успешной сборки появится папка:

```text
frontend/dist
```

Проверить production-сборку локально:

```bash
npm run preview
```

По умолчанию preview будет доступен:

```text
http://localhost:4173
```

---

## Переменные окружения

### Backend

| Переменная                    | Описание                                          |
| ----------------------------- | ------------------------------------------------- |
| `PROJECT_NAME`                | Название проекта                                  |
| `DATABASE_URL`                | Строка подключения к базе данных                  |
| `SECRET_KEY`                  | Секретный ключ для JWT                            |
| `ALGORITHM`                   | Алгоритм шифрования JWT                           |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни access token                          |
| `REFRESH_TOKEN_EXPIRE_DAYS`   | Время жизни refresh token                         |
| `CORS_ORIGINS`                | Список разрешённых frontend-доменов через запятую |

Пример для Docker Compose:

```env
DATABASE_URL=postgresql://blog_user:blog_password@db:5432/blog_platform
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
```

Пример для Render:

```env
DATABASE_URL=<Render PostgreSQL connection string>
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,https://blog-platform-frontend-9qda.onrender.com
```

### Frontend

| Переменная          | Описание        |
| ------------------- | --------------- |
| `VITE_API_BASE_URL` | URL backend API |

Пример для Render:

```env
VITE_API_BASE_URL=https://blog-platform-api-m7cc.onrender.com
```

Если переменная не указана, frontend использует:

```text
/api
```

Это нужно для локального Docker-запуска через Nginx.

---

## Деплой на Render

Проект подготовлен для деплоя на Render через файл:

```text
render.yaml
```

Render создаёт три ресурса:

* `blog-platform-db` — PostgreSQL;
* `blog-platform-api` — Docker Web Service;
* `blog-platform-frontend` — Static Site.

### Текущие опубликованные адреса

Frontend:

```text
https://blog-platform-frontend-9qda.onrender.com
```

Backend:

```text
https://blog-platform-api-m7cc.onrender.com
```

Swagger:

```text
https://blog-platform-api-m7cc.onrender.com/docs
```

Health-check:

```text
https://blog-platform-api-m7cc.onrender.com/health
```

### Как обновить деплой

После внесения изменений:

```bash
git add .
git commit -m "Update project"
git push
```

Render автоматически подтянет изменения из ветки `main`.

Если нужно запустить деплой вручную:

```text
Render Dashboard → нужный сервис → Manual Deploy → Deploy latest commit
```

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

При запуске backend в Docker и на Render миграции применяются автоматически перед стартом приложения.

---

## Тестирование

### Backend-тесты

В корне проекта:

```bash
python -m pytest
```

Запуск тестов с отчётом покрытия:

```bash
python -m pytest --cov=app --cov-report=term-missing
```

### Frontend-тесты

В папке frontend:

```bash
cd frontend
npm run test:run
```

### Проверка frontend-сборки

```bash
cd frontend
npm run build
```

---

## Основные endpoint API

### Auth

| Метод  | Endpoint                | Описание                        |
| ------ | ----------------------- | ------------------------------- |
| `POST` | `/auth/register`        | Регистрация пользователя        |
| `POST` | `/auth/login`           | Авторизация пользователя        |
| `POST` | `/auth/refresh`         | Обновление токенов              |
| `POST` | `/auth/change-password` | Смена пароля                    |
| `GET`  | `/auth/me`              | Получение текущего пользователя |

### Categories

| Метод    | Endpoint                    | Описание                   |
| -------- | --------------------------- | -------------------------- |
| `POST`   | `/categories`               | Создание категории         |
| `GET`    | `/categories`               | Получение списка категорий |
| `GET`    | `/categories/{category_id}` | Получение категории по ID  |
| `PATCH`  | `/categories/{category_id}` | Редактирование категории   |
| `DELETE` | `/categories/{category_id}` | Удаление категории         |

### Articles

| Метод    | Endpoint                         | Описание                         |
| -------- | -------------------------------- | -------------------------------- |
| `POST`   | `/articles`                      | Создание статьи                  |
| `GET`    | `/articles`                      | Получение опубликованных статей  |
| `GET`    | `/articles/my`                   | Получение своих статей           |
| `GET`    | `/articles/{article_id}`         | Получение статьи по ID           |
| `PATCH`  | `/articles/{article_id}`         | Редактирование статьи            |
| `DELETE` | `/articles/{article_id}`         | Удаление статьи                  |
| `POST`   | `/articles/{article_id}/publish` | Публикация статьи                |
| `POST`   | `/articles/{article_id}/like`    | Поставить или убрать лайк        |
| `GET`    | `/articles/{article_id}/stats`   | Получение статистики статьи      |
| `POST`   | `/articles/ai-preview`           | Предварительный AI-анализ текста |

### Comments

| Метод    | Endpoint                          | Описание                      |
| -------- | --------------------------------- | ----------------------------- |
| `POST`   | `/comments`                       | Создание комментария          |
| `GET`    | `/comments/article/{article_id}`  | Получение комментариев статьи |
| `GET`    | `/comments/my`                    | Получение своих комментариев  |
| `PATCH`  | `/comments/{comment_id}`          | Редактирование комментария    |
| `DELETE` | `/comments/{comment_id}`          | Удаление комментария          |
| `PATCH`  | `/comments/{comment_id}/moderate` | Модерация комментария         |

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

Endpoint:

```text
POST /auth/register
```

### 2. Авторизация

Endpoint:

```text
POST /auth/login
```

Данные передаются как `application/x-www-form-urlencoded`:

```text
username=ivan
password=password123
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

Endpoint:

```text
POST /categories
```

### 4. Создание статьи

```json
{
  "title": "Новая статья о технологиях",
  "content": "Это полезная статья о развитии технологий. В ней рассказывается, как обучение помогает людям лучше понимать интернет.",
  "category_id": 1,
  "status": "draft",
  "cover_image_url": "https://example.com/cover.jpg"
}
```

Endpoint:

```text
POST /articles
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

Endpoint:

```text
POST /comments
```

---

## Проверка опубликованного проекта

После открытия frontend:

```text
https://blog-platform-frontend-9qda.onrender.com
```

Можно проверить основной сценарий:

1. Зарегистрировать пользователя.
2. Войти в аккаунт.
3. Создать категорию.
4. Создать статью.
5. Добавить URL обложки.
6. Выполнить AI-анализ.
7. Опубликовать статью.
8. Открыть статью на главной странице.
9. Поставить лайк.
10. Добавить комментарий.
11. Проверить страницу профиля.
12. Проверить страницу моих комментариев.

---

## PWA и Service Worker

Во frontend реализован Service Worker через Vite PWA.

После production-сборки и запуска сайта можно проверить Service Worker:

```text
F12 → Application → Service workers
```

Для опубликованной версии Service Worker работает на домене:

```text
https://blog-platform-frontend-9qda.onrender.com
```

---

## Обработка ошибок

Приложение обрабатывает основные ошибки:

* невалидные входные данные;
* повторная регистрация с тем же логином;
* неверный логин или пароль;
* отсутствие JWT-токена;
* истёкший JWT-токен;
* попытка изменить чужую статью;
* попытка удалить чужую статью;
* попытка удалить чужой комментарий;
* попытка комментировать черновик;
* попытка поставить лайк черновику;
* попытка удалить категорию, в которой есть статьи;
* попытка модерировать комментарий не автором статьи.

---

## Особенности реализации

* Backend построен на FastAPI.
* Frontend построен на React и Vite.
* Для авторизации используется JWT.
* Пароли пользователей хранятся в хешированном виде.
* Статьи имеют два состояния: `draft` и `published`.
* Публично отображаются только опубликованные статьи.
* Комментарии проходят автоматическую модерацию.
* Комментарии со статусом `pending` и `rejected` не отображаются публично.
* Автор статьи может вручную модерировать комментарии.
* AI-анализ выполняется локально и не требует подключения к внешним сервисам.
* При запуске через Docker Compose используется PostgreSQL.
* На Render используется Render PostgreSQL.
* Frontend поддерживает PWA и Service Worker.
* Локальный и production-запуск используют переменные окружения.
* Проект может быть развёрнут локально и на Render без изменения исходного кода.

---

## Команды для быстрой проверки

### Локальный Docker-запуск

```bash
docker compose up --build
```

### Проверка backend

```text
http://localhost:3000/api/health
```

### Проверка Swagger локально

```text
http://127.0.0.1:8000/docs
```

### Проверка опубликованного frontend

```text
https://blog-platform-frontend-9qda.onrender.com
```

### Проверка опубликованного Swagger

```text
https://blog-platform-api-m7cc.onrender.com/docs
```

---

