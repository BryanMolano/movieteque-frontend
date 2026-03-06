import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslation from './es.json';
import enTranslation from './en.json';

i18n
  .use(initReactI18next) // Conecta i18n con React
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation }
    },
    // Si quieres que dependa del navegador, puedes usar un plugin detector, 
    // pero por ahora lo forzamos a español (o inglés si falla)
    lng: 'es', 
    fallbackLng: 'en', // Idioma de respaldo
    interpolation: {
      escapeValue: false // React ya nos protege de inyecciones XSS
    }
  });

export default i18n;
