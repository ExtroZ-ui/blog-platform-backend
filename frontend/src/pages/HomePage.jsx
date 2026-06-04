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
    async function loadInitialData() {
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

    loadInitialData();
  }, [articleParams]);

  return (
    <section className="page-section">
      <div className="container">
        <p className="page-section__label">
          Платформа для блогов
        </p>

        <h1 className="page-section__title">
          Опубликованные статьи
        </h1>

        <p className="page-section__text">
          Читайте статьи пользователей, фильтруйте материалы по категориям,
          оставляйте комментарии и ставьте лайки.
        </p>

        <div className="articles-toolbar">
          <label className="toolbar-field">
            <span className="toolbar-field__label">
              Поиск
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
              Статей пока нет
            </h2>
            <p className="empty-state__text">
              Создайте и опубликуйте первую статью через личный кабинет.
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