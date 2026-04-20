import { useLanguage } from '../context/LanguageContext';
import { translations, type TranslationKey } from '../utils/translations';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return { t, language };
}
