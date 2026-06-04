import apiClient from './client';

export async function getCategories(params = {}) {
  const response = await apiClient.get('/categories', {
    params,
  });

  return response.data;
}