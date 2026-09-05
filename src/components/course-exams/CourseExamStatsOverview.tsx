/**
 * @file CourseExamStatsOverview.tsx
 * @description Component hiển thị các thẻ thống kê tổng quan bài thi (Tổng bài thi, Đang xuất bản, Lượt thi, Điểm trung bình)
 */

import { Layers, CheckCircle2, Users, Award } from 'lucide-react'

interface CourseExamStatsOverviewProps {
  stats: {
    total: number
    published: number
    totalAttempts: number
    avgScore: number
  }
  isVi: boolean
}

export function CourseExamStatsOverview({ stats, isVi }: CourseExamStatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isVi ? 'Tổng Bài Thi' : 'Total Exams'}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isVi ? 'Đang Xuất Bản' : 'Published'}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.published}</span>
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isVi ? 'Lượt Học Viên Thi' : 'Total Attempts'}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.totalAttempts}</span>
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isVi ? 'Điểm Trung Bình' : 'Avg Score'}
          </span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.avgScore}</span>
        </div>
      </div>
    </div>
  )
}
