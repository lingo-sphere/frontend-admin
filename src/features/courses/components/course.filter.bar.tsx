// Component giao diện thanh bộ lọc khóa học trong Quản trị Admin.

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import type { FilterCategory, FilterStatus } from '@/features/courses/helpers/course.helper'
import { CustomSelect } from '@/components/custom.select'

interface CourseFilterBarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  filterCategory: FilterCategory
  onCategoryChange: (val: FilterCategory) => void
  filterStatus: FilterStatus
  onStatusChange: (val: FilterStatus) => void
}

export function CourseFilterBar({
  searchQuery,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
}: CourseFilterBarProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const categoryOptions = useMemo(() => [
    { value: 'ALL', label: isVi ? 'Tất cả danh mục' : 'All Categories' },
    { value: 'TOEIC_2_SKILLS', label: isVi ? 'TOEIC 2 Kỹ Năng' : 'TOEIC 2 Skills' },
    { value: 'TOEIC_4_SKILLS', label: isVi ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 4 Skills' },
  ], [isVi])

  const statusOptions = useMemo(() => [
    { value: 'ALL', label: isVi ? 'Tất cả trạng thái' : 'All Status' },
    { value: 'PUBLISHED', label: isVi ? 'Đã xuất bản' : 'Published' },
    { value: 'DRAFT', label: isVi ? 'Bản nháp' : 'Draft' },
  ], [isVi])

  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isVi ? 'Tìm kiếm khóa học...' : 'Search courses...'}
          className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <CustomSelect
        value={filterCategory}
        onChange={(val) => onCategoryChange(val as FilterCategory)}
        options={categoryOptions}
        className="w-48"
      />

      <CustomSelect
        value={filterStatus}
        onChange={(val) => onStatusChange(val as FilterStatus)}
        options={statusOptions}
        className="w-40"
      />
    </>
  )
}
