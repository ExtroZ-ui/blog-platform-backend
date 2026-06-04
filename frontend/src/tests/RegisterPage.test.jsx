import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import { RegisterPage } from '../pages/RegisterPage';

function renderRegisterPage(authValue = {}) {
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
        <RegisterPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  it('показывает ошибку, если имя не заполнено', async () => {
    const user = userEvent.setup();

    renderRegisterPage();

    await user.click(
      screen.getByRole('button', { name: /зарегистрироваться/i }),
    );

    expect(screen.getByText(/введите имя/i)).toBeInTheDocument();
  });

  it('показывает ошибку при коротком логине', async () => {
    const user = userEvent.setup();

    renderRegisterPage();

    await user.type(screen.getByLabelText(/имя/i), 'Иван');
    await user.type(screen.getByLabelText(/фамилия/i), 'Иванов');
    await user.type(screen.getByLabelText(/логин/i), 'iv');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');

    await user.click(
      screen.getByRole('button', { name: /зарегистрироваться/i }),
    );

    expect(
      screen.getByText(/логин должен содержать минимум 3 символа/i),
    ).toBeInTheDocument();
  });

  it('вызывает register при корректных данных', async () => {
    const user = userEvent.setup();
    const registerMock = vi.fn().mockResolvedValue({
      id: 1,
      login: 'ivan',
    });

    renderRegisterPage({
      register: registerMock,
    });

    await user.type(screen.getByLabelText(/имя/i), 'Иван');
    await user.type(screen.getByLabelText(/фамилия/i), 'Иванов');
    await user.type(screen.getByLabelText(/логин/i), 'ivan');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');

    await user.click(
      screen.getByRole('button', { name: /зарегистрироваться/i }),
    );

    expect(registerMock).toHaveBeenCalledWith({
      first_name: 'Иван',
      last_name: 'Иванов',
      login: 'ivan',
      password: 'password123',
    });
  });
});