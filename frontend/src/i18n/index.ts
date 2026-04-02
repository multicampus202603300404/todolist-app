import { ko, type Translations } from './ko';
import { en } from './en';
import { ja } from './ja';
import { zh } from './zh';
import { useI18nStore, type Locale } from '@/stores/i18nStore';

const translations: Record<Locale, Translations> = { ko, en, ja, zh };

export function useTranslation() {
  const locale = useI18nStore((s) => s.locale);
  return translations[locale];
}

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};
