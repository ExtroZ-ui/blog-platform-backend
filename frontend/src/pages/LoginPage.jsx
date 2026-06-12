import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    login: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.login.trim().length < 3) {
      setError('Логин должен содержать минимум 3 символа.');
      return;
    }

    if (form.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(form);
      navigate('/dashboard');
    } catch {
      setError('Неверный логин или пароль.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-hero">
          <p className="page-section__label">Добро пожаловать</p>
          <h1 className="auth-hero__title">Войдите в Blog Platform</h1>
          <p className="auth-hero__text">
            После входа вы сможете создавать статьи, сохранять черновики,
            публиковать материалы, оставлять комментарии и ставить лайки.
          </p>

          <div className="auth-hero__features">
            <span>AI-анализ статей</span>
            <span>Комментарии</span>
            <span>Личный кабинет</span>
          </div>
        </div>

        <div className="auth-card">
          <h2 className="auth-card__title">Вход</h2>
          <p className="auth-card__text">
            Введите логин и пароль от аккаунта.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <Input
              label="Логин"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="ivan"
              autoComplete="username"
            />

            <Input
              label="Пароль"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="password123"
              autoComplete="current-password"
            />

            {error && <p className="form__error">{error}</p>}

            <Button type="submit" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <p className="auth-card__footer">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </section>
  );
}