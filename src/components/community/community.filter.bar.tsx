/**
 * @file community.filter.bar.tsx
 * @description Component giao diện CommunityFilterBar phục vụ khu vực Quản trị Admin
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { CustomSelect } from '@/components/common/custom.select'

interface CommunityFilterBarProps {
  searchQuery: string
  filterStatus: string
  onSearchChange: (val: string) => void
  onStatusChange: (val: string) => void
}

export function CommunityFilterBar({
  searchQuery,
  filterStatus,
  onSearchChange,
  onStatusChange,
}: CommunityFilterBarProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const statusOptions = useMemo(() => [
    { value: 'ALL', label: isVi ? 'Tất cả trạng thái' : 'All Status' },
    { value: 'APPROVED', label: isVi ? 'Đã duyệt' : 'Approved' },
    { value: 'PENDING_REVIEW', label: isVi ? 'Chờ kiểm duyệt' : 'Pending Review' },
    { value: 'FLAGGED', label: isVi ? 'Bị báo cáo' : 'Flagged' },
    { value: 'HIDDEN', label: isVi ? 'Đã ẩn' : 'Hidden' },
  ], [isVi])

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isVi ? 'Tìm bài viết theo tiêu đề, tác giả...' : 'Search posts by title, author...'}
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
          className="w-48"
        />
      </div>
    </div>
  )
}
