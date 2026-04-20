import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'vi' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY_LANGUAGE = '@carenest_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from storage on app start
  useEffect(() => {
    async function loadLanguage() {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY_LANGUAGE);
        if (savedLanguage === 'en' || savedLanguage === 'vi') {
          setLanguageState(savedLanguage);
        }
      } catch {
        // Default to Vietnamese
      } finally {
        setIsInitialized(true);
      }
    }

    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    } catch (error) {
      console.error('[LanguageContext] Failed to set language:', error);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: (key: string) => key }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
