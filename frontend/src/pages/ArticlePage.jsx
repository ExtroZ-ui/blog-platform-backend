import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getArticleById, toggleArticleLike } from '../api/articlesApi';
import { createComment, getArticleComments } from '../api/commentsApi';
import { Button } from '../components/Button/Button';
import { Loader } from '../components/Loader/Loader';
import { useAuth } from '../hooks/useAuth';
import { RichContent } from '../components/RichContent/RichContent';

const sentimentLabels = {
  positive: 'Позитивная',
  negative: 'Негативная',
  neutral: 'Нейтральная',
};

const riskLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

const commentStatusLabels = {
  approved: 'Одобрен',
  pending: 'На проверке',
  rejected: 'Отклонён',
};

export function ArticlePage() {
  const { articleId } = useParams();
  const { isAuthenticated } = useAuth();

  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentSending, setIsCommentSending] = useState(false);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');

  const loadArticleData = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);

      const [articleData, commentsData] = await Promise.all([
        getArticleById(articleId),
        getArticleComments(articleId, {
          skip: 0,
          limit: 50,
        }),
      ]);

      setArticle(articleData);
      setIsLiked(Boolean(articleData.is_liked));
      setComments(
        commentsData.filter((comment) => comment.moderation_status === 'approved'),
      );
    } catch {
      setError('Не удалось загрузить статью.');
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadArticleData();
  }, [loadArticleData]);

  async function handleLike() {
    if (!isAuthenticated) {
      setError('Чтобы поставить лайк, нужно войти в аккаунт.');
      return;
    }

    if (isLikeLoading) {
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikesCount = article.likes_count;

    try {
      setError('');
      setIsLikeLoading(true);

      const nextIsLiked = !previousIsLiked;

      setIsLiked(nextIsLiked);

      setArticle((currentArticle) => ({
        ...currentArticle,
        likes_count: nextIsLiked
          ? currentArticle.likes_count + 1
          : Math.max(0, currentArticle.likes_count - 1),
      }));

      const result = await toggleArticleLike(articleId);

      if (typeof result.likes_count === 'number') {
        setArticle((currentArticle) => ({
          ...currentArticle,
          likes_count: result.likes_count,
        }));
      }

      if (typeof result.is_liked === 'boolean') {
        setIsLiked(result.is_liked);
      }
    } catch {
      setIsLiked(previousIsLiked);

      setArticle((currentArticle) => ({
        ...currentArticle,
        likes_count: previousLikesCount,
      }));

      setError('Не удалось изменить лайк.');
    } finally {
      setIsLikeLoading(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    setCommentError('');
    setCommentSuccess('');

    if (commentText.trim().length < 2) {
      setCommentError('Комментарий должен содержать минимум 2 символа.');
      return;
    }

    try {
      setIsCommentSending(true);

      const newComment = await createComment({
        article_id: Number(articleId),
        text: commentText.trim(),
      });

      setCommentText('');

      if (newComment.moderation_status === 'approved') {
        setComments((currentComments) => [
          newComment,
          ...currentComments,
        ]);

        setArticle((currentArticle) => ({
          ...currentArticle,
          comments_count: currentArticle.comments_count + 1,
        }));

        setCommentSuccess('Комментарий опубликован.');
      } else if (newComment.moderation_status === 'pending') {
        setCommentSuccess(
          'Комментарий отправлен на проверку и пока не отображается публично.',
        );
      } else {
        setCommentSuccess(
          'Комментарий отклонён автоматической модерацией и не будет опубликован.',
        );
      }
    } catch {
      setCommentError('Не удалось отправить комментарий.');
    } finally {
      setIsCommentSending(false);
    }
  }

  if (isLoading) {
    return <Loader text="Загружаем статью..." />;
  }

  if (error && !article) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="empty-state">
            <h1 className="empty-state__title">Статья не найдена</h1>
            <p className="empty-state__text">{error}</p>

            <Link to="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section article-page">
      <div className="container">
        <Link className="back-link" to="/">
          ← Назад к статьям
        </Link>

        <article className="article-detail">
          <div className="article-detail__cover">
            {article.cover_image_url ? (
              <img
                className="article-detail__cover-image"
                src={article.cover_image_url}
                alt={article.title}
              />
            ) : (
              <span className="article-detail__cover-letter">
                  {article.title.slice(0, 1).toUpperCase()}
                </span>
            )}
          </div>

          <div className="article-detail__body">
            <div className="article-detail__meta">
              <span>{article.age_rating}</span>

              <span>
                {sentimentLabels[article.sentiment] || article.sentiment}
              </span>

              <span>{article.reading_time_minutes} мин чтения</span>

              <span>
                Риск: {riskLabels[article.moderation_risk] || article.moderation_risk}
              </span>
            </div>

            <h1 className="article-detail__title">
              {article.title}
            </h1>

            <div className="article-detail__stats article-detail__stats--interactive">
              <span>👁 Просмотры: {article.views_count}</span>

              <button
                className={`article-like-button ${isLiked ? 'article-like-button--active' : ''}`}
                type="button"
                onClick={handleLike}
                disabled={isLikeLoading}
                title={
                  isAuthenticated
                    ? 'Поставить или убрать лайк'
                    : 'Войдите, чтобы поставить лайк'
                }
              >
                <span className="article-like-button__heart">❤</span>
                <span>Лайки: {article.likes_count}</span>
              </button>

              <span>💬 Комментарии: {article.comments_count}</span>
            </div>

            {error && (
              <p className="page-error">
                {error}
              </p>
            )}

            <div className="article-detail__content">
              <RichContent content={article.content} />
            </div>

            {article.ai_summary && (
              <div className="article-overview article-overview--bottom">
                <p className="page-section__label">
                  AI-обзор
                </p>

                <p className="article-overview__summary">
                  {article.ai_summary}
                </p>

                <div className="article-overview__grid">
                  <div>
                    <span>Тональность</span>
                    <strong>
                      {sentimentLabels[article.sentiment] || article.sentiment}
                    </strong>
                  </div>

                  <div>
                    <span>Возрастной рейтинг</span>
                    <strong>{article.age_rating}</strong>
                  </div>

                  <div>
                    <span>Риск модерации</span>
                    <strong>
                      {riskLabels[article.moderation_risk] || article.moderation_risk}
                    </strong>
                  </div>

                  <div>
                    <span>Ключевые слова</span>
                    <strong>{article.ai_keywords || 'Не определены'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        <section className="comments-section">
          <div className="comments-section__head">
            <div>
              <p className="page-section__label">Обсуждение</p>
              <h2 className="comments-section__title">
                Комментарии
              </h2>
            </div>

            <span className="comments-section__count">
              {comments.length}
            </span>
          </div>

          {!isAuthenticated && (
            <div className="comment-auth-box">
              <div>
                <h3 className="comment-auth-box__title">
                  Хотите оставить комментарий?
                </h3>

                <p className="comment-auth-box__text">
                  Войдите в аккаунт, чтобы участвовать в обсуждении статьи.
                </p>
              </div>

              <Link to="/login">
                <Button type="button">
                  Войти для комментария
                </Button>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <label className="toolbar-field">
                <span className="toolbar-field__label">
                  Новый комментарий
                </span>

                <textarea
                  className="comment-form__textarea"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Напишите комментарий"
                  rows="4"
                />
              </label>

              {commentError && (
                <p className="form__error">
                  {commentError}
                </p>
              )}

              {commentSuccess && (
                <p className="form__success">
                  {commentSuccess}
                </p>
              )}

              <Button type="submit" disabled={isCommentSending}>
                {isCommentSending ? 'Отправка...' : 'Отправить комментарий'}
              </Button>
            </form>
          )}

          {comments.length === 0 && (
            <div className="empty-state empty-state--small">
              <p className="empty-state__text">
                Одобренных комментариев пока нет.
              </p>
            </div>
          )}

          {comments.length > 0 && (
            <div className="comments-list">
              {comments.map((comment) => (
                <article className="comment-card" key={comment.id}>
                  <div className="comment-card__author">
                    <strong>
                      {comment.author_name
                        || comment.author_login
                        || `Пользователь #${comment.author_id}`}
                    </strong>

                    <span>
                      {commentStatusLabels[comment.moderation_status]
                        || comment.moderation_status}
                    </span>
                  </div>

                  <p className="comment-card__text">
                    {comment.text}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}