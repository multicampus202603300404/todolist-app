import styles from './TodoList.module.css';

interface Props { page: number; totalPages: number; onChange: (page: number) => void; }

export function TodoPagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className={styles.pagination}>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>&lt;</button>
      {pages.map((p) => (
        <button key={p} className={page === p ? styles.activePage : ''} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>&gt;</button>
    </div>
  );
}
