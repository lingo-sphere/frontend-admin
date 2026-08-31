import { useTranslation } from 'react-i18next'
import { Shield, GraduationCap, CheckCircle, Lock } from 'lucide-react'
import type { AdminUserStats } from '@/helpers/admin-user.helper'

interface AdminUserStatsOverviewProps {
  stats: AdminUserStats
}

export function AdminUserStatsOverview({ stats }: AdminUserStatsOverviewProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Tổng Quản Trị & GV' : 'Total Admins & Teachers'}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <Shield className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Quản Trị Viên (Admin)' : 'Administrators'}
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.admins.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
          <Lock className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Giảng Viên Khóa Học' : 'Instructors'}
          </p>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {stats.teachers.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Đang Hoạt Động' : 'Active Accounts'}
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.active.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
