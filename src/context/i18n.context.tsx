import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { vi, Translations } from '@/locales/vi';
import { en } from '@/locales/en';

export type Language = 'vi' | 'en';
export type Theme = 'light' | 'dark' | 'system';

interface II18nContext {
    language: Language;
    theme: Theme;
    t: Translations;
    setLanguage: (lang: Language) => void;
    setTheme: (theme: Theme) => void;
    isDarkMode: boolean;
}

const I18nContext = createContext<II18nContext | null>(null);

const STORAGE_KEYS = {
    LANGUAGE: 'app_language',
    THEME: 'app_theme',
} as const;

const translations: Record<Language, Translations> = {
    vi,
    en,
};

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
        return (stored === 'vi' || stored === 'en') ? stored : 'vi';
    });

    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME);
        return (stored === 'light' || stored === 'dark' || stored === 'system')
            ? stored
            : 'light';
    });

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const updateDarkMode = () => {
            if (theme === 'dark') {
                setIsDarkMode(true);
            } else if (theme === 'light') {
                setIsDarkMode(false);
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDarkMode(prefersDark);
            }
        };

        updateDarkMode();

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    }, []);

    const value: II18nContext = {
        language,
        theme,
        t: translations[language],
        setLanguage,
        setTheme,
        isDarkMode,
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = (): II18nContext => {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error('useI18n must be used within <I18nProvider>');
    }

    return context;
};
