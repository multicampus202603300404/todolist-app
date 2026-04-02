import { useTranslation } from '@/i18n';
import styles from './TodoList.module.css';

interface Props { sortBy: string; order: string; onChange: (sortBy: string, order: string) => void; }

export function TodoSortControl({ sortBy, order, onChange }: Props) {
  const t = useTranslation();

  const SORT_OPTIONS = [
    { label: t.sort.createdAt, value: 'created_at' },
    { label: t.sort.endDate, value: 'end_date' },
    { label: t.sort.startDate, value: 'start_date' },
    { label: t.sort.title, value: 'title' },
  ];

  return (
    <div className={styles.sortControl}>
      <select value={sortBy} onChange={(e) => onChange(e.target.value, order)}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={order} onChange={(e) => onChange(sortBy, e.target.value)}>
        <option value="desc">{t.sort.desc}</option>
        <option value="asc">{t.sort.asc}</option>
      </select>
    </div>
  );
}
