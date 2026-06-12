import { useEffect, useMemo, useState } from 'react';

import { getArticles } from '../api/articlesApi';
import { getCategories } from '../api/categoriesApi';
import { ArticleCard } from '../components/ArticleCard/ArticleCard';
import { Loader } from '../components/Loader/Loader';

export function HomePage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const articleParams = useMemo(() => {
    const params = {
      skip: 0,
      limit: 20,
    };

    if (selectedCategoryId) {
      params.category_id = selectedCategoryId;
    }

    if (search.trim().length >= 2) {
      params.search = search.trim();
    }

    return params;
  }, [selectedCategoryId, search]);

  useEffect(() => {
    async function loadData() {
      try {
        setError('');
        setIsLoading(true);

        const [articlesData, categoriesData] = await Promise.all([
          getArticles(articleParams),
          getCategories({
            skip: 0,
            limit: 100,
          }),
        ]);

        setArticles(articlesData);
        setCategories(categoriesData);
      } catch {
        setError('Не удалось загрузить статьи. Проверьте, запущен ли backend.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [articleParams]);

  return (
    <section className="page-section page-section--hero">
      <div className="container">
        <div className="hero-block">
          <div>
            <p className="page-section__label">
              Платформа для блогов
            </p>

            <h1 className="page-section__title">
              Опубликованные статьи
            </h1>

            <p className="page-section__text">
              Читайте материалы пользователей, фильтруйте статьи по категориям,
              оставляйте комментарии и сохраняйте интересные публикации через лайки.
            </p>
          </div>

          <div className="hero-stats">
            <div className="hero-stats__item">
              <strong>{articles.length}</strong>
              <span>статей</span>
            </div>

            <div className="hero-stats__item">
              <strong>{categories.length}</strong>
              <span>категорий</span>
            </div>
          </div>
        </div>

        <div className="articles-toolbar">
          <label className="toolbar-field">
            <span className="toolbar-field__label">
              Поиск статьи
            </span>

            <input
              className="toolbar-field__control"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Введите минимум 2 символа"
            />
          </label>

          <label className="toolbar-field">
            <span className="toolbar-field__label">
              Категория
            </span>

            <select
              className="toolbar-field__control"
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
            >
              <option value="">
                Все категории
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading && <Loader text="Загружаем статьи..." />}

        {error && (
          <p className="page-error">
            {error}
          </p>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="empty-state">
            <h2 className="empty-state__title">
              Опубликованных статей пока нет
            </h2>
            <p className="empty-state__text">
              Создайте статью в личном кабинете и опубликуйте её.
            </p>
          </div>
        )}

        {!isLoading && !error && articles.length > 0 && (
          <div className="articles-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}