/**
 * @file roadmaps.filter.bar.tsx
 * @description Thanh công cụ tìm kiếm và bộ lọc kỹ năng, trạng thái cho bảng Lộ trình học tập
 */

import { Search } from 'lucide-react'

interface RoadmapsFilterBarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  skillsFilter: string
  onSkillsFilterChange: (val: string) => void
  statusFilter: string
  onStatusFilterChange: (val: string) => void
}

export function RoadmapsFilterBar({
  searchQuery,
  onSearchChange,
  skillsFilter,
  onSkillsFilterChange,
  statusFilter,
  onStatusFilterChange,
}: RoadmapsFilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, slug, mô tả..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={skillsFilter}
          onChange={(e) => onSkillsFilterChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">Tất cả Kỹ năng</option>
          <option value="2SKILLS">2 Kỹ năng (LR)</option>
          <option value="4SKILLS">4 Kỹ năng (LRSW)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">Tất cả Trạng thái</option>
          <option value="PUBLISHED">Đang Áp Dụng</option>
          <option value="DRAFT">Bản Nháp</option>
        </select>
      </div>
    </div>
  )
}
