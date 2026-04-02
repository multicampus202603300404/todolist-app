import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/shared/LoadingSpinner';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setToken = useAuthStore((s) => s.setToken);
  const [isChecking, setIsChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setIsChecking(false);
      return;
    }

    // 인터셉터를 거치지 않는 별도 axios로 refresh 시도 (무한 루프 방지)
    axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    )
      .then(({ data }) => {
        setToken(data.access_token);
      })
      .catch(() => {
        // refresh 실패 → 로그인 필요
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
