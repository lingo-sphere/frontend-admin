// Hiển thị thông tin học viên, tiến độ hoàn thành khóa học và các cột mốc điểm số quan trọng.

import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Award,
  BookOpen,
} from 'lucide-react'

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
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tiến độ khóa học</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">{progressPct}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {completedLessons} / {totalLessons} bài học
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Đầu vào (Pre-test)</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {baselineScore !== undefined ? `${baselineScore}đ` : 'Chưa test'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Thang điểm TOEIC</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Kết khóa (Final Test)</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {finalTestScore !== undefined ? `${finalTestScore}đ` : 'Chưa thi'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bài thi tốt nghiệp</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tăng trưởng điểm số</div>
            <div className={`text-lg font-black ${growth > 0 ? 'text-emerald-600' : growth < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
              {growth > 0 ? `+${growth}` : growth} điểm
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">So với điểm xuất phát</div>
          </div>
        </div>
      </div>
    </div>
  )
}
