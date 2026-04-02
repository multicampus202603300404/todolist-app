import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { todosApi } from '@/api';
import { useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/i18n';

export function useTodoDelete() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const t = useTranslation();

  return useMutation({
    mutationFn: (id: string) => todosApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      showToast(t.todo.deleteSuccess, 'success');
      navigate('/');
    },
    onError: () => { showToast(t.todo.deleteFailed, 'error'); },
  });
}
