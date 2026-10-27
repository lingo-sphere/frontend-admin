// Thẻ số liệu thống kê quản trị SaaS với dải màu viền và biểu đồ sóng mini theo phong cách hiện đại.
import { useId, type ComponentType } from 'react'
import { StatCardSkeleton } from '@/components/skeleton'

export type StatCardColor = 'emerald' | 'teal' | 'blue' | 'amber' | 'purple' | 'indigo' | 'rose'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ComponentType<{ className?: string }>
  trend?: string
  trendType?: 'up' | 'down' | 'neutral'
  color?: StatCardColor
  sparklineData?: number[]
  className?: string
  onClick?: () => void
  loading?: boolean
}

const colorStyles: Record<
  StatCardColor,
  {
    strip: string
    iconBg: string
    stroke: string
    fillStart: string
    fillEnd: string
  }
> = {
  emerald: {
    strip: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
    stroke: '#10b981',
    fillStart: 'rgba(16, 185, 129, 0.22)',
    fillEnd: 'rgba(16, 185, 129, 0.01)',
  },
  teal: {
    strip: 'bg-teal-500',
    iconBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60',
    stroke: '#14b8a6',
    fillStart: 'rgba(20, 184, 166, 0.22)',
    fillEnd: 'rgba(20, 184, 166, 0.01)',
  },
  blue: {
    strip: 'bg-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60',
    stroke: '#3b82f6',
    fillStart: 'rgba(59, 130, 246, 0.22)',
    fillEnd: 'rgba(59, 130, 246, 0.01)',
  },
  amber: {
    strip: 'bg-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60',
    stroke: '#f59e0b',
    fillStart: 'rgba(245, 158, 11, 0.22)',
    fillEnd: 'rgba(245, 158, 11, 0.01)',
  },
  purple: {
    strip: 'bg-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60',
    stroke: '#a855f7',
    fillStart: 'rgba(168, 85, 247, 0.22)',
    fillEnd: 'rgba(168, 85, 247, 0.01)',
  },
  indigo: {
    strip: 'bg-indigo-500',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60',
    stroke: '#6366f1',
    fillStart: 'rgba(99, 102, 241, 0.22)',
    fillEnd: 'rgba(99, 102, 241, 0.01)',
  },
  rose: {
    strip: 'bg-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60',
    stroke: '#f43f5e',
    fillStart: 'rgba(244, 63, 94, 0.22)',
    fillEnd: 'rgba(244, 63, 94, 0.01)',
  },
}

function buildSvgPaths(data: number[] | undefined, width = 300, height = 36) {
  if (!data || data.length < 2) {
    const linePath = `M 0,26 C 50,22 100,28 150,24 C 200,20 250,26 300,23`
    const areaPath = `${linePath} L 300,${height} L 0,${height} Z`
    return { linePath, areaPath }
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const paddingY = 6
  const usableH = height - paddingY * 2

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width
    const y = height - paddingY - ((val - min) / range) * usableH
    return { x, y }
  })

  let linePath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const cx = ((p0.x + p1.x) / 2).toFixed(1)
    linePath += ` C ${cx},${p0.y.toFixed(1)} ${cx},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
  }

  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`
  return { linePath, areaPath }
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up',
  color = 'blue',
  sparklineData,
  className = '',
  onClick,
  loading = false,
}: StatCardProps) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '')

  if (loading) {
    return <StatCardSkeleton />
  }

  const c = colorStyles[color] || colorStyles.blue
  const gradientId = `stat-grad-${color}-${reactId}`
  const { linePath, areaPath } = buildSvgPaths(sparklineData)

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.strip} rounded-l-2xl z-20`} />

      <div className="p-4 sm:p-4.5 pl-5 sm:pl-5 relative z-10 flex flex-col justify-between flex-1">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate tracking-tight">
              {title}
            </span>
          </div>

          {trend && (
            <div
              className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                trendType === 'up'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                  : trendType === 'down'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{trendType === 'up' ? '▲' : trendType === 'down' ? '▼' : '•'}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>

        <div className="mt-1">
          <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11.5px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="relative w-full h-8 sm:h-9 overflow-hidden pointer-events-none mt-1">
        <svg
          viewBox="0 0 300 36"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.fillStart} />
              <stop offset="100%" stopColor={c.fillEnd} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={c.stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
