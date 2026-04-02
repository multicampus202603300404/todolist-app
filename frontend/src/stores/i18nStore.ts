import { create } from 'zustand';

export type Locale = 'ko' | 'en' | 'ja' | 'zh';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: (localStorage.getItem('locale') as Locale) || 'ko',
  setLocale: (locale) => {
    localStorage.setItem('locale', locale);
    set({ locale });
  },
}));
