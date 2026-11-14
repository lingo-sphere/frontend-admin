// Cấu hình quốc tế hóa i18next hỗ trợ đa ngôn ngữ cho ứng dụng Quản trị Admin.
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import practiceVi from '@/i18n/practice-editor.vi.json'
import practiceEn from '@/i18n/practice-editor.en.json'

import vi from '@/i18n/vi.json'
import en from '@/i18n/en.json'
import dashboardVi from '@/i18n/dashboard.vi.json'
import dashboardEn from '@/i18n/dashboard.en.json'

const resources = {
  vi: { translation: vi, practiceEditor: practiceVi, dashboard: dashboardVi },
  en: { translation: en, practiceEditor: practiceEn, dashboard: dashboardEn },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n

