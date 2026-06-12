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
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const requestParams = useMemo(() => {
    const params = {
      skip: 0,
      limit: 100,
    };

    if (statusFilter) {
      params.status_filter = statusFilter;
    }

    return params;
  }, [statusFilter]);

  const filteredArticles = useMemo(() => {
    const preparedSearch = search.trim().toLowerCase();

    if (!preparedSearch) {
      return articles;
    }

    return articles.filter((article) => (
      article.title.toLowerCase().includes(preparedSearch)
      || article.content.toLowerCase().includes(preparedSearch)
    ));
  }, [articles, search]);

  const stats = useMemo(() => {
    return {
      total: articles.length,
      published: articles.filter((article) => article.status === 'published').length,
      drafts: articles.filter((article) => article.status === 'draft').length,
    };
  }, [articles]);

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
    <section className="page-section my-articles-page">
      <div className="container">
        <div className="page-head page-head--panel">
          <div>
            <p className="page-section__label">Личный кабинет</p>
            <h1 className="page-section__title">Мои статьи</h1>
            <p className="page-section__text">
              Управляйте черновиками, публикуйте материалы и отслеживайте
              активность читателей.
            </p>
          </div>

          <Link to="/editor">
            <Button size="large">
              Создать статью
            </Button>
          </Link>
        </div>

        <div className="author-stats">
          <article className="author-stat">
            <span className="author-stat__label">Всего</span>
            <strong>{stats.total}</strong>
          </article>

          <article className="author-stat">
            <span className="author-stat__label">Опубликовано</span>
            <strong>{stats.published}</strong>
          </article>

          <article className="author-stat">
            <span className="author-stat__label">Черновики</span>
            <strong>{stats.drafts}</strong>
          </article>
        </div>

        <div className="articles-toolbar articles-toolbar--author">
          <label className="toolbar-field">
            <span className="toolbar-field__label">
              Поиск по моим статьям
            </span>

            <input
              className="toolbar-field__control"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Название или текст статьи"
            />
          </label>

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

        {!isLoading && !error && filteredArticles.length === 0 && (
          <div className="empty-state">
            <h2 className="empty-state__title">
              Статей не найдено
            </h2>
            <p className="empty-state__text">
              Создайте первую статью или измените параметры фильтрации.
            </p>
          </div>
        )}

        {!isLoading && filteredArticles.length > 0 && (
          <div className="table-list">
            {filteredArticles.map((article) => (
              <article className="my-article-card" key={article.id}>
                <div className="my-article-card__visual">
                  {article.title.slice(0, 1).toUpperCase()}
                </div>

                <div className="my-article-card__content">
                  <div className="my-article-card__meta">
                    <span className={`status status--${article.status}`}>
                      {article.status === 'published'
                        ? 'Опубликовано'
                        : 'Черновик'}
                    </span>

                    <span>{article.age_rating}</span>
                    <span>{article.sentiment}</span>
                    <span>{article.reading_time_minutes} мин.</span>
                  </div>

                  <h2 className="my-article-card__title">
                    {article.title}
                  </h2>

                  <p className="my-article-card__text">
                    {article.ai_summary || article.content}
                  </p>

                  <div className="my-article-card__stats">
                    <span>👁 {article.views_count}</span>
                    <span>❤ {article.likes_count}</span>
                    <span>💬 {article.comments_count}</span>
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