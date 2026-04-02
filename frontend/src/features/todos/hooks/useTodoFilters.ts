import { useSearchParams } from 'react-router-dom';
import type { TodoListParams, TodoStatus } from '@/types';

export function useTodoFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TodoListParams = {
    status: (searchParams.get('status') as TodoStatus) || undefined,
    sort_by: (searchParams.get('sort_by') as TodoListParams['sort_by']) || 'created_at',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
  };

  const setFilters = (updates: Partial<TodoListParams>) => {
    const next = new URLSearchParams(searchParams);
    const merged = { ...filters, ...updates, page: updates.page || (updates.status !== undefined || updates.sort_by ? 1 : filters.page) };
    (Object.entries(merged) as [string, unknown][]).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') next.set(k, String(v));
      else next.delete(k);
    });
    setSearchParams(next, { replace: true });
  };

  return { filters, setFilters };
}
