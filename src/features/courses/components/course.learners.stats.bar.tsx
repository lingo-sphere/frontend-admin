// Component hiển thị thẻ thống kê học viên, tiến độ và bài nộp theo chuẩn StatCard của hệ thống.

import { Users, Trophy, FileCheck2, Clock } from 'lucide-react'
import { StatCard } from '@/components/stat.card'

interface CourseLearnersStatsBarProps {
  isVi: boolean
  totalStudents: number
  avgProgress: number
  totalSubmissions: number
  pendingReviews: number
  loading?: boolean
}

export function CourseLearnersStatsBar({
  isVi,
  totalStudents,
  avgProgress,
  totalSubmissions,
  pendingReviews,
  loading = false,
}: CourseLearnersStatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={isVi ? 'Tổng Học Viên' : 'Total Students'}
        value={totalStudents.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Học viên theo dõi tiến độ' : 'Enrolled course learners'}
        icon={Users}
        color="indigo"
        trend={totalStudents > 0 ? `${totalStudents}` : undefined}
        trendType="neutral"
        loading={loading}
      />

      <StatCard
        title={isVi ? 'Tiến Độ TB' : 'Avg Progress'}
        value={`${avgProgress}%`}
        subtitle={isVi ? 'Tỷ lệ hoàn thành bài học trung bình' : 'Average lesson completion rate'}
        icon={Trophy}
        color="emerald"
        trend={`${avgProgress}%`}
        trendType={avgProgress >= 50 ? 'up' : 'neutral'}
        loading={loading}
      />

      <StatCard
        title={isVi ? 'Tổng Bài Nộp' : 'Total Submissions'}
        value={totalSubmissions.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Bài tập Nói & Viết đã nộp' : 'Submitted speaking & writing tasks'}
        icon={FileCheck2}
        color="purple"
        trend={totalSubmissions > 0 ? `${totalSubmissions}` : undefined}
        trendType="neutral"
        loading={loading}
      />

      <StatCard
        title={isVi ? 'Chờ Chấm Điểm' : 'Pending Review'}
        value={pendingReviews.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Bài nộp đang chờ giáo viên chấm' : 'Awaiting teacher evaluation'}
        icon={Clock}
        color={pendingReviews > 0 ? 'rose' : 'amber'}
        trend={pendingReviews > 0 ? `${pendingReviews} bài` : undefined}
        trendType={pendingReviews > 0 ? 'down' : 'neutral'}
        loading={loading}
      />
    </div>
  )
}

