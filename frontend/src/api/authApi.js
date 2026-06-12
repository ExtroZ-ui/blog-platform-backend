import apiClient from './client';

export async function registerUser(payload) {
  const response = await apiClient.post('/auth/register', payload);

  return response.data;
}

export async function loginUser(payload) {
  const formData = new URLSearchParams();

  formData.append('username', payload.login);
  formData.append('password', payload.password);

  const response = await apiClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');

  return response.data;
}

export async function changePassword(payload) {
  const response = await apiClient.post('/auth/change-password', payload);

  return response.data;
}