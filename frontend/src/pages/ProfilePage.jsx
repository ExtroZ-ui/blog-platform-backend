import { useState } from 'react';

import { changePassword } from '../api/authApi';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { useAuth } from '../hooks/useAuth';

const INITIAL_PASSWORD_FORM = {
  old_password: '',
  new_password: '',
};

export function ProfilePage() {
  const { user } = useAuth();

  const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function validatePasswordForm() {
    if (passwordForm.old_password.length < 1) {
      return 'Введите старый пароль.';
    }

    if (passwordForm.new_password.length < 8) {
      return 'Новый пароль должен содержать минимум 8 символов.';
    }

    if (passwordForm.new_password.includes(' ')) {
      return 'Новый пароль не должен содержать пробелы.';
    }

    if (!/[A-Za-zА-Яа-яЁё]/.test(passwordForm.new_password)) {
      return 'Новый пароль должен содержать хотя бы одну букву.';
    }

    if (!/\d/.test(passwordForm.new_password)) {
      return 'Новый пароль должен содержать хотя бы одну цифру.';
    }

    if (passwordForm.old_password === passwordForm.new_password) {
      return 'Новый пароль должен отличаться от старого.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    const validationError = validatePasswordForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      await changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });

      setPasswordForm(INITIAL_PASSWORD_FORM);
      setSuccess('Пароль успешно изменён.');
    } catch {
      setError('Не удалось изменить пароль. Проверьте старый пароль.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-section profile-page">
      <div className="container">
        <div className="page-head page-head--panel">
          <div>
            <p className="page-section__label">
              Личный кабинет
            </p>

            <h1 className="page-section__title">
              Профиль пользователя
            </h1>

            <p className="page-section__text">
              Просматривайте данные аккаунта и меняйте пароль для защиты профиля.
            </p>
          </div>
        </div>

        <div className="profile-layout">
          <aside className="profile-card">
            <div className="profile-card__avatar">
              {(user?.first_name || user?.login || 'U').slice(0, 1).toUpperCase()}
            </div>

            <h2 className="profile-card__name">
              {user?.first_name} {user?.last_name}
            </h2>

            <p className="profile-card__login">
              @{user?.login}
            </p>

            <div className="profile-card__status">
              {user?.is_active ? 'Аккаунт активен' : 'Аккаунт отключён'}
            </div>
          </aside>

          <div className="profile-panel">
            <div className="profile-info">
              <h2 className="profile-panel__title">
                Данные аккаунта
              </h2>

              <div className="profile-info__grid">
                <article className="profile-info__item">
                  <span>ID пользователя</span>
                  <strong>{user?.id}</strong>
                </article>

                <article className="profile-info__item">
                  <span>Логин</span>
                  <strong>{user?.login}</strong>
                </article>

                <article className="profile-info__item">
                  <span>Имя</span>
                  <strong>{user?.first_name}</strong>
                </article>

                <article className="profile-info__item">
                  <span>Фамилия</span>
                  <strong>{user?.last_name}</strong>
                </article>
              </div>
            </div>

            <form className="password-form" onSubmit={handleSubmit}>
              <h2 className="profile-panel__title">
                Смена пароля
              </h2>

              <p className="profile-panel__text">
                Новый пароль должен содержать минимум 8 символов, букву и цифру.
              </p>

              <Input
                label="Старый пароль"
                name="old_password"
                type="password"
                value={passwordForm.old_password}
                onChange={handleChange}
                placeholder="Введите старый пароль"
                autoComplete="current-password"
              />

              <Input
                label="Новый пароль"
                name="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={handleChange}
                placeholder="Например: newPassword123"
                autoComplete="new-password"
              />

              {error && (
                <p className="form__error">
                  {error}
                </p>
              )}

              {success && (
                <p className="form__success">
                  {success}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Изменить пароль'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}