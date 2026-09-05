/**
 * @file CourseExamFilterBar.tsx
 * @description Thanh công cụ tìm kiếm và lọc bài thi theo loại (Challenge, Final Test, Đầu vào hệ thống) và trạng thái
 */

import { Search } from 'lucide-react'

interface CourseExamFilterBarProps {
  isVi: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  typeFilter: string
  onTypeFilterChange: (type: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
}

export function CourseExamFilterBar({
  isVi,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: CourseExamFilterBarProps) {
  const typeOptions = [
    { id: 'ALL', label: isVi ? 'Tất cả' : 'All' },
    { id: 'DIAGNOSTIC_TEST', label: isVi ? 'Đầu vào Hệ thống' : 'System Placement' },
    { id: 'CHALLENGE_TEST', label: 'Challenge' },
    { id: 'FULL_TEST', label: 'Final Test' },
  ]

  const statusOptions = [
    { id: 'ALL', label: isVi ? 'Tất cả trạng thái' : 'All Status' },
    { id: 'PUBLISHED', label: isVi ? 'Đã xuất bản' : 'Published' },
    { id: 'DRAFT', label: isVi ? 'Bản nháp' : 'Draft' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isVi ? 'Tìm bài thi theo tên, khóa học, loại đánh giá...' : 'Search exam by title, course, type...'}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {typeOptions.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTypeFilterChange(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              typeFilter === t.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {statusOptions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStatusFilterChange(s.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              statusFilter === s.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
