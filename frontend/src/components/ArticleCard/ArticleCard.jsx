import { Link } from 'react-router-dom';

import { Button } from '../Button/Button';

export function ArticleCard({ article }) {
  return (
    <article className="article-card">
      <div className="article-card__top">
        <span className="article-card__badge">
          {article.age_rating}
        </span>

        <span className={`article-card__sentiment article-card__sentiment--${article.sentiment}`}>
          {article.sentiment}
        </span>
      </div>

      <h2 className="article-card__title">
        {article.title}
      </h2>

      <p className="article-card__text">
        {article.ai_summary || article.content}
      </p>

      <div className="article-card__meta">
        <span>Просмотры: {article.views_count}</span>
        <span>Лайки: {article.likes_count}</span>
        <span>Комментарии: {article.comments_count}</span>
      </div>

      <Link to={`/articles/${article.id}`}>
        <Button size="medium">
          Читать
        </Button>
      </Link>
    </article>
  );
}