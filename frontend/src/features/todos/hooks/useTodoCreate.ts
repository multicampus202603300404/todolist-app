import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { todosApi } from '@/api';
import { useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/i18n';
import type { TodoCreateInput } from '@/types';

export function useTodoCreate() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const t = useTranslation();

  return useMutation({
    mutationFn: (data: TodoCreateInput) => todosApi.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      showToast(t.todo.createSuccess, 'success');
      navigate('/');
    },
    onError: () => { showToast(t.todo.createFailed, 'error'); },
  });
}
