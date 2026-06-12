import { Fragment } from 'react';

function renderInlineText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={`${part}-${index}`}>
          {part.slice(1, -1)}
        </em>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (linkMatch) {
      return (
        <a
          key={`${part}-${index}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return (
      <Fragment key={`${part}-${index}`}>
        {part}
      </Fragment>
    );
  });
}

export function RichContent({ content }) {
  if (!content) {
    return null;
  }

  const lines = content.split('\n');

  return (
    <div className="rich-content">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return null;
        }

        const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

        if (imageMatch) {
          return (
            <figure className="rich-content__image" key={`${trimmedLine}-${index}`}>
              <img src={imageMatch[2]} alt={imageMatch[1] || 'Изображение статьи'} />

              {imageMatch[1] && (
                <figcaption>
                  {imageMatch[1]}
                </figcaption>
              )}
            </figure>
          );
        }

        if (trimmedLine.startsWith('# ')) {
          return (
            <h2 key={`${trimmedLine}-${index}`}>
              {renderInlineText(trimmedLine.replace('# ', ''))}
            </h2>
          );
        }

        if (trimmedLine.startsWith('## ')) {
          return (
            <h3 key={`${trimmedLine}-${index}`}>
              {renderInlineText(trimmedLine.replace('## ', ''))}
            </h3>
          );
        }

        if (trimmedLine.startsWith('> ')) {
          return (
            <blockquote key={`${trimmedLine}-${index}`}>
              {renderInlineText(trimmedLine.replace('> ', ''))}
            </blockquote>
          );
        }

        if (trimmedLine.startsWith('- ')) {
          return (
            <p className="rich-content__list-item" key={`${trimmedLine}-${index}`}>
              • {renderInlineText(trimmedLine.replace('- ', ''))}
            </p>
          );
        }

        return (
          <p key={`${trimmedLine}-${index}`}>
            {renderInlineText(trimmedLine)}
          </p>
        );
      })}
    </div>
  );
}