/**
 * @file PlaceholderPage.tsx
 * @description Component giao diện PlaceholderPage phục vụ khu vực Quản trị Admin
 */

import { useTranslation } from 'react-i18next'
import { FileQuestion } from 'lucide-react'

interface PlaceholderPageProps {
  title?: string
  subtitle?: string
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-slate-900/50 border border-slate-800/80">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">{title || t('placeholder.comingSoon')}</h2>
      <p className="text-xs text-slate-400 max-w-md">{subtitle || t('placeholder.description')}</p>
    </div>
  )
}
