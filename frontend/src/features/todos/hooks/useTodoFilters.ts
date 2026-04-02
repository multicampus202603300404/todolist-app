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
    const next = new URLSearchParams();

    // status 변경 시 page를 1로 리셋
    const shouldResetPage = 'status' in updates || 'sort_by' in updates || 'order' in updates;
    const merged: TodoListParams = {
      ...filters,
      ...updates,
      page: shouldResetPage ? 1 : (updates.page || filters.page),
    };

    // undefined/null/빈 문자열이 아닌 값만 URL에 설정
    if (merged.status) next.set('status', merged.status);
    if (merged.sort_by && merged.sort_by !== 'created_at') next.set('sort_by', merged.sort_by);
    if (merged.order && merged.order !== 'desc') next.set('order', merged.order);
    if (merged.page && merged.page > 1) next.set('page', String(merged.page));
    if (merged.limit && merged.limit !== 20) next.set('limit', String(merged.limit));

    setSearchParams(next, { replace: true });
  };

  return { filters, setFilters };
}
