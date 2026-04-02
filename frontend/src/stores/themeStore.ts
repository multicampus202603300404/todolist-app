import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    set({ theme: next });
  },
}));
