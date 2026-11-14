import { useDashboardLocale } from '@/features/dashboard/hooks/use.dashboard.locale'
// Component thẻ thống kê tương tác hàng ngày Average Daily Sales theo phong cách Vuexy Admin.

interface VuexyDailySalesCardProps {
  totalCount: number
  totalUsers?: number
  subtitle?: string
  title?: string
  badgeText?: string
}

export function VuexyDailySalesCard({
  totalCount,
  totalUsers = 0,
  subtitle,
  title,
  badgeText,
}: VuexyDailySalesCardProps) {
  const { t, locale } = useDashboardLocale()
  subtitle ??= t('dailySubtitle')
  title ??= t('dailyTitle')
  badgeText ??= t('today')

  const percentage = totalUsers > 0 ? Math.round((totalCount / totalUsers) * 100) : 0
  const activeY = totalCount > 0 ? 30 : 85

  const points = [
    { x: 0, y: 75 },
    { x: 40, y: 70 },
    { x: 80, y: 65 },
    { x: 130, y: 55 },
    { x: 180, y: 60 },
    { x: 230, y: activeY },
    { x: 280, y: activeY },
  ]

  const pathD = `M 0,${points[0].y} ` + points.slice(1).map((p) => `L ${p.x},${p.y}`).join(' ')
  const areaD = `${pathD} L 280,105 L 0,105 Z`

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h5>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            {badgeText}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{subtitle}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {totalCount.toLocaleString(locale)}
          </h4>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            / {totalUsers.toLocaleString(locale)} {t('learnersUnit')} ({percentage}%)
          </span>
        </div>
      </div>

      <div className="relative w-full h-[95px] overflow-hidden mt-3">
        <svg viewBox="0 0 280 105" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vuexyGreenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#28c76f" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#28c76f" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#vuexyGreenGradient)" />
          <path d={pathD} fill="none" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
