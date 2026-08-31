import { Search, X } from 'lucide-react'
import type { FilterRole, FilterStatus } from '@/helpers/admin-user.helper'

interface AdminUserFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  selectedRole: FilterRole
  onRoleChange: (val: FilterRole) => void
  selectedStatus: FilterStatus
  onStatusChange: (val: FilterStatus) => void
}

export function AdminUserFilterBar({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
}: AdminUserFilterBarProps) {
  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên hoặc email quản trị/giảng viên..."
          className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <select
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value as FilterRole)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả vai trò</option>
        <option value="ADMIN">Quản trị viên (Admin)</option>
        <option value="TEACHER">Giảng viên (Teacher)</option>
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang hoạt động</option>
        <option value="INACTIVE">Đã khóa / Tạm dừng</option>
      </select>
    </>
  )
}
