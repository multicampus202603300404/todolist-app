import { useQuery } from '@tanstack/react-query';
import { todosApi } from '@/api';
import type { TodoListParams } from '@/types';

export function useTodoList(params: TodoListParams) {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => todosApi.getTodos(params),
  });
}
