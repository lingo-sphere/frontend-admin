/**
 * @file course.exam.filter.bar.tsx
 * @description Thanh công cụ tìm kiếm và lọc bài thi theo loại (Challenge, Final Test, Đầu vào hệ thống) và trạng thái
 */

import { useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { CustomSelect, type SelectOption } from '@/components/custom.select'

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
  const typeOptions: SelectOption[] = useMemo(
    () => [
      { value: 'ALL', label: isVi ? 'Tất cả loại bài thi' : 'All Exam Types' },
      { value: 'DIAGNOSTIC_TEST', label: isVi ? 'Đầu vào Hệ thống' : 'System Placement' },
      { value: 'CHALLENGE_TEST', label: isVi ? 'Thử thách (Challenge)' : 'Challenge Test' },
      { value: 'FULL_TEST', label: isVi ? 'Tốt nghiệp (Final Test)' : 'Final Course Exam' },
    ],
    [isVi]
  )

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: 'ALL', label: isVi ? 'Tất cả trạng thái' : 'All Status' },
      { value: 'PUBLISHED', label: isVi ? 'Đã xuất bản (Public)' : 'Published' },
      { value: 'DRAFT', label: isVi ? 'Bản nháp (Private)' : 'Draft' },
    ],
    [isVi]
  )

  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-80 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isVi ? 'Tìm bài thi theo tên, khóa học, loại...' : 'Search exams by title, course...'}
          className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <CustomSelect
        value={typeFilter}
        onChange={onTypeFilterChange}
        options={typeOptions}
        className="w-52"
      />

      <CustomSelect
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={statusOptions}
        className="w-44"
      />
    </>
  )
}
