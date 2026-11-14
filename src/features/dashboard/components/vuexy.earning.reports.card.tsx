import { useDashboardLocale } from '@/features/dashboard/hooks/use.dashboard.locale'
// Component thẻ báo cáo hoạt động học tập & điểm kinh nghiệm Earning Reports theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, BookOpen, Layers, Award } from 'lucide-react'
import type { UserActivityLog } from '@/types/api.types'

interface VuexyEarningReportsCardProps {
  totalXp: number
  maxStreak?: number
  coursesCount: number
  examsCount: number
  publicDecksCount: number
  grammarPointsCount: number | null
  activities?: UserActivityLog[]
}

export function VuexyEarningReportsCard({
  totalXp,
  maxStreak = 0,
  coursesCount,
  examsCount,
  publicDecksCount,
  grammarPointsCount,
  activities = [],
}: VuexyEarningReportsCardProps) {
  const { t, locale } = useDashboardLocale()

  const [showMenu, setShowMenu] = useState(false)

  const dayLabels = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2026, 0, 5 + index)))
  const todayDayIndex = (new Date().getDay() + 6) % 7

  const dayCounts = [0, 0, 0, 0, 0, 0, 0]
  activities.forEach((act) => {
    if (act.timestamp) {
      const d = new Date(act.timestamp)
      const dayIdx = (d.getDay() + 6) % 7
      dayCounts[dayIdx] += 1
    }
  })

  const maxVal = Math.max(1, ...dayCounts)
  const daysData = dayLabels.map((day, idx) => ({
    day,
    value: Math.max(15, Math.round((dayCounts[idx] / maxVal) * 90)),
    realCount: dayCounts[idx],
    isToday: idx === todayDayIndex,
  }))

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
            {t('xpTitle')}
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('xpSubtitle')}
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {totalXp.toLocaleString(locale)} XP
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              {t('accumulated')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('longestStreak', { count: maxStreak })}
          </p>
        </div>

        <div className="md:col-span-7 flex items-end justify-between gap-2 h-36 px-2">
          {daysData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full max-w-[28px] h-full flex items-end bg-slate-50 dark:bg-slate-800/40 rounded-t-lg overflow-hidden">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    item.isToday
                      ? 'bg-indigo-600 shadow-sm shadow-indigo-500/30'
                      : 'bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200'
                  }`}
                  style={{ height: `${item.value}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-medium ${
                  item.isToday
                    ? 'font-bold text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 mt-5 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('coursesAndExams')}</span>
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
              {t('itemCount', { count: coursesCount + examsCount })}
            </h5>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div
                className="bg-indigo-600 h-1 rounded-full"
                style={{ width: `${Math.min(100, (coursesCount + examsCount) * 5)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('vocabularyDecks')}</span>
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
              {t('deckCount', { count: publicDecksCount })}
            </h5>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div
                className="bg-sky-500 h-1 rounded-full"
                style={{ width: `${Math.min(100, publicDecksCount / 3)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Award className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('grammarTopics')}</span>
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
              {grammarPointsCount === null ? '—' : t('topicCount', { count: grammarPointsCount })}
            </h5>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div
                className="bg-amber-500 h-1 rounded-full"
                style={{ width: `${Math.min(100, (grammarPointsCount ?? 0) * 2)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
