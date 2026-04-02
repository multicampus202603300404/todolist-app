import { useQuery } from '@tanstack/react-query';
import { todosApi } from '@/api';

export function useTodoStatistics() {
  return useQuery({
    queryKey: ['todos', 'statistics'],
    queryFn: () => todosApi.getStatistics(),
    staleTime: 60 * 1000, // 1분
  });
}
