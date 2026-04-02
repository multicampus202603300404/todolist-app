import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/shared/LoadingSpinner';
import { TodoForm } from '../components/TodoForm';
import { useTodoDetail } from '../hooks/useTodoDetail';
import { useTodoUpdate } from '../hooks/useTodoUpdate';
import { useTranslation } from '@/i18n';
import pageStyles from './TodoPages.module.css';

export function TodoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: todo, isLoading } = useTodoDetail(id!);
  const updateMutation = useTodoUpdate(id!);
  const t = useTranslation();

  if (isLoading) return <div className={pageStyles.page}><div className={pageStyles.container} style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div></div>;
  if (!todo) { navigate('/'); return null; }

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.container}>
        <button className={pageStyles.backLink} onClick={() => navigate(`/todos/${id}`)}>{t.todo.backToDetail}</button>
        <h1 className={pageStyles.pageTitle}>{t.todo.editTodo}</h1>
        <div className={pageStyles.card}>
          <TodoForm initialData={{ title: todo.title, description: todo.description, start_date: todo.start_date, end_date: todo.end_date }}
            onSubmit={(data) => updateMutation.mutate(data)} onCancel={() => navigate(`/todos/${id}`)}
            isLoading={updateMutation.isPending} submitLabel={t.common.save} />
        </div>
      </div>
    </div>
  );
}
