/**
 * @file PermissionsListTab.tsx
 * @description Component giao diện PermissionsListTab phục vụ khu vực Quản trị Admin
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Edit2, Trash2, Search, KeyRound } from 'lucide-react'
import type { Permission } from '@/types/api.types'
import { DataTable, type DataTableColumn } from '@/components/common/data.table'
import { Popconfirm } from '@/components/common/popconfirm'
import { CustomSelect } from '@/components/common/custom.select'

interface PermissionsListTabProps {
  permissions: Permission[]
  onOpenCreatePerm: () => void
  onOpenEditPerm: (perm: Permission) => void
  onDeletePerm: (permId: string) => Promise<void> | void
  onRefresh: () => void
  isLoading?: boolean
}

export function PermissionsListTab({
  permissions,
  onOpenCreatePerm,
  onOpenEditPerm,
  onDeletePerm,
  onRefresh,
  isLoading,
}: PermissionsListTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [filterName, setFilterName] = useState('')
  const [filterApi, setFilterApi] = useState('')
  const [filterModule, setFilterModule] = useState('ALL')

  const [searchQuery, setSearchQuery] = useState({ name: '', api: '', module: 'ALL' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchQuery({
      name: filterName.trim().toLowerCase(),
      api: filterApi.trim().toLowerCase(),
      module: filterModule,
    })
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilterName('')
    setFilterApi('')
    setFilterModule('ALL')
    setSearchQuery({ name: '', api: '', module: 'ALL' })
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  const modulesList = useMemo(() => {
    const set = new Set(permissions.map((p) => (p.module || 'GENERAL').toUpperCase()))
    return Array.from(set).sort()
  }, [permissions])

  const filteredData = useMemo(() => {
    const list = permissions.filter((p) => {
      const matchName = !searchQuery.name || p.name.toLowerCase().includes(searchQuery.name)
      const matchApi = !searchQuery.api || (p.api_path || '').toLowerCase().includes(searchQuery.api)
      const matchModule = searchQuery.module === 'ALL' || (p.module || '').toUpperCase() === searchQuery.module
      return matchName && matchApi && matchModule
    })

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
  }, [permissions, searchQuery, sortKey, sortOrder])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const getMethodBadgeClass = (method?: string) => {
    switch (method?.toUpperCase()) {
      case 'POST':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
      case 'PUT':
      case 'PATCH':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
      case 'DELETE':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
      case 'GET':
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
    }
  }

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

  const columns: DataTableColumn<Permission>[] = [
    {
      key: 'name',
      title: isVi ? 'Tên Quyền Hạn (Permission)' : 'Permission Name',
      render: (perm) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">{perm.name}</span>
            {perm.description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {perm.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'api_path',
      title: isVi ? 'Đường Dẫn API' : 'API Path',
      render: (perm) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {perm.api_path}
        </span>
      ),
    },
    {
      key: 'method',
      title: isVi ? 'Phương Thức' : 'HTTP Method',
      align: 'center',
      render: (perm) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${getMethodBadgeClass(
            perm.method
          )}`}
        >
          {perm.method || 'GET'}
        </span>
      ),
    },
    {
      key: 'module',
      title: isVi ? 'Phân Hệ (Module)' : 'Module',
      render: (perm) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
          {perm.module || 'GENERAL'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: isVi ? 'Ngày Tạo' : 'Created At',
      sortable: true,
      render: (perm) => (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {formatDate(perm.created_at)}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: isVi ? 'Ngày Cập Nhật' : 'Updated At',
      sortable: true,
      render: (perm) => (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {formatDate(perm.updated_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Actions',
      align: 'right',
      render: (perm) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onOpenEditPerm(perm)}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
            title={isVi ? 'Chỉnh sửa quyền hạn' : 'Edit permission'}
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <Popconfirm
            title={isVi ? 'Xóa quyền hạn này?' : 'Delete this permission?'}
            description={
              isVi
                ? 'Hành động này không thể hoàn tác.'
                : 'This action cannot be undone.'
            }
            okText={isVi ? 'Xóa' : 'Delete'}
            cancelText={isVi ? 'Hủy' : 'Cancel'}
            okType="danger"
            placement="topRight"
            onConfirm={() => onDeletePerm(perm._id)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title={isVi ? 'Xóa quyền hạn' : 'Delete permission'}
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
    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full">
      <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder={isVi ? 'Tìm theo tên...' : 'Search by name...'}
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      <div className="relative flex-1 min-w-[180px] sm:max-w-xs">
        <input
          type="text"
          value={filterApi}
          onChange={(e) => setFilterApi(e.target.value)}
          placeholder={isVi ? 'Lọc API (ví dụ /courses)...' : 'Filter API (e.g. /courses)...'}
          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-mono"
        />
      </div>

      <CustomSelect
        size="sm"
        value={filterModule}
        onChange={(val) => {
          setFilterModule(val)
          setSearchQuery((prev) => ({ ...prev, module: val }))
          setCurrentPage(1)
        }}
        options={[
          { value: 'ALL', label: isVi ? 'Tất cả phân hệ' : 'All Modules' },
          ...modulesList.map((mod) => ({
            value: mod,
            label: isVi ? `Phân hệ ${mod}` : `Module ${mod}`,
          })),
        ]}
        className="w-56"
      />

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
        onClick={onOpenCreatePerm}
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
    <DataTable<Permission>
      columns={columns}
      data={paginatedData}
      rowKey={(p) => p._id}
      isLoading={isLoading}
      emptyText={isVi ? 'Không tìm thấy quyền hạn nào phù hợp' : 'No matching permissions found'}
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
