import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps { size?: 'sm' | 'md' | 'lg'; }

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return <div className={`${styles.spinner} ${styles[size]}`} role="status" aria-label="로딩 중" />;
}
