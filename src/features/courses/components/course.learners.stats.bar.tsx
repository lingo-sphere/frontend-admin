/**
 * @file course.learners.stats.bar.tsx
 * @description Thanh hiển thị chỉ số tổng quan học viên và tiến độ trung bình.
 */

import { Users, Trophy } from 'lucide-react'

interface CourseLearnersStatsBarProps {
  isVi: boolean
  totalStudents: number
  avgProgress: number
}

export function CourseLearnersStatsBar({
  isVi,
  totalStudents,
  avgProgress,
}: CourseLearnersStatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isVi ? 'Tổng Học Viên' : 'Total Students'}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            {totalStudents}
          </span>
        </div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isVi ? 'Tiến Độ TB' : 'Avg Progress'}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            {avgProgress}%
          </span>
        </div>
      </div>

    </div>
  )
}
