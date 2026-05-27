import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      await login(form);
      navigate('/dashboard');
    } catch {
      setError('Неверный логин или пароль.');
    }
  }

  return (
    <section className="page-section">
      <div className="auth-card">
        <h1 className="auth-card__title">Вход</h1>
        <p className="auth-card__text">
          Войдите в аккаунт, чтобы создавать статьи и оставлять комментарии.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <Input
            label="Логин"
            name="login"
            value={form.login}
            onChange={handleChange}
            placeholder="Введите логин"
            autoComplete="username"
          />

          <Input
            label="Пароль"
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Введите пароль"
            autoComplete="current-password"
          />

          {error && <p className="form__error">{error}</p>}

          <Button type="submit" size="large">
            Войти
          </Button>
        </form>
      </div>
    </section>
  );
}