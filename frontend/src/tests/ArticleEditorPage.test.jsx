import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ArticleEditorPage } from '../pages/ArticleEditorPage';

vi.mock('../api/categoriesApi', () => ({
  getCategories: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: 'Технологии',
    },
  ]),
}));

vi.mock('../api/articlesApi', () => ({
  createArticle: vi.fn().mockResolvedValue({
    id: 1,
  }),
  getMyArticles: vi.fn().mockResolvedValue([]),
  previewArticleAi: vi.fn().mockResolvedValue({
    sentiment: 'positive',
    age_rating: '12+',
    ai_summary: 'Краткое резюме статьи',
    ai_keywords: 'технологии, обучение',
    reading_time_minutes: 1,
    moderation_risk: 'low',
    ai_recommendation: 'Статья может быть опубликована.',
  }),
  updateArticle: vi.fn().mockResolvedValue({
    id: 1,
  }),
}));

describe('ArticleEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('показывает форму редактора статьи', async () => {
    render(
      <MemoryRouter>
        <ArticleEditorPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /новая статья/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/название статьи/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/категория/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/текст статьи/i)).toBeInTheDocument();
  });

  it('показывает ошибку при попытке сохранить пустую форму', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ArticleEditorPage />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /новая статья/i });

    await user.click(
      screen.getByRole('button', { name: /сохранить черновик/i }),
    );

    expect(
      screen.getByText(/название статьи должно содержать минимум 3 символа/i),
    ).toBeInTheDocument();
  });

  it('показывает результат AI-анализа', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ArticleEditorPage />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /новая статья/i });

    await user.type(
      screen.getByLabelText(/текст статьи/i),
      'Это полезная статья про технологии и обучение.',
    );

    await user.click(
      screen.getByRole('button', { name: /ai-анализ/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/краткое резюме статьи/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/positive/i)).toBeInTheDocument();
    expect(screen.getByText(/12\+/i)).toBeInTheDocument();
  });
});