import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { ArticlePage } from './pages/ArticlePage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyArticlesPage } from './pages/MyArticlesPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles/:articleId" element={<ArticlePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/dashboard/articles"
          element={(
            <ProtectedRoute>
              <MyArticlesPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/editor"
          element={(
            <ProtectedRoute>
              <ArticleEditorPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/editor/:articleId"
          element={(
            <ProtectedRoute>
              <ArticleEditorPage />
            </ProtectedRoute>
          )}
        />
      </Route>
    </Routes>
  );
}

export default App;