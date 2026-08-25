import { useTranslation } from 'react-i18next'
import { FileQuestion } from 'lucide-react'

interface PlaceholderPageProps {
  title?: string
  subtitle?: string
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  const { t } = useTranslation()

  return (
    <div className="placeholder-page">
      <FileQuestion className="placeholder-icon" />
      <h2 className="placeholder-title">{title || t('placeholder.comingSoon')}</h2>
      <p className="placeholder-subtitle">{subtitle || t('placeholder.description')}</p>
    </div>
  )
}
