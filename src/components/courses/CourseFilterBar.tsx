import { Search, X } from 'lucide-react'
import type { FilterCategory, FilterLevel, FilterStatus } from '@/helpers/course.helper'
import { CustomSelect } from '@/components/common/CustomSelect'

interface CourseFilterBarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  filterCategory: FilterCategory
  onCategoryChange: (val: FilterCategory) => void
  filterLevel: FilterLevel
  onLevelChange: (val: FilterLevel) => void
  filterStatus: FilterStatus
  onStatusChange: (val: FilterStatus) => void
}

const categoryOptions = [
  { value: 'ALL', label: 'Tất cả danh mục' },
  { value: 'TOEIC_2_SKILLS', label: 'TOEIC 2 Kỹ Năng (LR)' },
  { value: 'TOEIC_4_SKILLS', label: 'TOEIC 4 Kỹ Năng (Full)' },
]

const levelOptions = [
  { value: 'ALL', label: 'Tất cả trình độ' },
  { value: 'BEGINNER', label: 'Sơ cấp (Beginner)', badge: 'A1-A2', badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { value: 'INTERMEDIATE', label: 'Trung cấp (Intermediate)', badge: 'B1-B2', badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
  { value: 'ADVANCED', label: 'Nâng cao (Advanced)', badge: 'C1', badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' },
]

const statusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PUBLISHED', label: 'Đã xuất bản (Public)', badge: 'Public', badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { value: 'DRAFT', label: 'Bản nháp (Draft)', badge: 'Draft', badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
]

export function CourseFilterBar({
  searchQuery,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterLevel,
  onLevelChange,
  filterStatus,
  onStatusChange,
}: CourseFilterBarProps) {
  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm khóa học..."
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
        className="w-52"
      />

      <CustomSelect
        value={filterLevel}
        onChange={(val) => onLevelChange(val as FilterLevel)}
        options={levelOptions}
        className="w-48"
      />

      <CustomSelect
        value={filterStatus}
        onChange={(val) => onStatusChange(val as FilterStatus)}
        options={statusOptions}
        className="w-44"
      />
    </>
  )
}
