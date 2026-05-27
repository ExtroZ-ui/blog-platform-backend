import { Link } from 'react-router-dom';

import { Button } from '../components/Button/Button';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="page-section">
      <div className="container">
        <p className="page-section__label">Личный кабинет</p>
        <h1 className="page-section__title">
          Здравствуйте, {user?.first_name || user?.login}
        </h1>
        <p className="page-section__text">
          Здесь можно управлять статьями, создавать новые материалы и смотреть статистику.
        </p>

        <div className="dashboard-actions">
          <Link to="/dashboard/articles">
            <Button size="large">Мои статьи</Button>
          </Link>

          <Link to="/editor">
            <Button variant="secondary" size="large">
              Создать статью
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}