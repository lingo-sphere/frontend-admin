import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import type { FilterRole, FilterStatus } from '@/helpers/admin-user.helper'
import { CustomSelect } from '@/components/common/CustomSelect'

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
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const roleOptions = useMemo(() => [
    { value: 'ALL', label: isVi ? 'Tất cả vai trò' : 'All Roles' },
    { value: 'ADMIN', label: isVi ? 'Quản trị viên' : 'Administrator', badge: isVi ? 'Quản trị' : 'Admin', badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' },
    { value: 'TEACHER', label: isVi ? 'Giảng viên' : 'Teacher', badge: isVi ? 'Giảng viên' : 'Teacher', badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  ], [isVi])

  const statusOptions = useMemo(() => [
    { value: 'ALL', label: isVi ? 'Tất cả trạng thái' : 'All Status' },
    { value: 'ACTIVE', label: isVi ? 'Đang hoạt động' : 'Active', badge: isVi ? 'Hoạt động' : 'Active', badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
    { value: 'INACTIVE', label: isVi ? 'Đã bị khóa' : 'Blocked', badge: isVi ? 'Bị khóa' : 'Blocked', badgeClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' },
  ], [isVi])

  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isVi ? 'Tìm tên hoặc email...' : 'Search by name, email...'}
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

      <CustomSelect
        value={selectedRole}
        onChange={(val) => onRoleChange(val as FilterRole)}
        options={roleOptions}
        className="w-44"
      />

      <CustomSelect
        value={selectedStatus}
        onChange={(val) => onStatusChange(val as FilterStatus)}
        options={statusOptions}
        className="w-44"
      />
    </>
  )
}
