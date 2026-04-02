import { Dialog } from './Dialog';
import { Button } from '@/shared/Button';
import styles from './Dialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, description, confirmLabel = '확인', cancelLabel = '취소', variant = 'primary', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onCancel}>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Dialog>
  );
}
