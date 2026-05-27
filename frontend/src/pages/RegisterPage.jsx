import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    if (form.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов.');
      return;
    }

    try {
      await register(form);
      navigate('/login');
    } catch {
      setError('Не удалось зарегистрироваться. Возможно, логин уже занят.');
    }
  }

  return (
    <section className="page-section">
      <div className="auth-card">
        <h1 className="auth-card__title">Регистрация</h1>
        <p className="auth-card__text">
          Создайте аккаунт для публикации статей.
        </p>

        <form className="form" onSubmit={handleSubmit}>
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

          <Button type="submit" size="large">
            Зарегистрироваться
          </Button>
        </form>
      </div>
    </section>
  );
}