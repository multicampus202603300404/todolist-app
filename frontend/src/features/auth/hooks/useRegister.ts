import { useState } from 'react';
import { authApi } from '@/api';
import { useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/i18n';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const showToast = useToastStore((s) => s.showToast);
  const t = useTranslation();

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register({ email, password });
      setRegisteredEmail(email);
      setIsSuccess(true);
      showToast(t.auth.registerSuccess, 'success');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      if (axiosErr.response?.status === 409) {
        setError(t.auth.emailDuplicate);
      } else {
        setError(t.auth.registerFailed);
      }
      showToast(t.auth.registerFailed, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, isSuccess, registeredEmail };
}
