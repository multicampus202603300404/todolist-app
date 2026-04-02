import { useState, type FormEvent } from 'react';
import { Input } from '@/shared/Input';
import { Button } from '@/shared/Button';
import { useLogin } from '../hooks/useLogin';
import { useTranslation } from '@/i18n';
import styles from './AuthForm.module.css';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isLocked } = useLogin();
  const t = useTranslation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    login(email, password);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>{t.auth.login}</h1>

      <Input label={t.auth.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t.auth.emailPlaceholder} />
      <Input label={t.auth.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t.auth.passwordPlaceholder} />

      {error && <div className={`${styles.message} ${isLocked ? styles.locked : styles.error}`}>{error}</div>}

      <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLocked} className={styles.submitBtn}>{t.auth.login}</Button>
    </form>
  );
}
