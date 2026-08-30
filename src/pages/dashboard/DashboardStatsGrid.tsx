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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 sm:gap-6">
      <div className="p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {isVietnamese ? 'Tổng người dùng' : 'Total Users'}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 shadow-xs">
            <Users className="h-5.5 w-5.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {totalUsers.toLocaleString()}
          </span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            +12.5%
          </span>
        </div>
        <p className="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          {isVietnamese ? 'So với tháng trước' : 'vs last month'}
        </p>
      </div>

      <div className="p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {isVietnamese ? 'Học viên hoạt động' : 'Active Learners'}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 shadow-xs">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {activeLearners.toLocaleString()}
          </span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            +8.2%
          </span>
        </div>
        <p className="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          {isVietnamese ? 'Hoạt động trong ngày' : 'Active today'}
        </p>
      </div>

      <div className="p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {isVietnamese ? 'Khóa học xuất bản' : 'Published Courses'}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 shadow-xs">
            <BookOpenCheck className="h-5.5 w-5.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {totalCourses}
          </span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            TOEIC & Vocab
          </span>
        </div>
        <p className="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          {isVietnamese ? 'Giáo trình chuẩn ETS' : 'Standard ETS Syllabus'}
        </p>
      </div>

      <div className="p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {isVietnamese ? 'Học viên VIP' : 'VIP Subscribers'}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 shadow-xs">
            <Crown className="h-5.5 w-5.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {vipUsers.toLocaleString()}
          </span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            {activeSubscriptions} {isVietnamese ? 'gói' : 'plans'}
          </span>
        </div>
        <p className="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          {isVietnamese ? 'Gói Premium & VIP Academy' : 'Premium & VIP Academy'}
        </p>
      </div>
    </div>
  )
}
