import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  createArticle,
  getMyArticles,
  previewArticleAi,
  updateArticle,
} from '../api/articlesApi';
import { getCategories } from '../api/categoriesApi';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Loader } from '../components/Loader/Loader';

const INITIAL_FORM = {
  title: '',
  content: '',
  category_id: '',
};

export function ArticleEditorPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(articleId);

  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [aiPreview, setAiPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');

  const canPreview = useMemo(
    () => form.content.trim().length >= 10,
    [form.content],
  );

  const loadEditorData = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);

      const categoriesData = await getCategories({
        skip: 0,
        limit: 100,
      });

      setCategories(categoriesData);

      if (isEditMode) {
        const myArticles = await getMyArticles({
          skip: 0,
          limit: 100,
        });

        const article = myArticles.find(
          (item) => item.id === Number(articleId),
        );

        if (!article) {
          setError('Статья не найдена или у вас нет доступа к ней.');
          return;
        }

        setForm({
          title: article.title,
          content: article.content,
          category_id: String(article.category_id),
        });

        setAiPreview({
          sentiment: article.sentiment,
          age_rating: article.age_rating,
          ai_summary: article.ai_summary,
          ai_keywords: article.ai_keywords,
          reading_time_minutes: article.reading_time_minutes,
          moderation_risk: article.moderation_risk,
          ai_recommendation: article.ai_recommendation,
        });
      }
    } catch {
      setError('Не удалось загрузить данные редактора.');
    } finally {
      setIsLoading(false);
    }
  }, [articleId, isEditMode]);

  useEffect(() => {
    loadEditorData();
  }, [loadEditorData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function validateForm() {
    if (form.title.trim().length < 3) {
      return 'Название статьи должно содержать минимум 3 символа.';
    }

    if (form.content.trim().length < 10) {
      return 'Текст статьи должен содержать минимум 10 символов.';
    }

    if (!form.category_id) {
      return 'Выберите категорию статьи.';
    }

    return '';
  }

  async function handlePreview() {
    setPreviewError('');

    if (!canPreview) {
      setPreviewError('Для AI-анализа нужно минимум 10 символов текста.');
      return;
    }

    try {
      setIsPreviewLoading(true);

      const preview = await previewArticleAi(form.content.trim());
      setAiPreview(preview);
    } catch {
      setPreviewError('Не удалось выполнить AI-анализ.');
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleSubmit(status) {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category_id: Number(form.category_id),
        status,
      };

      if (isEditMode) {
        await updateArticle(articleId, payload);
      } else {
        await createArticle(payload);
      }

      navigate('/dashboard/articles');
    } catch {
      setError('Не удалось сохранить статью.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <Loader text="Загружаем редактор..." />;
  }

  return (
    <section className="page-section">
      <div className="container">
        <p className="page-section__label">
          Редактор
        </p>

        <h1 className="page-section__title">
          {isEditMode ? 'Редактирование статьи' : 'Новая статья'}
        </h1>

        <p className="page-section__text">
          Заполните название, выберите категорию и добавьте текст статьи.
          Материал можно сохранить как черновик или сразу опубликовать.
        </p>

        <div className="editor-layout">
          <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
            <Input
              label="Название статьи"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Введите название статьи"
            />

            <label className="toolbar-field">
              <span className="toolbar-field__label">
                Категория
              </span>

              <select
                className="toolbar-field__control"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
              >
                <option value="">
                  Выберите категорию
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="toolbar-field">
              <span className="toolbar-field__label">
                Текст статьи
              </span>

              <textarea
                className="editor-form__textarea"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Введите текст статьи"
                rows="12"
              />
            </label>

            {error && (
              <p className="form__error">
                {error}
              </p>
            )}

            <div className="editor-form__actions">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => handleSubmit('draft')}
              >
                Сохранить черновик
              </Button>

              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit('published')}
              >
                Опубликовать
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isPreviewLoading}
                onClick={handlePreview}
              >
                {isPreviewLoading ? 'Анализ...' : 'AI-анализ'}
              </Button>
            </div>
          </form>

          <aside className="ai-preview">
            <h2 className="ai-preview__title">
              AI-предпросмотр
            </h2>

            <p className="ai-preview__text">
              Здесь отображается анализ статьи: тональность, возрастной рейтинг,
              ключевые слова, время чтения и рекомендация автору.
            </p>

            {previewError && (
              <p className="form__error">
                {previewError}
              </p>
            )}

            {!aiPreview && (
              <div className="empty-state empty-state--small">
                <p className="empty-state__text">
                  Нажмите «AI-анализ», чтобы получить предварительную оценку текста.
                </p>
              </div>
            )}

            {aiPreview && (
              <div className="ai-preview__result">
                <p>
                  <strong>Тональность:</strong> {aiPreview.sentiment}
                </p>
                <p>
                  <strong>Возрастной рейтинг:</strong> {aiPreview.age_rating}
                </p>
                <p>
                  <strong>Время чтения:</strong> {aiPreview.reading_time_minutes} мин.
                </p>
                <p>
                  <strong>Риск модерации:</strong> {aiPreview.moderation_risk}
                </p>
                <p>
                  <strong>Ключевые слова:</strong> {aiPreview.ai_keywords || 'не определены'}
                </p>
                <p>
                  <strong>Резюме:</strong> {aiPreview.ai_summary || 'не сформировано'}
                </p>
                <p>
                  <strong>Рекомендация:</strong> {aiPreview.ai_recommendation}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}