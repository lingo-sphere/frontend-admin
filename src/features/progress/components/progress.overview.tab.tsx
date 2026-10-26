// Component hiển thị thẻ phân tích tiến trình tổng quan theo thiết kế SaaS hiện đại.
import { Users, GraduationCap, BookOpen, Crown } from 'lucide-react'
import type { SystemAnalyticsOverview } from '@/types/api.types'
import { StatCard } from '@/components/stat.card'

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
  const totalUsers = overview?.total_users ?? 0
  const activeToday = overview?.active_users_today ?? 0
  const totalVip = overview?.total_vip_users ?? 0
  const activeSubs = overview?.active_subscriptions ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatCard
          title="Tổng người học"
          value={totalUsers.toLocaleString()}
          subtitle="Người dùng đăng ký tài khoản"
          icon={Users}
          color="indigo"
          trend="+14.2%"
          trendType="up"
        />

        <StatCard
          title="Học viên hoạt động (DAU)"
          value={activeToday.toLocaleString()}
          subtitle="Người học tương tác trong ngày"
          icon={GraduationCap}
          color="teal"
          trend={totalUsers > 0 ? `${Math.round((activeToday / totalUsers) * 100)}%` : undefined}
          trendType="up"
        />

        <StatCard
          title="Khóa học & Đề thi"
          value={`${coursesCount} Khóa / ${examsCount} Đề`}
          subtitle={vocabCount > 0 ? `${vocabCount.toLocaleString()} từ vựng lưu trữ` : 'Kho học liệu hệ thống'}
          icon={BookOpen}
          color="purple"
          trend={coursesCount > 0 ? `${coursesCount + examsCount}` : undefined}
          trendType="neutral"
        />

        <StatCard
          title="Thuê bao VIP Premium"
          value={totalVip.toLocaleString()}
          subtitle={`${activeSubs} gói thuê bao đang hoạt động`}
          icon={Crown}
          color="amber"
          trend={totalVip > 0 ? `${totalVip}` : undefined}
          trendType="neutral"
        />
      </div>
    </div>
  )
}
