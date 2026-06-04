import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';

function renderLoginPage(authValue = {}) {
  const defaultAuthValue = {
    login: vi.fn(),
    user: null,
    isAuthenticated: false,
    isAuthLoading: false,
    logout: vi.fn(),
    register: vi.fn(),
    reloadUser: vi.fn(),
  };

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ ...defaultAuthValue, ...authValue }}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('показывает ошибку при слишком коротком логине', async () => {
    const user = userEvent.setup();

    renderLoginPage();

    await user.type(screen.getByLabelText(/логин/i), 'iv');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(
      screen.getByText(/логин должен содержать минимум 3 символа/i),
    ).toBeInTheDocument();
  });

  it('показывает ошибку при коротком пароле', async () => {
    const user = userEvent.setup();

    renderLoginPage();

    await user.type(screen.getByLabelText(/логин/i), 'ivan');
    await user.type(screen.getByLabelText(/пароль/i), '123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(
      screen.getByText(/пароль должен содержать минимум 6 символов/i),
    ).toBeInTheDocument();
  });

  it('вызывает login при корректных данных', async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn().mockResolvedValue({ login: 'ivan' });

    renderLoginPage({
      login: loginMock,
    });

    await user.type(screen.getByLabelText(/логин/i), 'ivan');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(loginMock).toHaveBeenCalledWith({
      login: 'ivan',
      password: 'password123',
    });
  });
});