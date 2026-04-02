import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { useRegister } from '../hooks/useRegister';
import { useTranslation } from '@/i18n';
import { Button } from '@/shared/Button';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const t = useTranslation();
  const { register, isLoading, error, isSuccess, registeredEmail } = useRegister();

  if (isSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            {t.auth.registerSuccess}
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
            <strong>{registeredEmail}</strong>
          </p>
          <p style={{ textAlign: 'center', color: 'var(--color-gray-600)', marginBottom: 'var(--space-6)' }}>
            이메일 인증을 완료한 후 로그인해주세요.
          </p>
          <Link to="/login">
            <Button variant="primary" style={{ width: '100%' }}>{t.auth.login}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <RegisterForm onSubmit={register} isLoading={isLoading} error={error} />
        <p className={styles.link}>{t.auth.hasAccount} <Link to="/login">{t.auth.login}</Link></p>
      </div>
    </div>
  );
}
