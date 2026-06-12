import apiClient from './client';

export async function getCategories(params = {}) {
  const response = await apiClient.get('/categories', {
    params,
  });

  return response.data;
}

export async function createCategory(payload) {
  const response = await apiClient.post('/categories', payload);

  return response.data;
}

export async function updateCategory(categoryId, payload) {
  const response = await apiClient.patch(`/categories/${categoryId}`, payload);

  return response.data;
}

export async function deleteCategory(categoryId) {
  await apiClient.delete(`/categories/${categoryId}`);
}