import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Dialog.module.css';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
