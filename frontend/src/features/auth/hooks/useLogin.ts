import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/i18n';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const showToast = useToastStore((s) => s.showToast);
  const t = useTranslation();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      setToken(data.access_token);
      showToast(t.auth.loginSuccess, 'success');
      navigate('/');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      if (axiosErr.response?.status === 423) {
        setIsLocked(true);
        setError(t.auth.accountLocked);
      } else {
        setError(t.auth.loginFailed);
        showToast(t.auth.loginFailed, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error, isLocked };
}
