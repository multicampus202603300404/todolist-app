import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, errorMessage, helperText, required, id, className, ...props }, ref) => {
    const inputId = id || label?.replace(/\s/g, '-').toLowerCase();
    return (
      <div className={`${styles.field} ${className || ''}`}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}{required && <span className={styles.required}> *</span>}</label>}
        <input ref={ref} id={inputId} className={`${styles.input} ${errorMessage ? styles.error : ''}`} required={required} {...props} />
        {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
        {!errorMessage && helperText && <p className={styles.helperText}>{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
