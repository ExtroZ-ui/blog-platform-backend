import apiClient from './client';

export async function registerUser(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function loginUser(credentialsOrLogin, maybePassword) {
  const login = typeof credentialsOrLogin === 'object'
    ? credentialsOrLogin.login
    : credentialsOrLogin;

  const password = typeof credentialsOrLogin === 'object'
    ? credentialsOrLogin.password
    : maybePassword;

  const formData = new URLSearchParams();

  formData.append('username', login);
  formData.append('password', password);

  const { data } = await apiClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export async function refreshToken() {
  const refreshTokenValue = localStorage.getItem('refresh_token');

  const { data } = await apiClient.post('/auth/refresh', {
    refresh_token: refreshTokenValue,
  });

  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data;
}

export async function changePassword(payload) {
  const { data } = await apiClient.post('/auth/change-password', payload);
  return data;
}

export function logoutUser() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export const login = loginUser;
export const register = registerUser;
export const getMe = getCurrentUser;
export const logout = logoutUser;