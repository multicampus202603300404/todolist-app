import { useToastStore } from '@/stores/toastStore';
import styles from './Toast.module.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.variant]}`}>
          <span>{toast.message}</span>
          <button className={styles.close} onClick={() => removeToast(toast.id)} aria-label="닫기">&times;</button>
        </div>
      ))}
    </div>
  );
}
