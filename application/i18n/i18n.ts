import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';


i18n.use(initReactI18next).init({
 
  lng: 'en', 
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
   
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;