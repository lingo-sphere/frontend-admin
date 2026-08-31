import { Search, X } from 'lucide-react'
import type {
  FilterCategory,
  FilterPriority,
  FilterStatus,
} from '@/helpers/notification.helper'
import { categoryLabels } from '@/data/notifications-data'

interface NotificationFilterBarProps {
  searchTerm: string
  selectedCategory: FilterCategory
  selectedPriority: FilterPriority
  selectedStatus: FilterStatus
  isVietnamese: boolean
  onSearchChange: (val: string) => void
  onCategoryChange: (val: FilterCategory) => void
  onPriorityChange: (val: FilterPriority) => void
  onStatusChange: (val: FilterStatus) => void
}

export function NotificationFilterBar({
  searchTerm,
  selectedCategory,
  selectedPriority,
  selectedStatus,
  isVietnamese,
  onSearchChange,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
}: NotificationFilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isVietnamese
              ? 'Tìm thông báo theo tiêu đề, nội dung...'
              : 'Search notifications...'
          }
          className="w-full h-10 pl-10 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as FilterCategory)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">{isVietnamese ? 'Tất cả danh mục' : 'All Categories'}</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {isVietnamese ? label.vi : label.en}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value as FilterPriority)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">{isVietnamese ? 'Mức độ ưu tiên' : 'All Priorities'}</option>
          <option value="LOW">Thấp (Low)</option>
          <option value="NORMAL">Bình thường (Normal)</option>
          <option value="HIGH">Quan trọng (High)</option>
          <option value="URGENT">Khẩn cấp (Urgent)</option>
          <option value="CRITICAL">Nghiêm trọng (Critical)</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">{isVietnamese ? 'Tất cả trạng thái' : 'All Status'}</option>
          <option value="UNREAD">{isVietnamese ? 'Chưa đọc' : 'Unread'}</option>
          <option value="READ">{isVietnamese ? 'Đã đọc' : 'Read'}</option>
          <option value="PINNED">{isVietnamese ? 'Đã ghim' : 'Pinned'}</option>
        </select>
      </div>
    </div>
  )
}
