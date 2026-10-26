// Lưới thẻ số liệu thống kê tổng quan hệ thống trang Dashboard theo phong cách SaaS hiện đại.
import { Users, GraduationCap, Crown, BookOpenCheck } from 'lucide-react'
import type { SystemAnalyticsOverview } from '@/types/api.types'
import { StatCard } from '@/components/stat.card'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 sm:gap-5">
      <StatCard
        title={isVietnamese ? 'Tổng Người Dùng' : 'Total Users'}
        value={totalUsers.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')}
        subtitle={isVietnamese ? 'Tài khoản đăng ký toàn hệ thống' : 'Platform registered users'}
        icon={Users}
        color="emerald"
        trend="+12.5%"
        trendType="up"
      />

      <StatCard
        title={isVietnamese ? 'Học Viên Hoạt Động' : 'Active Learners'}
        value={activeLearners.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')}
        subtitle={isVietnamese ? 'Lượt học trực tuyến trong ngày' : 'Active users today'}
        icon={GraduationCap}
        color="teal"
        trend="+8.2%"
        trendType="up"
      />

      <StatCard
        title={isVietnamese ? 'Khóa Học Đang Mở' : 'Published Courses'}
        value={totalCourses}
        subtitle={isVietnamese ? 'Giáo trình TOEIC & Từ vựng' : 'TOEIC & Vocab syllabus'}
        icon={BookOpenCheck}
        color="amber"
        trend={totalCourses > 0 ? `${totalCourses} khóa` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVietnamese ? 'Học Viên VIP' : 'VIP Subscribers'}
        value={vipUsers.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')}
        subtitle={isVietnamese ? `${activeSubscriptions} gói thuê bao đang hoạt động` : `${activeSubscriptions} active subscriptions`}
        icon={Crown}
        color="purple"
        trend={vipUsers > 0 ? `${vipUsers}` : undefined}
        trendType="neutral"
      />
    </div>
  )
}
