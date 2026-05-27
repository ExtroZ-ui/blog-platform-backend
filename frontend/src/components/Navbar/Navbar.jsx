import { NavLink, Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link className="navbar__logo" to="/">
          Blog Platform
        </Link>

        <input
          className="navbar__checkbox"
          type="checkbox"
          id="navbar-toggle"
        />

        <label className="navbar__toggle" htmlFor="navbar-toggle">
          <span className="navbar__toggle-line" />
          <span className="navbar__toggle-line" />
          <span className="navbar__toggle-line" />
        </label>

        <nav className="navbar__menu">
          <NavLink className="navbar__link" to="/">
            Статьи
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink className="navbar__link" to="/dashboard">
                Кабинет
              </NavLink>

              <NavLink className="navbar__link" to="/editor">
                Новая статья
              </NavLink>
            </>
          )}

          {!isAuthenticated && (
            <>
              <NavLink className="navbar__link" to="/login">
                Вход
              </NavLink>

              <NavLink className="navbar__link" to="/register">
                Регистрация
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <button className="navbar__logout" type="button" onClick={logout}>
              Выйти
              {user?.login ? ` (${user.login})` : ''}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}