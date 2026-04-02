import { useThemeStore } from '@/stores/themeStore';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label="테마 전환"
      title={theme === 'light' ? '다크 모드' : '라이트 모드'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
