import { useQuery } from '@tanstack/react-query';
import { todosApi } from '@/api';

export function useTodoDetail(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todosApi.getTodoById(id),
    enabled: !!id,
  });
}
