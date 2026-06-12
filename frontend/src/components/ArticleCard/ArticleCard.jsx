import { Link } from 'react-router-dom';

import { Button } from '../Button/Button';

const sentimentLabels = {
  positive: 'Позитивная',
  negative: 'Негативная',
  neutral: 'Нейтральная',
};

export function ArticleCard({ article }) {
  const summary = article.ai_summary || article.content || '';
  const titleFirstLetter = article.title.slice(0, 1).toUpperCase();

  return (
    <article className="article-card">
      <div className="article-card__visual">
        {article.cover_image_url ? (
          <img
            className="article-card__image"
            src={article.cover_image_url}
            alt={article.title}
          />
        ) : (
          <span className="article-card__visual-text">
            {titleFirstLetter}
          </span>
        )}
      </div>

      <div className="article-card__body">
        <div className="article-card__top">
          <span className="article-card__badge">
            {article.age_rating}
          </span>

          <span className={`article-card__sentiment article-card__sentiment--${article.sentiment}`}>
            {sentimentLabels[article.sentiment] || article.sentiment}
          </span>
        </div>

        <h2 className="article-card__title">
          {article.title}
        </h2>

        <p className="article-card__text">
          {summary.length > 160 ? `${summary.slice(0, 160)}...` : summary}
        </p>

        <div className="article-card__meta">
          <span>👁 {article.views_count}</span>
          <span>❤ {article.likes_count}</span>
          <span>💬 {article.comments_count}</span>
          <span>⏱ {article.reading_time_minutes} мин.</span>
        </div>

        <Link to={`/articles/${article.id}`}>
          <Button size="medium">
            Читать статью
          </Button>
        </Link>
      </div>
    </article>
  );
}