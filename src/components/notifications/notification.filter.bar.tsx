/**
 * @file NotificationFilterBar.tsx
 * @description Component giao diện NotificationFilterBar phục vụ khu vực Quản trị Admin
 */

import { useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type {
  FilterCategory,
  FilterPriority,
  FilterStatus,
} from '@/helpers/notification.helper'
import { categoryLabels } from '@/data/notifications-data'
import { CustomSelect } from '@/components/common/custom.select'

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
  const categoryOptions = useMemo(() => [
    { value: 'ALL', label: isVietnamese ? 'Tất cả danh mục' : 'All Categories' },
    ...Object.entries(categoryLabels).map(([key, label]) => ({
      value: key,
      label: isVietnamese ? label.vi : label.en,
    })),
  ], [isVietnamese])

  const priorityOptions = useMemo(() => [
    { value: 'ALL', label: isVietnamese ? 'Tất cả mức độ' : 'All Priorities' },
    { value: 'LOW', label: isVietnamese ? 'Thấp' : 'Low' },
    { value: 'NORMAL', label: isVietnamese ? 'Bình thường' : 'Normal' },
    { value: 'HIGH', label: isVietnamese ? 'Quan trọng' : 'High' },
    { value: 'URGENT', label: isVietnamese ? 'Khẩn cấp' : 'Urgent' },
    { value: 'CRITICAL', label: isVietnamese ? 'Nghiêm trọng' : 'Critical' },
  ], [isVietnamese])

  const statusOptions = useMemo(() => [
    { value: 'ALL', label: isVietnamese ? 'Tất cả trạng thái' : 'All Status' },
    { value: 'UNREAD', label: isVietnamese ? 'Chưa đọc' : 'Unread' },
    { value: 'READ', label: isVietnamese ? 'Đã đọc' : 'Read' },
    { value: 'PINNED', label: isVietnamese ? 'Đã ghim' : 'Pinned' },
  ], [isVietnamese])

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
        <CustomSelect
          value={selectedCategory}
          onChange={(val) => onCategoryChange(val as FilterCategory)}
          options={categoryOptions}
          className="w-48"
        />

        <CustomSelect
          value={selectedPriority}
          onChange={(val) => onPriorityChange(val as FilterPriority)}
          options={priorityOptions}
          className="w-44"
        />

        <CustomSelect
          value={selectedStatus}
          onChange={(val) => onStatusChange(val as FilterStatus)}
          options={statusOptions}
          className="w-40"
        />
      </div>
    </div>
  )
}
