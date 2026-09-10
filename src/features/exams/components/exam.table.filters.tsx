/**
 * @file exam.table.filters.tsx
 * @description Search input and exam type filter buttons for exam list table
 */

import { Search } from 'lucide-react'

interface ExamTableFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedType: string
  onTypeChange: (val: string) => void
  isVi: boolean
}

export function ExamTableFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  isVi,
}: ExamTableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder={isVi ? 'Tìm kiếm đề thi theo tên...' : 'Search exams by title...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        {['ALL', 'FULL_TEST', 'MINI_TEST', 'PRE_TEST', 'POST_MINI_TEST'].map(
          (type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
              }`}
            >
              {type === 'ALL'
                ? (isVi ? 'Tất cả' : 'All')
                : type === 'FULL_TEST'
                  ? 'Full Test (200c)'
                  : type === 'MINI_TEST'
                    ? 'Mini Test'
                    : type === 'PRE_TEST'
                      ? 'Pre-Test'
                      : 'Post-Mini Test'}
            </button>
          )
        )}
      </div>
    </div>
  )
}
