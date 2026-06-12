import { useCallback, useEffect, useState } from 'react';

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/categoriesApi';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Loader } from '../components/Loader/Loader';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);

      const data = await getCategories({
        skip: 0,
        limit: 100,
      });

      setCategories(data);
    } catch {
      setError('Не удалось загрузить категории.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleCreateCategory(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (newCategoryName.trim().length < 2) {
      setError('Название категории должно содержать минимум 2 символа.');
      return;
    }

    try {
      setIsSubmitting(true);

      await createCategory({
        name: newCategoryName.trim(),
      });

      setNewCategoryName('');
      setSuccess('Категория создана.');
      await loadCategories();
    } catch {
      setError('Не удалось создать категорию. Возможно, такая категория уже есть.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(category) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  }

  async function handleUpdateCategory(categoryId) {
    setError('');
    setSuccess('');

    if (editingCategoryName.trim().length < 2) {
      setError('Название категории должно содержать минимум 2 символа.');
      return;
    }

    try {
      setIsSubmitting(true);

      await updateCategory(categoryId, {
        name: editingCategoryName.trim(),
      });

      setEditingCategoryId(null);
      setEditingCategoryName('');
      setSuccess('Категория обновлена.');
      await loadCategories();
    } catch {
      setError('Не удалось обновить категорию. Возможно, такое название уже занято.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(categoryId) {
    const isConfirmed = window.confirm(
      'Удалить категорию? Если в ней есть статьи, backend не позволит удалить её.',
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setIsSubmitting(true);

      await deleteCategory(categoryId);

      setSuccess('Категория удалена.');
      await loadCategories();
    } catch {
      setError('Не удалось удалить категорию. Возможно, в ней уже есть статьи.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-section categories-page">
      <div className="container">
        <div className="page-head page-head--panel">
          <div>
            <p className="page-section__label">
              Управление блогом
            </p>

            <h1 className="page-section__title">
              Категории
            </h1>

            <p className="page-section__text">
              Создавайте и редактируйте категории, чтобы авторы могли
              распределять статьи по темам.
            </p>
          </div>
        </div>

        <div className="categories-layout">
          <form className="category-form" onSubmit={handleCreateCategory}>
            <h2 className="category-form__title">
              Новая категория
            </h2>

            <Input
              label="Название категории"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Например: Технологии"
            />

            {error && (
              <p className="form__error">
                {error}
              </p>
            )}

            {success && (
              <p className="form__success">
                {success}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting}>
              Создать категорию
            </Button>
          </form>

          <div className="categories-panel">
            <div className="categories-panel__head">
              <div>
                <p className="page-section__label">
                  Список
                </p>

                <h2 className="categories-panel__title">
                  Все категории
                </h2>
              </div>

              <span className="categories-panel__count">
                {categories.length}
              </span>
            </div>

            {isLoading && <Loader text="Загружаем категории..." />}

            {!isLoading && categories.length === 0 && (
              <div className="empty-state empty-state--small">
                <p className="empty-state__text">
                  Категорий пока нет.
                </p>
              </div>
            )}

            {!isLoading && categories.length > 0 && (
              <div className="categories-list">
                {categories.map((category) => (
                  <article className="category-card" key={category.id}>
                    {editingCategoryId === category.id ? (
                      <>
                        <input
                          className="toolbar-field__control"
                          value={editingCategoryName}
                          onChange={(event) => setEditingCategoryName(event.target.value)}
                        />

                        <div className="category-card__actions">
                          <Button
                            type="button"
                            size="small"
                            disabled={isSubmitting}
                            onClick={() => handleUpdateCategory(category.id)}
                          >
                            Сохранить
                          </Button>

                          <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={cancelEdit}
                          >
                            Отмена
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="category-card__content">
                          <span className="category-card__icon">
                            #
                          </span>

                          <div>
                            <h3 className="category-card__title">
                              {category.name}
                            </h3>

                            <p className="category-card__text">
                              ID категории: {category.id}
                            </p>
                          </div>
                        </div>

                        <div className="category-card__actions">
                          <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={() => startEdit(category)}
                          >
                            Изменить
                          </Button>

                          <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            disabled={isSubmitting}
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}