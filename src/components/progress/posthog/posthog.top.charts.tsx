/**
 * @file posthog.top.charts.tsx
 * @description Charts displaying top triggered PostHog events and most viewed pages
 */

import { BarChart3, Eye } from 'lucide-react'
import type { PostHogAnalyticsData } from '@/types/api.types'

interface PostHogTopChartsProps {
  data: PostHogAnalyticsData | null
  isVi: boolean
}

export function PostHogTopCharts({ data, isVi }: PostHogTopChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isVi ? 'Top Sự Kiện Thực Hiện Nhiều Nhất' : 'Top Triggered Events'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">PostHog Live</span>
        </div>

        <div className="space-y-3">
          {(data?.top_events || []).map((ev, index) => {
            const maxCount = Math.max(...(data?.top_events?.map((e) => e.count) || [1]), 1)
            const percent = Math.min(100, Math.round((ev.count / maxCount) * 100))
            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{ev.label}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                    {ev.count} {isVi ? 'lần' : 'times'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isVi ? 'Top Trang Được Truy Cập Nhiều Nhất' : 'Most Viewed Pages'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Frontend Web</span>
        </div>

        <div className="space-y-3">
          {(data?.top_pages || []).map((pg, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-black text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {pg.path}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                <span className="text-teal-600 dark:text-teal-400 font-mono">
                  {pg.views} {isVi ? 'views' : 'views'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({pg.unique_visitors} {isVi ? 'người' : 'users'})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
