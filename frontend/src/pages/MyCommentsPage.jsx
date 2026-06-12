import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  deleteComment,
  getMyComments,
  updateComment,
} from '../api/commentsApi';
import { Button } from '../components/Button/Button';
import { Loader } from '../components/Loader/Loader';

const statusLabels = {
  approved: 'Одобрен',
  pending: 'На проверке',
  rejected: 'Отклонён',
};

export function MyCommentsPage() {
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requestParams = useMemo(() => {
    const params = {
      skip: 0,
      limit: 100,
    };

    if (statusFilter) {
      params.moderation_status = statusFilter;
    }

    return params;
  }, [statusFilter]);

  const stats = useMemo(() => ({
    total: comments.length,
    approved: comments.filter((comment) => comment.moderation_status === 'approved').length,
    pending: comments.filter((comment) => comment.moderation_status === 'pending').length,
    rejected: comments.filter((comment) => comment.moderation_status === 'rejected').length,
  }), [comments]);

  const loadComments = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);

      const data = await getMyComments(requestParams);
      setComments(data);
    } catch {
      setError('Не удалось загрузить комментарии.');
    } finally {
      setIsLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  function startEdit(comment) {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditingCommentId(null);
    setEditingText('');
  }

  async function handleUpdateComment(commentId) {
    setError('');
    setSuccess('');

    if (editingText.trim().length < 2) {
      setError('Комментарий должен содержать минимум 2 символа.');
      return;
    }

    try {
      setIsSubmitting(true);

      await updateComment(commentId, {
        text: editingText.trim(),
      });

      setEditingCommentId(null);
      setEditingText('');
      setSuccess('Комментарий обновлён. Статус модерации пересчитан.');

      await loadComments();
    } catch {
      setError('Не удалось обновить комментарий.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    const isConfirmed = window.confirm(
      'Вы действительно хотите удалить комментарий?',
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setIsSubmitting(true);

      await deleteComment(commentId);

      setComments((currentComments) => (
        currentComments.filter((comment) => comment.id !== commentId)
      ));

      setSuccess('Комментарий удалён.');
    } catch {
      setError('Не удалось удалить комментарий.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-section my-comments-page">
      <div className="container">
        <div className="page-head page-head--panel">
          <div>
            <p className="page-section__label">
              Личный кабинет
            </p>

            <h1 className="page-section__title">
              Мои комментарии
            </h1>

            <p className="page-section__text">
              Просматривайте свои комментарии, редактируйте текст и удаляйте
              лишние записи.
            </p>
          </div>
        </div>

        <div className="comment-stats">
          <article className="comment-stat">
            <span>Всего</span>
            <strong>{stats.total}</strong>
          </article>

          <article className="comment-stat">
            <span>Одобрены</span>
            <strong>{stats.approved}</strong>
          </article>

          <article className="comment-stat">
            <span>На проверке</span>
            <strong>{stats.pending}</strong>
          </article>

          <article className="comment-stat">
            <span>Отклонены</span>
            <strong>{stats.rejected}</strong>
          </article>
        </div>

        <div className="comments-filter">
          <label className="toolbar-field">
            <span className="toolbar-field__label">
              Статус комментария
            </span>

            <select
              className="toolbar-field__control"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Все комментарии</option>
              <option value="approved">Одобренные</option>
              <option value="pending">На проверке</option>
              <option value="rejected">Отклонённые</option>
            </select>
          </label>
        </div>

        {error && (
          <p className="page-error">
            {error}
          </p>
        )}

        {success && (
          <p className="form__success">
            {success}
          </p>
        )}

        {isLoading && <Loader text="Загружаем комментарии..." />}

        {!isLoading && comments.length === 0 && (
          <div className="empty-state">
            <h2 className="empty-state__title">
              Комментариев пока нет
            </h2>

            <p className="empty-state__text">
              Откройте опубликованную статью и оставьте первый комментарий.
            </p>

            <Link to="/">
              <Button>
                Перейти к статьям
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && comments.length > 0 && (
          <div className="my-comments-list">
            {comments.map((comment) => (
              <article className="my-comment-card" key={comment.id}>
                <div className="my-comment-card__top">
                  <span className={`status status--${comment.moderation_status}`}>
                    {statusLabels[comment.moderation_status] || comment.moderation_status}
                  </span>

                  <Link className="my-comment-card__link" to={`/articles/${comment.article_id}`}>
                    Открыть статью #{comment.article_id}
                  </Link>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="my-comment-card__edit">
                    <textarea
                      className="comment-form__textarea"
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      rows="4"
                    />

                    <div className="my-comment-card__actions">
                      <Button
                        type="button"
                        size="small"
                        disabled={isSubmitting}
                        onClick={() => handleUpdateComment(comment.id)}
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
                  </div>
                ) : (
                  <>
                    <p className="my-comment-card__text">
                      {comment.text}
                    </p>

                    <div className="my-comment-card__actions">
                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        onClick={() => startEdit(comment)}
                      >
                        Редактировать
                      </Button>

                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        disabled={isSubmitting}
                        onClick={() => handleDeleteComment(comment.id)}
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
    </section>
  );
}