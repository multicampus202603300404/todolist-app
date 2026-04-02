import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { useTranslation } from '@/i18n';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <RegisterForm />
        <p className={styles.link}>{t.auth.hasAccount} <Link to="/login">{t.auth.login}</Link></p>
      </div>
    </div>
  );
}
