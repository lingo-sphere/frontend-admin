import { Users, GraduationCap, Crown, BookOpenCheck } from 'lucide-react'
import type { SystemAnalyticsOverview } from '@/types/api.types'

interface DashboardStatsGridProps {
  analytics: SystemAnalyticsOverview | null
  totalCoursesCount: number
  isVietnamese: boolean
}

export function DashboardStatsGrid({
  analytics,
  totalCoursesCount,
  isVietnamese,
}: DashboardStatsGridProps) {
  const totalUsers = analytics?.overview?.total_users || 0
  const activeLearners = analytics?.overview?.active_users_today || 0
  const totalCourses = totalCoursesCount || 0
  const vipUsers = analytics?.overview?.total_vip_users || 0
  const activeSubscriptions = analytics?.overview?.active_subscriptions || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVietnamese ? 'Tổng người dùng' : 'Total Users'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalUsers.toLocaleString()}
          </span>
          <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            +12.5%
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          {isVietnamese ? 'So với tháng trước' : 'vs last month'}
        </p>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVietnamese ? 'Học viên hoạt động' : 'Active Learners'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {activeLearners.toLocaleString()}
          </span>
          <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            +8.2%
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          {isVietnamese ? 'Hoạt động trong ngày' : 'Active today'}
        </p>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVietnamese ? 'Khóa học xuất bản' : 'Published Courses'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <BookOpenCheck className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalCourses}
          </span>
          <span className="ml-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            TOEIC & Vocab
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          {isVietnamese ? 'Giáo trình chuẩn ETS' : 'Standard ETS Syllabus'}
        </p>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVietnamese ? 'Học viên VIP' : 'VIP Subscribers'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            <Crown className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {vipUsers.toLocaleString()}
          </span>
          <span className="ml-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            {activeSubscriptions} {isVietnamese ? 'gói hoạt động' : 'active plans'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          {isVietnamese ? 'Gói Premium & VIP Academy' : 'Premium & VIP Academy'}
        </p>
      </div>
    </div>
  )
}
