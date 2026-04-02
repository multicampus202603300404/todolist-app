import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/Button';
import { LoadingSpinner } from '@/shared/LoadingSpinner';
import { EmptyState } from '@/shared/EmptyState';
import { ThemeToggle } from '@/shared/ThemeToggle';
import { LanguageSelector } from '@/shared/LanguageSelector';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api';
import { useTranslation } from '@/i18n';
import { useTodoList } from '../hooks/useTodoList';
import { useTodoFilters } from '../hooks/useTodoFilters';
import { TodoFilterBar } from '../components/TodoFilterBar';
import { TodoSortControl } from '../components/TodoSortControl';
import { TodoListItem } from '../components/TodoListItem';
import { TodoPagination } from '../components/TodoPagination';
import type { TodoListParams } from '@/types';
import styles from '../components/TodoList.module.css';
import pageStyles from './TodoPages.module.css';

export function TodoListPage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const t = useTranslation();
  const { filters, setFilters } = useTodoFilters();
  const { data, isLoading } = useTodoList(filters);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>{t.todo.list}</h1>
          <div className={styles.headerActions}>
            <LanguageSelector />
            <ThemeToggle />
            <Button size="sm" variant="ghost" onClick={() => navigate('/profile')}>{t.common.profile}</Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/statistics')}>{t.common.statistics}</Button>
            <Button size="sm" variant="ghost" onClick={handleLogout}>{t.common.logout}</Button>
          </div>
        </div>

        <TodoFilterBar current={filters.status || ''} onChange={(status) => setFilters({ status })} />
        <TodoSortControl sortBy={filters.sort_by || 'created_at'} order={filters.order || 'desc'}
          onChange={(sort_by, order) => setFilters({ sort_by: sort_by as TodoListParams['sort_by'], order: order as 'asc' | 'desc' })} />

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>
        ) : !data?.data.length ? (
          <EmptyState title={t.todo.emptyTitle} description={t.todo.emptyDescription}
            action={<Button onClick={() => navigate('/todos/new')}>{t.todo.addTodo}</Button>} />
        ) : (
          <>
            <div className={styles.list}>
              {data.data.map((todo) => <TodoListItem key={todo.id} todo={todo} />)}
            </div>
            <TodoPagination page={data.pagination.page} totalPages={data.pagination.totalPages}
              onChange={(page) => setFilters({ page })} />
          </>
        )}

        {data?.data.length ? (
          <div style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
            <Button onClick={() => navigate('/todos/new')}>+ 할일 추가</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
