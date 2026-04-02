import { useState, type FormEvent } from 'react';
import { Input } from '@/shared/Input';
import { Textarea } from '@/shared/Input';
import { Button } from '@/shared/Button';
import { useTranslation } from '@/i18n';
import type { TodoCreateInput } from '@/types';
import styles from './TodoForm.module.css';

interface TodoFormProps {
  initialData?: TodoCreateInput;
  onSubmit: (data: TodoCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TodoForm({ initialData, onSubmit, onCancel, isLoading, submitLabel }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(initialData?.start_date || '');
  const [endDate, setEndDate] = useState(initialData?.end_date || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const t = useTranslation();

  const resolvedSubmitLabel = submitLabel ?? t.todo.create;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = t.todo.titleRequired;
    if (title.length > 200) errs.title = t.todo.titleMaxLength;
    if (!startDate) errs.start_date = t.todo.startDateRequired;
    if (!endDate) errs.end_date = t.todo.endDateRequired;
    if (startDate && endDate && endDate < startDate) errs.end_date = t.todo.endDateAfterStart;
    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({ title: title.trim(), description: description.trim() || null, start_date: startDate, end_date: endDate });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input label={t.todo.title} value={title} onChange={(e) => setTitle(e.target.value)} required
        maxLength={200} placeholder={t.todo.titlePlaceholder} errorMessage={errors.title} />
      <div className={styles.count}>{title.length}/200</div>

      <Textarea label={t.todo.description} value={description} onChange={(e) => setDescription(e.target.value)}
        maxLength={2000} showCount placeholder={t.todo.descriptionPlaceholder} />

      <div className={styles.dateRow}>
        <Input label={t.todo.startDate} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
          required errorMessage={errors.start_date} />
        <Input label={t.todo.endDate} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
          required errorMessage={errors.end_date} />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>{t.common.cancel}</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>{resolvedSubmitLabel}</Button>
      </div>
    </form>
  );
}
