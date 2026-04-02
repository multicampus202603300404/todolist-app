import { forwardRef, type TextareaHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, errorMessage, helperText, required, showCount, maxLength, value, id, className, ...props }, ref) => {
    const inputId = id || label?.replace(/\s/g, '-').toLowerCase();
    const currentLength = typeof value === 'string' ? value.length : 0;
    return (
      <div className={`${styles.field} ${className || ''}`}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}{required && <span className={styles.required}> *</span>}</label>}
        <textarea ref={ref} id={inputId} className={`${styles.textarea} ${errorMessage ? styles.error : ''}`} maxLength={maxLength} value={value} required={required} {...props} />
        <div className={styles.meta}>
          {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
          {!errorMessage && helperText && <p className={styles.helperText}>{helperText}</p>}
          {showCount && maxLength && <span className={styles.count}>{currentLength}/{maxLength}</span>}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
