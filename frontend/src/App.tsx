import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/app/queryClient';
import { AppRouter } from '@/app/Router';
import { ToastContainer } from '@/shared/Toast';
import { useThemeStore } from '@/stores/themeStore';

function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastContainer />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
