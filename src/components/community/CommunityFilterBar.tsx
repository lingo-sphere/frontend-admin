import { Search, X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface CommunityFilterBarProps {
  searchQuery: string
  filterStatus: string
  onSearchChange: (val: string) => void
  onStatusChange: (val: string) => void
}

const statusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'APPROVED', label: 'Đã duyệt (Approved)', badge: 'Approved', badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { value: 'PENDING_REVIEW', label: 'Chờ kiểm duyệt', badge: 'Pending', badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
  { value: 'FLAGGED', label: 'Bị báo cáo (Flagged)', badge: 'Flagged', badgeClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' },
  { value: 'HIDDEN', label: 'Đã ẩn (Hidden)', badge: 'Hidden', badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
]

export function CommunityFilterBar({
  searchQuery,
  filterStatus,
  onSearchChange,
  onStatusChange,
}: CommunityFilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm bài viết theo tiêu đề, tác giả..."
          className="w-full h-10 pl-10 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <CustomSelect
          value={filterStatus}
          onChange={onStatusChange}
          options={statusOptions}
          className="w-52"
        />
      </div>
    </div>
  )
}
