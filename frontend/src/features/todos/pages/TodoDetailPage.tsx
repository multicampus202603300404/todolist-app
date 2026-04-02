import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '@/api';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/shared/Button';
import { ConfirmDialog } from '@/shared/Dialog';
import { LoadingSpinner } from '@/shared/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { useTodoDetail } from '../hooks/useTodoDetail';
import { useTodoDelete } from '../hooks/useTodoDelete';
import { useTranslation } from '@/i18n';
import pageStyles from './TodoPages.module.css';
import styles from './TodoDetail.module.css';

export function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const { data: todo, isLoading, error } = useTodoDetail(id!);
  const deleteMutation = useTodoDelete();
  const t = useTranslation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const completeMutation = useMutation({
    mutationFn: () => todo!.is_completed ? todosApi.uncompleteTodo(todo!.id) : todosApi.completeTodo(todo!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      showToast(todo!.is_completed ? t.todo.uncompleteSuccess : t.todo.completeSuccess, 'success');
    },
    onError: () => { showToast(t.todo.actionFailed, 'error'); },
  });

  if (isLoading) return <div className={pageStyles.page}><div className={pageStyles.container} style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div></div>;
  if (error || !todo) { navigate('/'); return null; }

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.container}>
        <button className={pageStyles.backLink} onClick={() => navigate('/')}>{t.todo.backToList}</button>
        <div className={pageStyles.card}>
          <StatusBadge status={todo.status} />
          <h1 className={styles.title}>{todo.title}</h1>
          {todo.description && <p className={styles.description}>{todo.description}</p>}

          <div className={styles.meta}>
            <div><span className={styles.label}>{t.todo.period}</span> {todo.start_date} ~ {todo.end_date}</div>
            <div><span className={styles.label}>{t.todo.completedAt}</span> {todo.completed_at ? new Date(todo.completed_at).toLocaleString('ko-KR') : '-'}</div>
            <div><span className={styles.label}>{t.todo.createdAt}</span> {new Date(todo.created_at).toLocaleString('ko-KR')}</div>
            <div><span className={styles.label}>{t.todo.updatedAt}</span> {new Date(todo.updated_at).toLocaleString('ko-KR')}</div>
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => navigate(`/todos/${todo.id}/edit`)}>{t.common.edit}</Button>
            <Button variant={todo.is_completed ? 'secondary' : 'primary'} onClick={() => setShowCompleteDialog(true)}>
              {todo.is_completed ? t.todo.uncomplete : t.todo.complete}
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>{t.common.delete}</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog isOpen={showCompleteDialog} title={todo.is_completed ? t.todo.confirmUncomplete : t.todo.confirmComplete}
        description={todo.status === 'OVERDUE' ? t.todo.overdueWarning : undefined}
        confirmLabel={t.common.confirm} onConfirm={() => { completeMutation.mutate(); setShowCompleteDialog(false); }}
        onCancel={() => setShowCompleteDialog(false)} />

      <ConfirmDialog isOpen={showDeleteDialog} title={t.todo.confirmDelete}
        description={t.todo.deleteWarning} confirmLabel={t.common.delete} variant="danger"
        onConfirm={() => { deleteMutation.mutate(todo.id); setShowDeleteDialog(false); }}
        onCancel={() => setShowDeleteDialog(false)} />
    </div>
  );
}
