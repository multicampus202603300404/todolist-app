import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { todosApi } from '@/api';
import { useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/i18n';
import type { TodoUpdateInput } from '@/types';

export function useTodoUpdate(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const t = useTranslation();

  return useMutation({
    mutationFn: (data: TodoUpdateInput) => todosApi.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      showToast(t.todo.updateSuccess, 'success');
      navigate(`/todos/${id}`);
    },
    onError: () => { showToast(t.todo.updateFailed, 'error'); },
  });
}
