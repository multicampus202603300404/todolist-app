import { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', isLoading = false, disabled, children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} aria-label="로딩 중" /> : children}
    </button>
  );
}
