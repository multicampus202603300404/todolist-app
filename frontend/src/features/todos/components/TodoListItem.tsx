import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '@/api';
import { useToastStore } from '@/stores/toastStore';
import { StatusBadge } from './StatusBadge';
import type { TodoListItem as TodoListItemType } from '@/types';
import styles from './TodoList.module.css';

export function TodoListItem({ todo }: { todo: TodoListItemType }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  const toggleComplete = useMutation({
    mutationFn: () => todo.is_completed ? todosApi.uncompleteTodo(todo.id) : todosApi.completeTodo(todo.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['todos'] }); },
    onError: () => { showToast('요청에 실패했습니다. 다시 시도해주세요', 'error'); },
  });

  return (
    <div className={styles.item} onClick={() => navigate(`/todos/${todo.id}`)}>
      <input type="checkbox" checked={todo.is_completed} className={styles.checkbox}
        onChange={(e) => { e.stopPropagation(); toggleComplete.mutate(); }}
        onClick={(e) => e.stopPropagation()} />
      <div className={styles.itemContent}>
        <span className={`${styles.itemTitle} ${todo.is_completed ? styles.completed : ''}`}>{todo.title}</span>
        <span className={styles.itemDate}>{todo.start_date} ~ {todo.end_date}</span>
      </div>
      <StatusBadge status={todo.status} />
    </div>
  );
}
