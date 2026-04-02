import { useState, type FormEvent } from 'react';
import { Input } from '@/shared/Input';
import { Button } from '@/shared/Button';
import { useRegister } from '../hooks/useRegister';
import { useTranslation } from '@/i18n';
import styles from './AuthForm.module.css';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error } = useRegister();
  const t = useTranslation();

  const PW_RULES = [
    { label: t.auth.pwRule8to20, test: (v: string) => v.length >= 8 && v.length <= 20 },
    { label: t.auth.pwRuleUpper, test: (v: string) => /[A-Z]/.test(v) },
    { label: t.auth.pwRuleLower, test: (v: string) => /[a-z]/.test(v) },
    { label: t.auth.pwRuleNumber, test: (v: string) => /[0-9]/.test(v) },
    { label: t.auth.pwRuleSpecial, test: (v: string) => /[!@#$%^&*]/.test(v) },
  ];

  const allRulesPassed = PW_RULES.every((r) => r.test(password));
  const passwordMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = email && allRulesPassed && passwordMatch;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    register(email, password);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>{t.auth.register}</h1>

      <Input label={t.auth.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t.auth.emailPlaceholder} errorMessage={error && error === t.auth.emailDuplicate ? error : undefined} />

      <Input label={t.auth.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t.auth.passwordPlaceholder} />

      <div className={styles.checklist}>
        {PW_RULES.map((rule) => (
          <div key={rule.label} className={`${styles.rule} ${rule.test(password) ? styles.passed : ''}`}>
            {rule.test(password) ? '✓' : '○'} {rule.label}
          </div>
        ))}
      </div>

      <Input label={t.auth.passwordConfirm} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder={t.auth.passwordConfirmPlaceholder} errorMessage={confirmPassword && !passwordMatch ? t.auth.passwordMismatch : undefined} />

      {error && error !== t.auth.emailDuplicate && <div className={`${styles.message} ${styles.error}`}>{error}</div>}

      <Button type="submit" variant="primary" isLoading={isLoading} disabled={!canSubmit} className={styles.submitBtn}>{t.auth.register}</Button>
    </form>
  );
}
