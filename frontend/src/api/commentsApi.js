import apiClient from './client';

export async function getArticleComments(articleId, params = {}) {
  const response = await apiClient.get(`/comments/article/${articleId}`, {
    params,
  });

  return response.data;
}

export async function getMyComments(params = {}) {
  const response = await apiClient.get('/comments/my', {
    params,
  });

  return response.data;
}

export async function createComment(payload) {
  const response = await apiClient.post('/comments', payload);

  return response.data;
}

export async function updateComment(commentId, payload) {
  const response = await apiClient.patch(`/comments/${commentId}`, payload);

  return response.data;
}

export async function deleteComment(commentId) {
  await apiClient.delete(`/comments/${commentId}`);
}

export async function moderateComment(commentId, payload) {
  const response = await apiClient.patch(`/comments/${commentId}/moderate`, payload);

  return response.data;
}