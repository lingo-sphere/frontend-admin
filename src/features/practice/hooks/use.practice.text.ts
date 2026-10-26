import i18n from '@/i18n/i18n'
import { useTranslation } from 'react-i18next'

/** Source text keys keep shared editor labels in one dedicated i18next namespace. */
export function usePracticeText() {
  const { t } = useTranslation('practiceEditor')
  return (source: string, values?: Record<string, unknown>) => {
    const key = source.trim().replace(/\s+/g, ' ')
    return source.replace(source.trim(), () => t(key, { ...values, keySeparator: false, nsSeparator: false, defaultValue: key }))
  }
}

export function localizedPracticeName(row: { name_vi?: string; name_en?: string; name?: string; code?: string }) {
  return i18n.language.startsWith('vi') ? row.name_vi || row.name_en || row.name || row.code || '' : row.name_en || row.name || row.name_vi || row.code || ''
}
