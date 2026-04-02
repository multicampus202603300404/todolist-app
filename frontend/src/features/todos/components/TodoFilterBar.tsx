import type { TodoStatus } from '@/types';
import { useTranslation } from '@/i18n';
import styles from './TodoList.module.css';

interface Props { current?: TodoStatus | ''; onChange: (status: TodoStatus | undefined) => void; }

export function TodoFilterBar({ current = '', onChange }: Props) {
  const t = useTranslation();

  const FILTERS: Array<{ label: string; value: TodoStatus | '' }> = [
    { label: t.filter.all, value: '' },
    { label: t.filter.upcoming, value: 'UPCOMING' },
    { label: t.filter.inProgress, value: 'IN_PROGRESS' },
    { label: t.filter.overdue, value: 'OVERDUE' },
    { label: t.filter.completedOnTime, value: 'COMPLETED_ON_TIME' },
    { label: t.filter.completedLate, value: 'COMPLETED_LATE' },
  ];

  return (
    <div className={styles.filterBar}>
      {FILTERS.map((f) => (
        <button key={f.value} className={`${styles.filterBtn} ${current === f.value ? styles.active : ''}`}
          onClick={() => onChange(f.value || undefined)}>{f.label}</button>
      ))}
    </div>
  );
}
