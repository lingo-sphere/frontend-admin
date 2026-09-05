/**
 * @file progress.toeic.analytics.tab.tsx
 * @description Component giao diện ProgressToeicAnalyticsTab hiển thị phổ điểm và tỉ lệ đúng 7 Part ETS từ Backend API
 */

import { Target, BarChart3, RefreshCw, Award } from 'lucide-react'
import { usePlatformAnalytics } from '@/hooks/use.platform.analytics'

export function ProgressToeicAnalyticsTab() {
  const { toeicData, isLoadingToeic, refetchToeic } = usePlatformAnalytics()

  if (isLoadingToeic && !toeicData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/60 p-6" />
        <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/60 p-6" />
      </div>
    )
  }

  const scoreDistribution = toeicData?.scoreDistribution || []
  const partStats = toeicData?.partStats || []
  const overview = toeicData?.overview

  return (
    <div className="space-y-6">
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Điểm TB Toàn Hệ Thống
            </span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {overview.averageTotalScore}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">/ 990</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              TB Listening
            </span>
            <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
              {overview.averageListeningScore}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">/ 495</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              TB Reading
            </span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {overview.averageReadingScore}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">/ 495</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Tổng Lượt Nộp Bài
              </span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                {overview.totalExamAttempts.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => refetchToeic()}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Làm mới thống kê"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Phổ Điểm TOEIC Toàn Nền Tảng
              </h3>
            </div>
            {overview?.highestScoreRecord && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                <Award size={13} />
                Max: {overview.highestScoreRecord}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {scoreDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.range}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {item.count} học viên ({item.percent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Tỉ Lệ Làm Đúng Theo Từng Part (ETS 7 Parts)
            </h3>
          </div>

          <div className="space-y-3">
            {partStats.map((part, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {part.partNameVi}
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                    {part.avgAccuracyPercent}% đúng
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, part.avgAccuracyPercent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
