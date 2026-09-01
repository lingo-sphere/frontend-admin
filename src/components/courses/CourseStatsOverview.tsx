/**
 * @file CourseStatsOverview.tsx
 * @description Component giao diện CourseStatsOverview phục vụ khu vực Quản trị Admin
 */

import { useTranslation } from 'react-i18next'
import { GraduationCap, Users, CheckCircle2, Sparkles } from 'lucide-react'

interface CourseStatsOverviewProps {
  stats: {
    total: number
    published: number
    totalStudents: number
    targetBand: string
  }
}

export function CourseStatsOverview({ stats }: CourseStatsOverviewProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVi ? 'Tổng Khóa Học' : 'Total Courses'}
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVi ? 'Tổng Học Viên' : 'Total Learners'}
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalStudents.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVi ? 'Đang Phát Hành' : 'Published Courses'}
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.published}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVi ? 'Mục Tiêu TOEIC' : 'Target Band'}
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{stats.targetBand}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
