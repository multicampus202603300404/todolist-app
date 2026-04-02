import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

// 페이지 컴포넌트 (FE-15~23에서 구현 예정, 일단 placeholder)
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { TodoListPage } from '@/features/todos/pages/TodoListPage';
import { TodoCreatePage } from '@/features/todos/pages/TodoCreatePage';
import { TodoDetailPage } from '@/features/todos/pages/TodoDetailPage';
import { TodoEditPage } from '@/features/todos/pages/TodoEditPage';
import { StatisticsPage } from '@/features/todos/pages/StatisticsPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TodoListPage />} />
          <Route path="/todos/new" element={<TodoCreatePage />} />
          <Route path="/todos/:id" element={<TodoDetailPage />} />
          <Route path="/todos/:id/edit" element={<TodoEditPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
