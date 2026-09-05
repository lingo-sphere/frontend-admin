/**
 * @file learner.submissions.filter.bar.tsx
 * @description Search input, skill filter tabs, and review status tabs for submissions
 */

import { Search } from 'lucide-react'

interface LearnerSubmissionsFilterBarProps {
  submissionSearch: string
  onSearchChange: (query: string) => void
  skillFilter: 'ALL' | 'SPEAKING' | 'WRITING'
  onSkillFilterChange: (skill: 'ALL' | 'SPEAKING' | 'WRITING') => void
  reviewStatusFilter: 'ALL' | 'PENDING' | 'REVIEWED'
  onReviewStatusFilterChange: (status: 'ALL' | 'PENDING' | 'REVIEWED') => void
  isVi?: boolean
}

export function LearnerSubmissionsFilterBar({
  submissionSearch,
  onSearchChange,
  skillFilter,
  onSkillFilterChange,
  reviewStatusFilter,
  onReviewStatusFilterChange,
  isVi = true,
}: LearnerSubmissionsFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={submissionSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isVi
              ? 'Tìm theo tên học viên, bài viết, khóa học, từ khóa...'
              : 'Search student, transcript, course...'
          }
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {(['ALL', 'SPEAKING', 'WRITING'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSkillFilterChange(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              skillFilter === s
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {s === 'ALL'
              ? isVi
                ? 'Tất cả kỹ năng'
                : 'All Skills'
              : s === 'SPEAKING'
              ? '🎙️ Speaking'
              : '✍️ Writing'}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {(['ALL', 'PENDING', 'REVIEWED'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onReviewStatusFilterChange(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reviewStatusFilter === r
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {r === 'ALL'
              ? isVi
                ? 'Tất cả trạng thái'
                : 'All Statuses'
              : r === 'PENDING'
              ? isVi
                ? '⏳ Chờ chấm'
                : '⏳ Pending'
              : isVi
              ? '✅ Đã duyệt'
              : '✅ Reviewed'}
          </button>
        ))}
      </div>
    </div>
  )
}
