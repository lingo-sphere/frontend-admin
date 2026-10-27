// Component hiển thị thẻ thống kê học viên theo thiết kế SaaS hiện đại.
import { useTranslation } from 'react-i18next'
import { Users, CheckCircle, Crown, Ban } from 'lucide-react'
import type { LearnerStats } from '@/features/users/helpers/learner.helper'
import { StatCard } from '@/components/stat.card'

interface LearnerStatsOverviewProps {
  stats: LearnerStats
}

export function LearnerStatsOverview({ stats }: LearnerStatsOverviewProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={isVi ? 'Tổng Học Viên' : 'Total Learners'}
        value={stats.total.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Hồ sơ người học trong hệ thống' : 'Total registered learner profiles'}
        icon={Users}
        color="emerald"
        trend={stats.total > 0 ? `${stats.total}` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Đang Hoạt Động' : 'Active Learners'}
        value={stats.active.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Tài khoản ở trạng thái khả dụng' : 'Accounts in active status'}
        icon={CheckCircle}
        color="teal"
        trend={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : undefined}
        trendType="up"
      />

      <StatCard
        title={isVi ? 'Gói Premium / VIP' : 'Premium / VIP'}
        value={stats.premium.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Người học đăng ký gói nâng cao' : 'Subscribed to premium plans'}
        icon={Crown}
        color="amber"
        trend={stats.total > 0 ? `${Math.round((stats.premium / stats.total) * 100)}%` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Tài Khoản Bị Khóa' : 'Banned Accounts'}
        value={stats.banned.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Tài khoản vi phạm quy tắc hệ thống' : 'Suspended or restricted access'}
        icon={Ban}
        color="rose"
        trend={stats.banned > 0 ? `${stats.banned}` : undefined}
        trendType={stats.banned > 0 ? 'down' : 'neutral'}
      />
    </div>
  )
}
