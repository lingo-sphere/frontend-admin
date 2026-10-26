// Component hiển thị các thẻ số liệu thống kê đề thi TOEIC theo phong cách SaaS hiện đại.
import { useTranslation } from 'react-i18next'
import { FileText, CheckCircle, Award, Users } from 'lucide-react'
import { StatCard } from '@/components/stat.card'

interface ExamStatsOverviewProps {
  stats: {
    total: number
    published: number
    totalAttempts: number
    avgScore: number
  }
}

export function ExamStatsOverview({ stats }: ExamStatsOverviewProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={isVi ? 'Tổng Đề Thi' : 'Total Exams'}
        value={stats.total}
        subtitle={isVi ? 'Ngân hàng đề thi TOEIC' : 'TOEIC test repository'}
        icon={FileText}
        color="emerald"
        trend={stats.total > 0 ? `${stats.total}` : undefined}
        trendType="neutral"
      />

      <StatCard
        title={isVi ? 'Đã Xuất Bản' : 'Published Exams'}
        value={stats.published}
        subtitle={isVi ? 'Đang mở cho thí sinh luyện tập' : 'Active for practice'}
        icon={CheckCircle}
        color="blue"
        trend={stats.total > 0 ? `${Math.round((stats.published / stats.total) * 100)}%` : undefined}
        trendType="up"
      />

      <StatCard
        title={isVi ? 'Lượt Thi Hệ Thống' : 'System Attempts'}
        value={stats.totalAttempts.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        subtitle={isVi ? 'Tổng lượt làm bài hoàn thành' : 'Completed test attempts'}
        icon={Users}
        color="amber"
      />

      <StatCard
        title={isVi ? 'Điểm Trung Bình ETS' : 'ETS Avg Score'}
        value={stats.avgScore > 0 ? stats.avgScore : '-'}
        subtitle={isVi ? 'Thang điểm chuẩn 990 TOEIC' : 'Out of 990 TOEIC scale'}
        icon={Award}
        color="purple"
        trend={stats.avgScore > 0 ? `${stats.avgScore}/990` : undefined}
        trendType="neutral"
      />
    </div>
  )
}
