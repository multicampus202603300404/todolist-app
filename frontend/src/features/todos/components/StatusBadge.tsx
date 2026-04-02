import type { TodoStatus } from '@/types';
import { useTranslation } from '@/i18n';
import styles from './StatusBadge.module.css';

export function StatusBadge({ status }: { status: TodoStatus }) {
  const t = useTranslation();

  const STATUS_LABELS: Record<TodoStatus, string> = {
    UPCOMING: t.filter.upcoming,
    IN_PROGRESS: t.filter.inProgress,
    OVERDUE: t.filter.overdue,
    COMPLETED_ON_TIME: t.filter.completedOnTime,
    COMPLETED_LATE: t.filter.completedLate,
  };

  return <span className={`${styles.badge} ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}
