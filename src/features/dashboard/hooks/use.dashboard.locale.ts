import { useTranslation } from 'react-i18next'

export function useDashboardLocale() {
  const { t, i18n } = useTranslation('dashboard')
  const isVietnamese = (i18n.resolvedLanguage || i18n.language).startsWith('vi')
  const locale = isVietnamese ? 'vi-VN' : 'en-US'
  const money = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
  return { t, locale, money, isVietnamese }
}
