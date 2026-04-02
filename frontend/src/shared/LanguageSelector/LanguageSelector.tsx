import { useI18nStore, type Locale } from '@/stores/i18nStore';
import { LOCALE_LABELS } from '@/i18n';
import styles from './LanguageSelector.module.css';

export function LanguageSelector() {
  const { locale, setLocale } = useI18nStore();
  return (
    <select
      className={styles.select}
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Language"
    >
      {Object.entries(LOCALE_LABELS).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}
