// Updated: 2026-08-22
// Practice & TOEIC page

import { useTranslation } from 'react-i18next'
import { PlaceholderPage } from '@/components/admin/PlaceholderPage'

export function PracticePage() {
  const { t } = useTranslation()

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            PRACTICE & ASSESSMENT
          </div>
          <h1 className="page-title">{t('page.practice.title')}</h1>
          <p className="page-subtitle">{t('page.practice.subtitle')}</p>
        </div>
      </div>
      <PlaceholderPage title={t('page.practice.title')} />
    </main>
  )
}
