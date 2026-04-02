import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/i18n';
import { Input } from '@/shared/Input';
import { Button } from '@/shared/Button';
import { ThemeToggle } from '@/shared/ThemeToggle';
import { LanguageSelector } from '@/shared/LanguageSelector';
import pageStyles from '../../todos/pages/TodoPages.module.css';
import styles from './AuthPage.module.css';

export function ProfilePage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi.getProfile().then((data) => {
      setEmail(data.email);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const updateData: { email?: string; current_password?: string; new_password?: string } = {};
      if (email !== user?.email) updateData.email = email;
      if (newPassword) {
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
      }
      if (Object.keys(updateData).length === 0) {
        showToast(t.auth.profileUpdateSuccess, 'info');
        return;
      }
      const updated = await authApi.updateProfile(updateData);
      setUser({ id: updated.id, email: updated.email });
      setCurrentPassword('');
      setNewPassword('');
      showToast(t.auth.profileUpdateSuccess, 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: { code?: string } } } };
      if (axiosErr.response?.status === 409) setError(t.auth.emailDuplicate);
      else if (axiosErr.response?.status === 401) setError(t.auth.currentPasswordWrong);
      else setError(t.auth.profileUpdateFailed);
      showToast(t.auth.profileUpdateFailed, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.container}>
        <button className={pageStyles.backLink} onClick={() => navigate('/')}>{t.todo.backToList}</button>
        <div className={styles.card} style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)', textAlign: 'center' }}>
            {t.auth.profileUpdate}
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input label={t.auth.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 'var(--space-2) 0' }} />

            <Input
              label={t.auth.currentPassword}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t.auth.currentPasswordRequired}
            />
            <Input
              label={t.auth.newPassword}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
            />

            {error && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}>
                {error}
              </div>
            )}

            <Button type="submit" isLoading={isLoading} style={{ width: '100%' }}>{t.common.save}</Button>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 'var(--space-6) 0 var(--space-4)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>{t.common.language}</span>
            <LanguageSelector />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>{t.common.darkMode}</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
