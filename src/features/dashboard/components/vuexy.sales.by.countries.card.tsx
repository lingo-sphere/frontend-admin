import { useDashboardLocale } from '@/features/dashboard/hooks/use.dashboard.locale'
// Component thẻ phân bổ học liệu theo 4 kỹ năng Sales by Countries theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Headphones, BookOpen, Mic, PenTool, Layers, Volume2 } from 'lucide-react'

interface VuexySalesByCountriesCardProps {
  totalWords: number
  publicDecksCount: number
  writingCount: number
  speakingCount: number
  listeningCount: number | null
  grammarPointsCount: number | null
  title?: string
  subtitle?: string
}

export function VuexySalesByCountriesCard({
  totalWords,
  publicDecksCount,
  writingCount,
  speakingCount,
  listeningCount,
  grammarPointsCount,
  title,
  subtitle,
}: VuexySalesByCountriesCardProps) {
  const { t } = useDashboardLocale()
  title ??= t('contentTitle')
  subtitle ??= t('contentSubtitle')

  const [showMenu, setShowMenu] = useState(false)

  const items = [
    {
      id: 'vocab',
      name: t('srsBank'),
      category: t('cefrVocabulary'),
      value: t('wordCount', { count: totalWords }),
      tag: t('platformWide'),
      icon: Layers,
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    },
    {
      id: 'decks',
      name: t('flashcardDecks'),
      category: t('communityDecks'),
      value: t('deckCount', { count: publicDecksCount }),
      tag: t('public'),
      icon: BookOpen,
      colorClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    },
    {
      id: 'writing',
      name: t('writingPractice'),
      category: t('writingDescription'),
      value: t('exerciseCount', { count: writingCount }),
      tag: t('practice'),
      icon: PenTool,
      colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    {
      id: 'speaking',
      name: t('speakingPractice'),
      category: t('speakingDescription'),
      value: t('exerciseCount', { count: speakingCount }),
      tag: t('practice'),
      icon: Mic,
      colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    },
    {
      id: 'listening',
      name: t('listeningPractice'),
      category: t('listeningDescription'),
      value: listeningCount === null ? '—' : t('exerciseCount', { count: listeningCount }),
      tag: t('practice'),
      icon: Headphones,
      colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    },
    {
      id: 'grammar',
      name: t('grammarBank'),
      category: t('grammarDescription'),
      value: grammarPointsCount === null ? '—' : t('topicCount', { count: grammarPointsCount }),
      tag: t('grammar'),
      icon: Volume2,
      colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    },
  ]

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{title}</h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label={t('options')}
            aria-expanded={showMenu}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-20 w-36 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-xs">
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                {t('refresh')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3.5 my-auto">
        {items.map((item) => {
          const IconComp = item.icon
          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.colorClass}`}>
                  <IconComp className="w-4 h-4" />
                </span>
                <div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.name}</h6>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <span title={item.value === '—' ? t('countUnavailable') : undefined} className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.value}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.tag}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
