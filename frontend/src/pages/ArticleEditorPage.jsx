import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
import { RichContent } from '../components/RichContent/RichContent';

const INITIAL_FORM = {
  title: '',
  content: '',
  category_id: '',
  cover_image_url: '',
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

  const symbolsCount = form.content.length;

  const wordsCount = useMemo(() => {
    return form.content
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, [form.content]);

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
          cover_image_url: article.cover_image_url || '',
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

  function insertText(before, after = '') {
    const textarea = document.querySelector('#article-content-editor');

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.slice(start, end);
    const textForInsert = selectedText || 'текст';

    const nextContent = [
      form.content.slice(0, start),
      `${before}${textForInsert}${after}`,
      form.content.slice(end),
    ].join('');

    setForm((currentForm) => ({
      ...currentForm,
      content: nextContent,
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + textForInsert.length;
    }, 0);
  }

  function insertImageMarkdown() {
    const imageUrl = window.prompt('Вставьте URL изображения');

    if (!imageUrl) {
      return;
    }

    insertText(`\n![Описание изображения](${imageUrl})\n`, '');
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

      const preview = await previewArticleAi(
        `${form.title.trim()}\n\n${form.content.trim()}`,
      );

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
        cover_image_url: form.cover_image_url.trim() || null,
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
    <section className="page-section editor-page">
      <div className="container">
        <Link className="back-link" to="/dashboard/articles">
          ← Назад к моим статьям
        </Link>

        <div className="editor-head">
          <div>
            <p className="page-section__label">
              Редактор
            </p>

            <h1 className="page-section__title">
              {isEditMode ? 'Редактирование статьи' : 'Новая статья'}
            </h1>

            <p className="page-section__text">
              Добавьте обложку, оформите текст, проверьте материал через
              AI-анализ и сохраните статью.
            </p>
          </div>

          <div className="editor-metrics">
            <article className="editor-metric">
              <span>Символы</span>
              <strong>{symbolsCount}</strong>
            </article>

            <article className="editor-metric">
              <span>Слова</span>
              <strong>{wordsCount}</strong>
            </article>
          </div>
        </div>

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

            <Input
              label="URL обложки статьи"
              name="cover_image_url"
              value={form.cover_image_url}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
            />

            {form.cover_image_url && (
              <div className="editor-cover-preview">
                <img src={form.cover_image_url} alt="Предпросмотр обложки" />
              </div>
            )}

            <label className="toolbar-field">
              <span className="toolbar-field__label">
                Текст статьи
              </span>

              <div className="editor-toolbar">
                <button type="button" onClick={() => insertText('**', '**')}>
                  Жирный
                </button>

                <button type="button" onClick={() => insertText('*', '*')}>
                  Курсив
                </button>

                <button type="button" onClick={() => insertText('\n# ', '')}>
                  Заголовок
                </button>

                <button type="button" onClick={() => insertText('\n> ', '')}>
                  Цитата
                </button>

                <button type="button" onClick={() => insertText('\n- ', '')}>
                  Список
                </button>

                <button type="button" onClick={() => insertText('[', '](https://example.com)')}>
                  Ссылка
                </button>

                <button type="button" onClick={insertImageMarkdown}>
                  Картинка
                </button>
              </div>

              <textarea
                id="article-content-editor"
                className="editor-form__textarea"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Введите текст статьи"
                rows="14"
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

            {form.content.trim().length > 0 && (
              <div className="editor-content-preview">
                <h2 className="editor-content-preview__title">
                  Предпросмотр текста
                </h2>

                <RichContent content={form.content} />
              </div>
            )}
          </form>

          <aside className="ai-preview">
            <div className="ai-preview__header">
              <span className="ai-preview__icon">🤖</span>

              <div>
                <h2 className="ai-preview__title">
                  AI-предпросмотр
                </h2>

                <p className="ai-preview__text">
                  Анализирует тональность, возрастной рейтинг, ключевые слова,
                  время чтения и риск модерации.
                </p>
              </div>
            </div>

            {previewError && (
              <p className="form__error">
                {previewError}
              </p>
            )}

            {!aiPreview && (
              <div className="empty-state empty-state--small">
                <p className="empty-state__text">
                  Введите текст статьи и нажмите «AI-анализ».
                </p>
              </div>
            )}

            {aiPreview && (
              <div className="ai-preview__result">
                <article className="ai-preview-card">
                  <span>Тональность</span>
                  <strong>{aiPreview.sentiment}</strong>
                </article>

                <article className="ai-preview-card">
                  <span>Возрастной рейтинг</span>
                  <strong>{aiPreview.age_rating}</strong>
                </article>

                <article className="ai-preview-card">
                  <span>Время чтения</span>
                  <strong>{aiPreview.reading_time_minutes} мин.</strong>
                </article>

                <article className="ai-preview-card">
                  <span>Риск модерации</span>
                  <strong>{aiPreview.moderation_risk}</strong>
                </article>

                <div className="ai-preview-note">
                  <p>
                    <strong>Ключевые слова:</strong>{' '}
                    {aiPreview.ai_keywords || 'не определены'}
                  </p>

                  <p>
                    <strong>Резюме:</strong>{' '}
                    {aiPreview.ai_summary || 'не сформировано'}
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}