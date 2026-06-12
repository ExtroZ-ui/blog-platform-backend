import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getMyArticles } from '../api/articlesApi';
import { getCategories } from '../api/categoriesApi';
import { getMyComments } from '../api/commentsApi';
import { Button } from '../components/Button/Button';
import { Loader } from '../components/Loader/Loader';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);

      const [articlesData, commentsData, categoriesData] = await Promise.all([
        getMyArticles({
          skip: 0,
          limit: 100,
        }),
        getMyComments({
          skip: 0,
          limit: 100,
        }),
        getCategories({
          skip: 0,
          limit: 100,
        }),
      ]);

      setArticles(articlesData);
      setComments(commentsData);
      setCategories(categoriesData);
    } catch {
      setError('Не удалось загрузить данные кабинета.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const stats = useMemo(() => {
    return {
      totalArticles: articles.length,
      publishedArticles: articles.filter((article) => article.status === 'published').length,
      draftArticles: articles.filter((article) => article.status === 'draft').length,
      comments: comments.length,
      categories: categories.length,
    };
  }, [articles, comments, categories]);

  return (
    <section className="page-section dashboard-page dashboard-page--clean">
      <div className="container">
        <div className="dashboard-welcome">
          <div className="dashboard-welcome__content">
            <p className="page-section__label">
              Личный кабинет
            </p>

            <h1 className="page-section__title">
              Здравствуйте, {user?.first_name || user?.login}
            </h1>

            <p className="page-section__text">
              Здесь собраны основные разделы для управления блогом:
              статьи, категории, комментарии и профиль пользователя.
            </p>
          </div>

          <aside className="dashboard-user-card">
            <div className="dashboard-user-card__avatar">
              {(user?.first_name || user?.login || 'U').slice(0, 1).toUpperCase()}
            </div>

            <div>
              <h2 className="dashboard-user-card__name">
                {user?.first_name} {user?.last_name}
              </h2>

              <p className="dashboard-user-card__login">
                @{user?.login}
              </p>
            </div>
          </aside>
        </div>

        {isLoading && <Loader text="Загружаем кабинет..." />}

        {error && (
          <p className="page-error">
            {error}
          </p>
        )}

        {!isLoading && (
          <>
            <div className="dashboard-summary">
              <article className="dashboard-summary__item">
                <span>Всего статей</span>
                <strong>{stats.totalArticles}</strong>
              </article>

              <article className="dashboard-summary__item">
                <span>Опубликовано</span>
                <strong>{stats.publishedArticles}</strong>
              </article>

              <article className="dashboard-summary__item">
                <span>Черновики</span>
                <strong>{stats.draftArticles}</strong>
              </article>

              <article className="dashboard-summary__item">
                <span>Комментарии</span>
                <strong>{stats.comments}</strong>
              </article>

              <article className="dashboard-summary__item">
                <span>Категории</span>
                <strong>{stats.categories}</strong>
              </article>
            </div>

            <div className="dashboard-clean-grid">
              <article className="dashboard-clean-card dashboard-clean-card--primary">
                <div className="dashboard-clean-card__icon">
                  ✍
                </div>

                <div>
                  <h2 className="dashboard-clean-card__title">
                    Создать статью
                  </h2>

                  <p className="dashboard-clean-card__text">
                    Откройте редактор, напишите материал, выполните AI-анализ
                    и сохраните статью как черновик или публикацию.
                  </p>
                </div>

                <Link to="/editor">
                  <Button size="medium">
                    Открыть редактор
                  </Button>
                </Link>
              </article>

              <article className="dashboard-clean-card">
                <div className="dashboard-clean-card__icon">
                  📚
                </div>

                <div>
                  <h2 className="dashboard-clean-card__title">
                    Мои статьи
                  </h2>

                  <p className="dashboard-clean-card__text">
                    Список ваших публикаций и черновиков с возможностью
                    редактирования, публикации и удаления.
                  </p>
                </div>

                <Link to="/dashboard/articles">
                  <Button variant="secondary" size="medium">
                    Перейти
                  </Button>
                </Link>
              </article>

              <article className="dashboard-clean-card">
                <div className="dashboard-clean-card__icon">
                  🏷
                </div>

                <div>
                  <h2 className="dashboard-clean-card__title">
                    Категории
                  </h2>

                  <p className="dashboard-clean-card__text">
                    Управление тематическими разделами, которые используются
                    при создании и фильтрации статей.
                  </p>
                </div>

                <Link to="/dashboard/categories">
                  <Button variant="secondary" size="medium">
                    Управлять
                  </Button>
                </Link>
              </article>

              <article className="dashboard-clean-card">
                <div className="dashboard-clean-card__icon">
                  💬
                </div>

                <div>
                  <h2 className="dashboard-clean-card__title">
                    Комментарии
                  </h2>

                  <p className="dashboard-clean-card__text">
                    Просмотр, редактирование и удаление ваших комментариев
                    к опубликованным статьям.
                  </p>
                </div>

                <Link to="/dashboard/comments">
                  <Button variant="secondary" size="medium">
                    Открыть
                  </Button>
                </Link>
              </article>

              <article className="dashboard-clean-card">
                <div className="dashboard-clean-card__icon">
                  👤
                </div>

                <div>
                  <h2 className="dashboard-clean-card__title">
                    Профиль
                  </h2>

                  <p className="dashboard-clean-card__text">
                    Данные аккаунта, статус пользователя и форма смены пароля.
                  </p>
                </div>

                <Link to="/dashboard/profile">
                  <Button variant="secondary" size="medium">
                    Открыть профиль
                  </Button>
                </Link>
              </article>
            </div>
          </>
        )}
      </div>
    </section>
  );
}