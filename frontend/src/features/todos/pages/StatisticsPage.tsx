import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/shared/LoadingSpinner';
import { useTodoStatistics } from '../hooks/useTodoStatistics';
import { useTranslation } from '@/i18n';
import type { TodoStatus } from '@/types';
import pageStyles from './TodoPages.module.css';
import styles from './Statistics.module.css';

export function StatisticsPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useTodoStatistics();
  const t = useTranslation();

  const STATUS_LABELS: Record<TodoStatus, string> = {
    UPCOMING: t.filter.upcoming,
    IN_PROGRESS: t.filter.inProgress,
    OVERDUE: t.filter.overdue,
    COMPLETED_ON_TIME: t.filter.completedOnTime,
    COMPLETED_LATE: t.filter.completedLate,
  };

  if (isLoading) return <div className={pageStyles.page}><div className={pageStyles.container} style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div></div>;
  if (!stats) return null;

  const statusCards = (Object.entries(STATUS_LABELS) as [TodoStatus, string][]).map(([key, label]) => ({
    key, label, count: stats.by_status[key],
  }));

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.container}>
        <button className={pageStyles.backLink} onClick={() => navigate('/')}>{t.todo.backToList}</button>
        <h1 className={pageStyles.pageTitle}>{t.stats.title}</h1>

        <div className={styles.totalCard}>{t.stats.totalCount}: <strong>{stats.total}건</strong></div>

        <div className={styles.statusGrid}>
          {statusCards.map((card) => (
            <div key={card.key} className={`${styles.statCard} ${styles[card.key]}`}
              onClick={() => navigate(`/?status=${card.key}`)} role="button" tabIndex={0}>
              <div className={styles.statLabel}>{card.label}</div>
              <div className={styles.statCount}>{card.count}건</div>
            </div>
          ))}
        </div>

        <div className={styles.rateSection}>
          <div className={styles.rateCard}>
            <div className={styles.rateLabel}>{t.stats.completionRate}</div>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${stats.completion_rate}%` }} /></div>
            <div className={styles.rateValue}>{stats.completion_rate}%</div>
          </div>
          <div className={styles.rateCard}>
            <div className={styles.rateLabel}>{t.stats.onTimeRate}</div>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${stats.on_time_rate}%` }} /></div>
            <div className={styles.rateValue}>{stats.on_time_rate}%</div>
          </div>
        </div>

        <div className={styles.overdueCard}>{t.stats.overdueCount}: <strong>{stats.overdue_count}건</strong></div>
      </div>
    </div>
  );
}
