import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

function renderProtectedRoute(authValue) {
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
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthContext.Provider value={{ ...defaultAuthValue, ...authValue }}>
        <Routes>
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <div>Личный кабинет открыт</div>
              </ProtectedRoute>
            )}
          />

          <Route path="/login" element={<div>Страница входа</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('перенаправляет на login, если пользователь не авторизован', () => {
    renderProtectedRoute({
      isAuthenticated: false,
    });

    expect(screen.getByText(/страница входа/i)).toBeInTheDocument();
  });

  it('показывает защищённую страницу, если пользователь авторизован', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      user: {
        id: 1,
        login: 'ivan',
      },
    });

    expect(screen.getByText(/личный кабинет открыт/i)).toBeInTheDocument();
  });
});