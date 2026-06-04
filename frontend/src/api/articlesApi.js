import apiClient from './client';

export async function getArticles(params = {}) {
  const response = await apiClient.get('/articles', {
    params,
  });

  return response.data;
}

export async function getArticleById(articleId) {
  const response = await apiClient.get(`/articles/${articleId}`);
  return response.data;
}

export async function getMyArticles(params = {}) {
  const response = await apiClient.get('/articles/my', {
    params,
  });

  return response.data;
}

export async function createArticle(payload) {
  const response = await apiClient.post('/articles', payload);
  return response.data;
}

export async function updateArticle(articleId, payload) {
  const response = await apiClient.patch(`/articles/${articleId}`, payload);
  return response.data;
}

export async function deleteArticle(articleId) {
  await apiClient.delete(`/articles/${articleId}`);
}

export async function publishArticle(articleId) {
  const response = await apiClient.post(`/articles/${articleId}/publish`);
  return response.data;
}

export async function toggleArticleLike(articleId) {
  const response = await apiClient.post(`/articles/${articleId}/like`);
  return response.data;
}

export async function previewArticleAi(content) {
  const response = await apiClient.post('/articles/ai-preview', {
    content,
  });

  return response.data;
}