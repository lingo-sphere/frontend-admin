import { useDashboardLocale } from '@/features/dashboard/hooks/use.dashboard.locale'
// Component thẻ theo dõi chấm điểm và khảo thí Support Tracker theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Ticket, CheckCircle2, BookOpen } from 'lucide-react'

interface VuexySupportTrackerCardProps {
  toeicAttemptsCount: number
  examsCount: number
  coursesCount: number
}

export function VuexySupportTrackerCard({
  toeicAttemptsCount,
  examsCount,
  coursesCount,
}: VuexySupportTrackerCardProps) {
  const { t, locale } = useDashboardLocale()

  const [showMenu, setShowMenu] = useState(false)

  const readinessPercent = examsCount > 0 ? 100 : 0
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (readinessPercent / 100) * circumference * 0.75

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
            {t('assessmentTitle')}
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('assessmentSubtitle')}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-auto">
        <div className="md:col-span-5">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {toeicAttemptsCount.toLocaleString(locale)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('totalExamAttempts')}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Ticket className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('readyExams')}</p>
                <span className="text-[11px] text-slate-400">{examsCount} {t('toeicExamsUnit')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('completedCourses')}</p>
                <span className="text-[11px] text-slate-400">{coursesCount} {t('runningCoursesUnit')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('assessmentSystem')}</p>
                <span className="text-[11px] text-slate-400">{t('operatingNormally')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col items-center justify-center relative min-h-[200px]">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-135" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="none"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeLinecap="round"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-indigo-600 transition-all duration-1000 ease-out"
                strokeWidth="12"
                stroke="currentColor"
                fill="none"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">
                {t('ready')}
              </span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                {readinessPercent}%
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {t('fullyOperational')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
