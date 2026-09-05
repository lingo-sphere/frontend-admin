/**
 * @file learner.stats.overview.tsx
 * @description Component giao diện LearnerStatsOverview phục vụ khu vực Quản trị Admin
 */

import { useTranslation } from 'react-i18next'
import { Users, CheckCircle, Crown, Ban } from 'lucide-react'
import type { LearnerStats } from '@/helpers/learner.helper'

interface LearnerStatsOverviewProps {
  stats: LearnerStats
}

export function LearnerStatsOverview({ stats }: LearnerStatsOverviewProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Tổng Học Viên' : 'Total Learners'}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Đang Hoạt Động' : 'Active Learners'}
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.active.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Gói Premium / VIP' : 'Premium / VIP'}
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.premium.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
          <Crown className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Tài Khoản Bị Khóa' : 'Banned Accounts'}
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.banned.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
          <Ban className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
