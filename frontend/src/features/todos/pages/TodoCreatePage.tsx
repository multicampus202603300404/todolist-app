import { useNavigate } from 'react-router-dom';
import { TodoForm } from '../components/TodoForm';
import { useTodoCreate } from '../hooks/useTodoCreate';
import { useTranslation } from '@/i18n';
import pageStyles from './TodoPages.module.css';

export function TodoCreatePage() {
  const navigate = useNavigate();
  const createMutation = useTodoCreate();
  const t = useTranslation();

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.container}>
        <button className={pageStyles.backLink} onClick={() => navigate('/')}>{t.todo.backToList}</button>
        <h1 className={pageStyles.pageTitle}>{t.todo.create}</h1>
        <div className={pageStyles.card}>
          <TodoForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => navigate('/')} isLoading={createMutation.isPending} />
        </div>
      </div>
    </div>
  );
}
