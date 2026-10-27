// Component hiển thị thẻ thống kê nhân sự quản trị và giảng viên theo thiết kế SaaS hiện đại.
import { useTranslation } from 'react-i18next'
import { Shield, GraduationCap, CheckCircle, Lock } from 'lucide-react'
import type { AdminUserStats } from '@/features/users/helpers/admin.user.helper'
import { StatCard } from '@/components/stat.card'

interface AdminUserStatsOverviewProps {
  stats: AdminUserStats
}

export function AdminUserStatsOverview({ stats }: AdminUserStatsOverviewProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={isVi ? 'Tổng Nhân Sự' : 'Total Staff'}
        value={stats.total.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Quản trị viên và đội ngũ giáo viên' : 'Admins and teaching staff'}
        icon={Shield}
        color="indigo"
        trend={stats.total > 0 ? `${stats.total}` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Quản Trị Viên' : 'Administrators'}
        value={stats.admins.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Toàn quyền vận hành hệ thống' : 'Full access privileges'}
        icon={Lock}
        color="rose"
        trend={stats.admins > 0 ? `${stats.admins}` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Giảng Viên' : 'Instructors'}
        value={stats.teachers.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Biên soạn nội dung & chấm điểm' : 'Course and exam authors'}
        icon={GraduationCap}
        color="teal"
        trend={stats.teachers > 0 ? `${stats.teachers}` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Đang Hoạt Động' : 'Active Accounts'}
        value={stats.active.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Tài khoản có quyền đăng nhập' : 'Permitted to sign in'}
        icon={CheckCircle}
        color="emerald"
        trend={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : undefined}
        trendType="up"
      />
    </div>
  )
}
