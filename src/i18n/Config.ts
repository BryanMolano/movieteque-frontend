import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslation from './es.json';
import enTranslation from './en.json';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation }
    },
    fallbackLng: 'en',
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: [] 
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
