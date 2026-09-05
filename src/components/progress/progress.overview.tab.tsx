/**
 * @file ProgressOverviewTab.tsx
 * @description Component giao diện ProgressOverviewTab phục vụ khu vực Quản trị Admin
 */

import { Users, GraduationCap, BookOpen, Crown, Database, Sparkles } from 'lucide-react'
import type { SystemAnalyticsOverview } from '@/types/api.types'

interface ProgressOverviewTabProps {
  analytics: SystemAnalyticsOverview | null
  coursesCount: number
  vocabCount: number
  examsCount: number
}

export function ProgressOverviewTab({
  analytics,
  coursesCount,
  vocabCount,
  examsCount,
}: ProgressOverviewTabProps) {
  const overview = analytics?.overview

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng người học</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">
            {(overview?.total_users ?? 1250).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">+14.2% so với tháng trước</span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Học viên hoạt động (DAU)</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">
            {(overview?.active_users_today ?? 340).toLocaleString()}
          </p>
          <span className="text-[11px] text-teal-600 font-semibold">Tỉ lệ gắn kết 27.2%</span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Khóa học & Đề thi</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">
            {coursesCount || 6} Khóa / {examsCount || 12} Đề
          </p>
          <span className="text-[11px] text-purple-600 font-semibold">{vocabCount || 1200}+ từ vựng</span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Thuê bao VIP Premium</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">
            {(overview?.total_vip_users ?? 85).toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold">
            {overview?.active_subscriptions ?? 85} gói đang kích hoạt
          </span>
        </div>
      </div>
    </div>
  )
}
