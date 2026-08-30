import { useState, useMemo } from 'react'
import { Plus, RotateCcw, Edit2, Trash2, Sparkles } from 'lucide-react'
import type { Role, Permission } from '@/types/api.types'

interface RolesListTabProps {
  roles: Role[]
  permissions: Permission[]
  onOpenCreateRole: () => void
  onOpenEditRole: (role: Role) => void
  onDeleteRole: (roleId: string) => void
  onRefresh: () => void
  onSeedDefaultRBAC: () => void
  isLoading?: boolean
}

export function RolesListTab({
  roles,
  permissions,
  onOpenCreateRole,
  onOpenEditRole,
  onDeleteRole,
  onRefresh,
  onSeedDefaultRBAC,
  isLoading,
}: RolesListTabProps) {
  const [filterName, setFilterName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchQuery(filterName.trim().toLowerCase())
  }

  const handleReset = () => {
    setFilterName('')
    setSearchQuery('')
  }

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (!searchQuery) return true
      return (
        r.name.toLowerCase().includes(searchQuery) ||
        (r.description || '').toLowerCase().includes(searchQuery)
      )
    })
  }, [roles, searchQuery])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    const secs = String(d.getSeconds()).padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${mins}:${secs}`
  }

  return (
    <div className="space-y-4">
      {/* 1. Filter Card (Screenshot 2 Style) */}
      <form
        onSubmit={handleSearch}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-12 text-right">
              Name:
            </span>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="nhập dữ liệu"
              className="h-9 w-60 sm:w-80 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Làm lại
            </button>
          </div>
        </div>
      </form>

      {/* 2. Main Data Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Danh sách Roles (Vai Trò)
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={onSeedDefaultRBAC}
              className="flex items-center gap-1.5 h-8.5 px-3 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors"
              title="Tự động khởi tạo quyền hạn mẫu"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khởi tạo RBAC Mẫu</span>
            </button>

            <button
              onClick={onOpenCreateRole}
              className="flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Làm mới"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4 min-w-[160px]">Name</th>
                <th className="py-3 px-4 min-w-[200px]">Miêu tả</th>
                <th className="py-3 px-4 w-36">Quyền hạn</th>
                <th className="py-3 px-4 w-28">Trạng thái</th>
                <th className="py-3 px-4 min-w-[150px]">CreatedAt</th>
                <th className="py-3 px-4 min-w-[150px]">UpdatedAt</th>
                <th className="py-3 px-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy Vai trò nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role, index) => {
                  const permCount = role.permissions?.length || 0
                  const isRoleActive = role.is_active !== false

                  return (
                    <tr
                      key={role._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500 font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                          {role.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {role.description || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[11px] text-indigo-600 dark:text-indigo-400">
                          {role.name === 'SUPER_ADMIN' || role.name === 'ADMIN'
                            ? `Toàn quyền (${permissions.length})`
                            : `${permCount} Permissions`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isRoleActive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isRoleActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDate(role.created_at)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDate(role.updated_at)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenEditRole(role)}
                            className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                            title="Chỉnh sửa vai trò"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {role.name !== 'SUPER_ADMIN' && role.name !== 'ADMIN' && (
                            <button
                              onClick={() => onDeleteRole(role._id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              title="Xóa vai trò"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Hiển thị <strong>{filteredRoles.length}</strong> / <strong>{roles.length}</strong> vai trò
          </span>
        </div>
      </div>
    </div>
  )
}
