import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEn from './locales/en/common.json';
import commonZh from './locales/zh/common.json';

// --- Language Detection Logic ---
const getInitialLanguage = (): string => {
    // 1. Check LocalStorage
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'zh') return saved;

    // 2. Default to English (Ignore browser to force EN as requested default)
    return 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: commonEn },
            zh: { common: commonZh }
        },
        lng: getInitialLanguage(),
        fallbackLng: 'en',
        defaultNS: 'common',

        // Robustness Settings
        returnNull: false,
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

// Guaranteed Persistence
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('lang', lng);
});

export default i18n;
