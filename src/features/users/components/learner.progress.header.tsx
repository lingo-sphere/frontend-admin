// Hiển thị thông tin học viên, tiến độ hoàn thành khóa học và các cột mốc điểm số quan trọng.

import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Award,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
import { StatCard } from '@/components/stat.card'

interface LearnerProgressHeaderProps {
  displayName: string
  displayEmail: string
  avatarUrl?: string
  courseTitle: string
  progressPct: number
  completedLessons: number
  totalLessons: number
  baselineScore?: number
  finalTestScore?: number
  growth: number
  isLoading: boolean
  onBack: () => void
  onRefresh: () => void
}

export function LearnerProgressHeader({
  displayName,
  displayEmail,
  avatarUrl,
  courseTitle,
  progressPct,
  completedLessons,
  totalLessons,
  baselineScore,
  finalTestScore,
  growth,
  isLoading,
  onBack,
  onRefresh,
}: LearnerProgressHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại học viên</span>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </h2>
                <span className="text-xs text-slate-400">({displayEmail})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tiến Độ Khóa Học"
          value={`${progressPct}%`}
          subtitle={`${completedLessons} / ${totalLessons} bài học`}
          icon={BarChart3}
          color="indigo"
          trend={`${progressPct}%`}
          trendType={progressPct >= 50 ? 'up' : 'neutral'}
          loading={isLoading}
        />

        <StatCard
          title="Đầu Vào (Pre-test)"
          value={baselineScore !== undefined ? `${baselineScore}đ` : 'Chưa test'}
          subtitle="Thang điểm TOEIC xuất phát"
          icon={CheckCircle2}
          color="emerald"
          trend={baselineScore !== undefined ? `${baselineScore}đ` : undefined}
          trendType="neutral"
          loading={isLoading}
        />

        <StatCard
          title="Kết Khóa (Final Test)"
          value={finalTestScore !== undefined ? `${finalTestScore}đ` : 'Chưa thi'}
          subtitle="Bài thi tốt nghiệp hoàn thành"
          icon={Award}
          color="purple"
          trend={finalTestScore !== undefined ? `${finalTestScore}đ` : undefined}
          trendType="neutral"
          loading={isLoading}
        />

        <StatCard
          title="Tăng Trưởng Điểm Số"
          value={growth > 0 ? `+${growth}đ` : `${growth}đ`}
          subtitle="So với điểm xuất phát"
          icon={TrendingUp}
          color={growth > 0 ? 'emerald' : growth < 0 ? 'rose' : 'amber'}
          trend={growth !== 0 ? `${growth > 0 ? `+${growth}` : growth}` : undefined}
          trendType={growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral'}
          loading={isLoading}
        />
      </div>
    </div>
  )
}
