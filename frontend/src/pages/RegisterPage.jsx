import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
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

    if (form.first_name.trim().length < 1) {
      setError('Введите имя.');
      return;
    }

    if (form.last_name.trim().length < 1) {
      setError('Введите фамилию.');
      return;
    }

    if (form.login.trim().length < 3) {
      setError('Логин должен содержать минимум 3 символа.');
      return;
    }

    if (form.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(form);
      navigate('/login');
    } catch {
      setError('Не удалось зарегистрироваться. Возможно, логин уже занят.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-hero">
          <p className="page-section__label">Создание аккаунта</p>
          <h1 className="auth-hero__title">Начните публиковать статьи</h1>
          <p className="auth-hero__text">
            Зарегистрируйтесь, чтобы получить доступ к редактору,
            черновикам, публикации статей и управлению комментариями.
          </p>

          <div className="auth-hero__features">
            <span>Черновики</span>
            <span>Публикации</span>
            <span>Статистика</span>
          </div>
        </div>

        <div className="auth-card">
          <h2 className="auth-card__title">Регистрация</h2>
          <p className="auth-card__text">
            Заполните данные нового пользователя.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-grid form-grid--two">
              <Input
                label="Имя"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Иван"
              />

              <Input
                label="Фамилия"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Иванов"
              />
            </div>

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
              autoComplete="new-password"
            />

            {error && <p className="form__error">{error}</p>}

            <Button type="submit" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>

          <p className="auth-card__footer">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </section>
  );
}