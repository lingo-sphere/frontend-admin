import { useTranslation } from 'react-i18next'
import { FileText, CheckCircle, Award, Clock } from 'lucide-react'

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
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Tổng Đề Thi' : 'Total Exams'}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Đã Xuất Bản' : 'Published Exams'}
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.published}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Lượt Thi Toàn Hệ Thống' : 'System-wide Attempts'}
          </p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.totalAttempts.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVi ? 'Điểm Trung Bình ETS' : 'ETS Average Score'}
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.avgScore} <span className="text-xs font-normal text-slate-400">/ 990</span>
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
          <Award className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
