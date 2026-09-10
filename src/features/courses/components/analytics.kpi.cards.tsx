// Thẻ chỉ số đo lường hiệu suất học tập (KPI Cards) trong tab phân tích học viên.
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
} from 'lucide-react'
import type { AnalyticsSummary } from '@/features/courses/hooks/use.course.analytics'

interface AnalyticsKpiCardsProps {
  analyticsSummary: AnalyticsSummary
}

export function AnalyticsKpiCards({ analyticsSummary }: AnalyticsKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>TỶ LỆ HOÀN THÀNH</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {analyticsSummary.completionRate}%
          </span>
          <span className="text-xs text-slate-400">
            ({analyticsSummary.completedCount}/{analyticsSummary.totalEnrolled} học viên)
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${analyticsSummary.completionRate}%` }}
          />
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>TỶ LỆ DỪNG LẠI SỚM</span>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {analyticsSummary.dropOffRate}%
          </span>
          <span className="text-xs text-slate-400">(Dưới 15% tiến độ)</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full"
            style={{ width: `${analyticsSummary.dropOffRate}%` }}
          />
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>TỶ LỆ ĐỖ BÀI THI CUỐI</span>
          <Award className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {analyticsSummary.finalPassRate}%
          </span>
          <span className="text-xs text-slate-400">
            (Điểm TB: {analyticsSummary.avgFinalScore}/100)
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${analyticsSummary.finalPassRate}%` }}
          />
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>MỨC TĂNG ĐIỂM TB</span>
          <TrendingUp className="w-4 h-4 text-violet-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
            +{analyticsSummary.avgGrowth}
          </span>
          <span className="text-xs text-slate-400">điểm sau khóa</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Đầu vào: <strong>{analyticsSummary.avgBaseline}</strong></span>
          <span>➔</span>
          <span>Kết khóa: <strong>{analyticsSummary.avgFinalScore}</strong></span>
        </div>
      </div>
    </div>
  )
}
