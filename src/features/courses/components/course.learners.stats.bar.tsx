// Thanh hiển thị các thẻ thống kê học viên và tiến độ trung bình theo thiết kế SaaS hiện đại.
import { Users, Trophy } from 'lucide-react'
import { StatCard } from '@/components/stat.card'

interface CourseLearnersStatsBarProps {
  isVi: boolean
  totalStudents: number
  avgProgress: number
  isLoading?: boolean
}

export function CourseLearnersStatsBar({
  isVi,
  totalStudents,
  avgProgress,
  isLoading,
}: CourseLearnersStatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard
        title={isVi ? 'Tổng Học Viên' : 'Total Learners'}
        value={totalStudents.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Học viên theo dõi tiến độ trong hệ thống' : 'Total registered learners in course system'}
        icon={Users}
        color="emerald"
        trend={totalStudents > 0 ? `${totalStudents}` : undefined}
        trendType="neutral"
        loading={isLoading}
      />

      <StatCard
        title={isVi ? 'Tiến Độ Trung Bình' : 'Average Progress'}
        value={`${avgProgress}%`}
        subtitle={isVi ? 'Tỉ lệ hoàn thành nội dung bài học trung bình' : 'Average course curriculum completion rate'}
        icon={Trophy}
        color="teal"
        trend={`${avgProgress}%`}
        trendType={avgProgress >= 50 ? 'up' : 'neutral'}
        loading={isLoading}
      />
    </div>
  )
}
