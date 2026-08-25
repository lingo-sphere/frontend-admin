// Updated: 2026-08-22
// Community page - Cộng đồng

import { useTranslation } from 'react-i18next'
import { PlaceholderPage } from '@/components/admin/PlaceholderPage'

export function CommunityPage() {
  const { t } = useTranslation()

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('page.community.title')}</h1>
          <p className="page-subtitle">{t('page.community.subtitle')}</p>
        </div>
      </div>
      <PlaceholderPage title={t('page.community.title')} />
    </main>
  )
}
