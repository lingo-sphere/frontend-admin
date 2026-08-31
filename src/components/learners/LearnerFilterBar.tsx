import { Search, X } from 'lucide-react'
import type { FilterStatus, FilterPlan } from '@/helpers/learner.helper'

interface LearnerFilterBarProps {
  searchTerm?: string
  searchQuery?: string
  onSearchChange: (val: string) => void
  selectedStatus: FilterStatus
  onStatusChange: (val: FilterStatus) => void
  selectedPlan: FilterPlan
  onPlanChange: (val: FilterPlan) => void
}

export function LearnerFilterBar({
  searchTerm,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPlan,
  onPlanChange,
}: LearnerFilterBarProps) {
  const currentSearch = searchTerm !== undefined ? searchTerm : (searchQuery || '')
  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={currentSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên, email học viên..."
          className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
        />
        {currentSearch && (
          <button
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang hoạt động</option>
        <option value="INACTIVE">Chưa kích hoạt</option>
        <option value="BANNED">Đã bị khóa</option>
      </select>

      <select
        value={selectedPlan}
        onChange={(e) => onPlanChange(e.target.value as FilterPlan)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả gói học</option>
        <option value="free">Gói Miễn Phí (Free)</option>
        <option value="premium">Gói Trả Phí (VIP / Pro)</option>
      </select>
    </>
  )
}
