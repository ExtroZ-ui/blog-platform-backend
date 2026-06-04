import apiClient from './client';

export async function getArticleComments(articleId, params = {}) {
  const response = await apiClient.get(`/comments/article/${articleId}`, {
    params,
  });

  return response.data;
}

export async function createComment(payload) {
  const response = await apiClient.post('/comments', payload);
  return response.data;
}