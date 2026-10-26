// Component hiển thị các thẻ thống kê tổng quan bài thi khóa học theo thiết kế SaaS hiện đại.
import { Layers, CheckCircle2, Users, Award } from 'lucide-react'
import { StatCard } from '@/components/stat.card'

interface CourseExamStatsOverviewProps {
  stats: {
    total: number
    published: number
    totalAttempts: number
    avgScore: number
  }
  isVi: boolean
}

export function CourseExamStatsOverview({ stats, isVi }: CourseExamStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={isVi ? 'Tổng Bài Thi' : 'Total Exams'}
        value={stats.total}
        subtitle={isVi ? 'Ngân hàng bài kiểm tra khóa học' : 'Course assessment question bank'}
        icon={Layers}
        color="emerald"
        trend={stats.total > 0 ? `${stats.total}` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Đang Xuất Bản' : 'Published'}
        value={stats.published}
        subtitle={isVi ? 'Sẵn sàng cho học viên làm bài' : 'Ready for enrolled learners'}
        icon={CheckCircle2}
        color="blue"
        trend={stats.total > 0 ? `${Math.round((stats.published / stats.total) * 100)}%` : undefined}
        trendType="up"
      />

      <StatCard
        title={isVi ? 'Lượt Học Viên Thi' : 'Total Attempts'}
        value={stats.totalAttempts.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Tổng số lượt nộp bài đánh giá' : 'Total submitted evaluations'}
        icon={Users}
        color="amber"
      />

      <StatCard
        title={isVi ? 'Điểm Trung Bình' : 'Avg Score'}
        value={stats.avgScore > 0 ? stats.avgScore : '-'}
        subtitle={isVi ? 'Thang điểm đánh giá 100%' : 'Standard evaluation scale'}
        icon={Award}
        color="purple"
        trend={stats.avgScore > 0 ? `${stats.avgScore}/100` : undefined}
        trendType="neutral"
      />
    </div>
  )
}
