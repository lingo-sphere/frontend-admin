import { useTranslation } from 'react-i18next'
import { PlaceholderPage } from '@/components/admin/PlaceholderPage'

export function PublicDecksPage() {
  const { t } = useTranslation()

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('page.publicDecks.title')}</h1>
          <p className="page-subtitle">{t('page.publicDecks.subtitle')}</p>
        </div>
      </div>
      <PlaceholderPage title={t('page.publicDecks.title')} />
    </main>
  )
}
