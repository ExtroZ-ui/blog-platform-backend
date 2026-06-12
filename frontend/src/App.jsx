import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyArticlesPage } from './pages/MyArticlesPage';
import { MyCommentsPage } from './pages/MyCommentsPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';

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
          path="/dashboard/categories"
          element={(
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/dashboard/comments"
          element={(
            <ProtectedRoute>
              <MyCommentsPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/dashboard/profile"
          element={(
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}/>

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