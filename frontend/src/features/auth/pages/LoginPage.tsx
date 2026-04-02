import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useTranslation } from '@/i18n';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <LoginForm />
        <p className={styles.link}>{t.auth.noAccount} <Link to="/register">{t.auth.register}</Link></p>
      </div>
    </div>
  );
}
