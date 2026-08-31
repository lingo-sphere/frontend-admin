import { Target, BarChart3 } from 'lucide-react'
import { toeicPartStats, toeicScoreOverview } from '@/data/statistics-data'

export function ProgressToeicAnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Phổ Điểm TOEIC Toàn Nền Tảng
            </h3>
          </div>

          <div className="space-y-3">
            {toeicScoreOverview.scoreDistribution.map((item, idx) => (
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
                    className="h-full bg-indigo-500 rounded-full"
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
            {toeicPartStats.map((part, idx) => (
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
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${part.avgAccuracyPercent}%` }}
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
