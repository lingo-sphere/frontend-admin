import { Search, X } from 'lucide-react'
import type { FilterCategory, FilterLevel, FilterStatus } from '@/helpers/course.helper'

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

      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value as FilterCategory)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả danh mục</option>
        <option value="TOEIC_2_SKILLS">TOEIC 2 Kỹ Năng (Listening - Reading)</option>
        <option value="TOEIC_4_SKILLS">TOEIC 4 Kỹ Năng (Full Skills L-R-S-W)</option>
      </select>

      <select
        value={filterLevel}
        onChange={(e) => onLevelChange(e.target.value as FilterLevel)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả trình độ</option>
        <option value="BEGINNER">Sơ cấp (Beginner)</option>
        <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
        <option value="ADVANCED">Nâng cao (Advanced)</option>
      </select>

      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="PUBLISHED">Đã xuất bản (Public)</option>
        <option value="DRAFT">Bản nháp (Draft)</option>
      </select>
    </>
  )
}
