import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('zh') ? 'en' : 'zh';
        i18n.changeLanguage(newLang);
        localStorage.setItem('lang', newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="btn-text"
            title="Switch Language"
            aria-label="Switch Language"
        >
            <Globe size={18} />
            <span>{i18n.language.startsWith('zh') ? '中文' : 'EN'}</span>
        </button>
    );
};
