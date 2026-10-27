// Component hiển thị thẻ thống kê khóa học theo thiết kế SaaS hiện đại.
import { useTranslation } from 'react-i18next'
import { GraduationCap, Users, CheckCircle2, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/stat.card'

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
      <StatCard
        title={isVi ? 'Tổng Khóa Học' : 'Total Courses'}
        value={stats.total}
        subtitle={isVi ? 'Danh mục khóa học trên hệ thống' : 'Platform course catalog'}
        icon={GraduationCap}
        color="indigo"
        trend={stats.total > 0 ? `${stats.total}` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Tổng Học Viên' : 'Total Learners'}
        value={stats.totalStudents.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Lượt ghi danh tham gia học tập' : 'Total course enrollments'}
        icon={Users}
        color="emerald"
        trend={stats.totalStudents > 0 ? `+${stats.totalStudents}` : undefined}
        trendType="up"
      />

      <StatCard
        title={isVi ? 'Đang Phát Hành' : 'Published Courses'}
        value={stats.published}
        subtitle={isVi ? 'Khóa học công khai cho học viên' : 'Available to all learners'}
        icon={CheckCircle2}
        color="teal"
        trend={stats.total > 0 ? `${Math.round((stats.published / stats.total) * 100)}%` : undefined}
        trendType="up"
      />

      <StatCard
        title={isVi ? 'Mục Tiêu Chuẩn' : 'Target Band'}
        value={stats.targetBand}
        subtitle={isVi ? 'Dải điểm đầu ra TOEIC ETS' : 'ETS TOEIC score range'}
        icon={Sparkles}
        color="amber"
        trend={stats.targetBand !== '-' ? stats.targetBand : undefined}
        trendType="neutral"
      />
    </div>
  )
}
