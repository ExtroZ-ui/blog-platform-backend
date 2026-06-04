import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  deleteArticle,
  getMyArticles,
  publishArticle,
} from '../api/articlesApi';
import { Button } from '../components/Button/Button';
import { Loader } from '../components/Loader/Loader';

export function MyArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const requestParams = useMemo(() => {
    const params = {
      skip: 0,
      limit: 50,
    };

    if (statusFilter) {
      params.status_filter = statusFilter;
    }

    return params;
  }, [statusFilter]);

  const loadArticles = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);

      const data = await getMyArticles(requestParams);
      setArticles(data);
    } catch {
      setError('Не удалось загрузить ваши статьи.');
    } finally {
      setIsLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  async function handlePublish(articleId) {
    try {
      await publishArticle(articleId);
      await loadArticles();
    } catch {
      setError('Не удалось опубликовать статью.');
    }
  }

  async function handleDelete(articleId) {
    const isConfirmed = window.confirm(
      'Вы действительно хотите удалить статью?',
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteArticle(articleId);
      setArticles((currentArticles) => (
        currentArticles.filter((article) => article.id !== articleId)
      ));
    } catch {
      setError('Не удалось удалить статью.');
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-head">
          <div>
            <p className="page-section__label">Личный кабинет</p>
            <h1 className="page-section__title">Мои статьи</h1>
            <p className="page-section__text">
              Управляйте своими черновиками и опубликованными материалами.
            </p>
          </div>

          <Link to="/editor">
            <Button size="large">
              Создать статью
            </Button>
          </Link>
        </div>

        <div className="articles-toolbar articles-toolbar--compact">
          <label className="toolbar-field">
            <span className="toolbar-field__label">
              Статус
            </span>

            <select
              className="toolbar-field__control"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Все статьи</option>
              <option value="draft">Черновики</option>
              <option value="published">Опубликованные</option>
            </select>
          </label>
        </div>

        {isLoading && <Loader text="Загружаем ваши статьи..." />}

        {error && (
          <p className="page-error">
            {error}
          </p>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="empty-state">
            <h2 className="empty-state__title">
              Статей пока нет
            </h2>
            <p className="empty-state__text">
              Создайте первую статью и сохраните её как черновик или опубликуйте.
            </p>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="table-list">
            {articles.map((article) => (
              <article className="my-article-card" key={article.id}>
                <div className="my-article-card__content">
                  <div className="my-article-card__meta">
                    <span className={`status status--${article.status}`}>
                      {article.status === 'published'
                        ? 'Опубликовано'
                        : 'Черновик'}
                    </span>

                    <span>{article.age_rating}</span>
                    <span>{article.sentiment}</span>
                  </div>

                  <h2 className="my-article-card__title">
                    {article.title}
                  </h2>

                  <p className="my-article-card__text">
                    {article.ai_summary || article.content}
                  </p>

                  <div className="my-article-card__stats">
                    <span>Просмотры: {article.views_count}</span>
                    <span>Лайки: {article.likes_count}</span>
                    <span>Комментарии: {article.comments_count}</span>
                  </div>
                </div>

                <div className="my-article-card__actions">
                  {article.status !== 'published' && (
                    <Button
                      type="button"
                      size="small"
                      onClick={() => handlePublish(article.id)}
                    >
                      Опубликовать
                    </Button>
                  )}

                  <Link to={`/editor/${article.id}`}>
                    <Button type="button" variant="secondary" size="small">
                      Редактировать
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => handleDelete(article.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}