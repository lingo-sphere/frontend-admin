/**
 * @file roles.list.tab.tsx
 * @description Component giao diện RolesListTab phục vụ khu vực Quản trị Admin
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Edit2, Trash2, Sparkles, Shield, Search } from 'lucide-react'
import type { Role, Permission } from '@/types/api.types'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { Popconfirm } from '@/components/popconfirm'

interface RolesListTabProps {
  roles: Role[]
  permissions: Permission[]
  onOpenCreateRole: () => void
  onOpenEditRole: (role: Role) => void
  onDeleteRole: (roleId: string) => Promise<void> | void
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
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [filterName, setFilterName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchQuery(filterName.trim().toLowerCase())
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilterName('')
    setSearchQuery('')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    let list = roles
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      )
    }

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      if (sortKey === 'created_at') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
      }
      if (sortKey === 'updated_at') {
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
      }
      return 0
    })
  }, [roles, searchQuery, sortKey, sortOrder])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

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

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'name',
      title: isVi ? 'Tên Vai Trò (Role)' : 'Role Name',
      render: (role) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">{role.name}</span>
              {role.is_active ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  {isVi ? 'Hoạt động' : 'Active'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  {isVi ? 'Tắt' : 'Disabled'}
                </span>
              )}
            </div>
            {role.description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {role.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'permissions_count',
      title: isVi ? 'Quyền Hạn (Permissions)' : 'Permissions',
      render: (role) => {
        const count = Array.isArray(role.permissions) ? role.permissions.length : 0
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            {count} {isVi ? 'quyền hạn' : 'permissions'}
          </span>
        )
      },
    },
    {
      key: 'created_at',
      title: isVi ? 'Ngày Tạo' : 'Created At',
      sortable: true,
      render: (role) => (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {formatDate(role.created_at)}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: isVi ? 'Ngày Cập Nhật' : 'Updated At',
      sortable: true,
      render: (role) => (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {formatDate(role.updated_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Actions',
      align: 'right',
      render: (role) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onOpenEditRole(role)}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
            title={isVi ? 'Chỉnh sửa vai trò' : 'Edit role'}
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <Popconfirm
            title={isVi ? 'Xóa vai trò này?' : 'Delete this role?'}
            description={
              isVi
                ? 'Hành động này không thể hoàn tác.'
                : 'This action cannot be undone.'
            }
            okText={isVi ? 'Xóa' : 'Delete'}
            cancelText={isVi ? 'Hủy' : 'Cancel'}
            okType="danger"
            placement="topRight"
            onConfirm={() => onDeleteRole(role._id)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title={isVi ? 'Xóa vai trò' : 'Delete role'}
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  const filterSlot = (
    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      <div className="relative flex-1 sm:w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder={isVi ? 'Tìm kiếm vai trò theo tên...' : 'Search roles by name...'}
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>
      <button
        type="submit"
        className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
      >
        {isVi ? 'Tìm kiếm' : 'Search'}
      </button>
    </form>
  )

  const extraActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={onSeedDefaultRBAC}
        className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
        title={isVi ? 'Tự động khởi tạo quyền hạn mẫu' : 'Initialize default RBAC permissions'}
      >
        <Sparkles className="w-4 h-4" />
        <span>{isVi ? 'Khởi tạo RBAC Mẫu' : 'Seed Default RBAC'}</span>
      </button>

      <button
        onClick={onOpenCreateRole}
        className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>{isVi ? 'Thêm mới' : 'Add New'}</span>
      </button>

      <button
        onClick={onRefresh}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        title={isVi ? 'Làm mới' : 'Refresh'}
      >
        <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
      </button>
    </div>
  )

  return (
    <DataTable<Role>
      columns={columns}
      data={paginatedData}
      rowKey={(r) => r._id}
      isLoading={isLoading}
      emptyText={isVi ? 'Không tìm thấy vai trò nào phù hợp' : 'No matching roles found'}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSortChange={(k, o) => {
        setSortKey(k)
        setSortOrder(o)
        setCurrentPage(1)
      }}
      filterSlot={filterSlot}
      extraActions={extraActions}
      onResetFilters={handleResetFilters}
      pagination={{
        currentPage,
        pageSize,
        totalItems: filteredData.length,
        onPageChange: setCurrentPage,
        onPageSizeChange: (size) => {
          setPageSize(size)
          setCurrentPage(1)
        },
      }}
    />
  )
}
