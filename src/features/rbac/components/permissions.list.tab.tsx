// Component giao diện PermissionsListTab phục vụ khu vực Quản trị Admin.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Search, KeyRound } from 'lucide-react'
import type { Permission } from '@/types/api.types'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { CustomSelect } from '@/components/custom.select'
import { TableRowActions, renderTableDate } from '@/components/table.row.actions'
import { usePermissionsQuery } from '@/features/rbac/hooks/use.rbac.query'
import { useDebounce } from '@/hooks/use.debounce'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { toast } from '@/store/toast.store'

const RBAC_MODULES = [
  'AUTH',
  'USERS',
  'COURSES',
  'EXAMS',
  'PRACTICE',
  'PROGRESS',
  'COMMUNITY',
  'NOTIFICATIONS',
  'MEDIA',
  'AI',
  'ROLES',
  'PERMISSIONS',
]

interface PermissionsListTabProps {
  onOpenCreatePerm: () => void
  onOpenEditPerm: (perm: Permission) => void
  onDeletePerm: (permId: string) => Promise<void> | void
  onRefresh?: () => void
  isLoading?: boolean
}

export function PermissionsListTab({
  onOpenCreatePerm,
  onOpenEditPerm,
  onDeletePerm,
  onRefresh,
  isLoading = false,
}: PermissionsListTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [filterName, setFilterName] = useState('')
  const [filterApi, setFilterApi] = useState('')
  const [filterModule, setFilterModule] = useState('ALL')
  const debouncedName = useDebounce(filterName, 300)
  const debouncedApi = useDebounce(filterApi, 300)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const queryParams = useMemo(() => {
    return {
      current: currentPage,
      pageSize,
      name: debouncedName.trim() || undefined,
      api_path: debouncedApi.trim() || undefined,
      module: filterModule !== 'ALL' ? filterModule : undefined,
    }
  }, [currentPage, pageSize, debouncedName, debouncedApi, filterModule])

  const { data, isLoading: isQueryLoading, refetch } = usePermissionsQuery(queryParams)

  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(async () => {
    if (onRefresh) onRefresh()
    await refetch()
  })

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setCurrentPage(1)
  }

  const handleResetFilters = async () => {
    setFilterName('')
    setFilterApi('')
    setFilterModule('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
    await refetch()
    toast.success(isVi ? 'Đã đặt lại bộ lọc quyền hạn' : 'Permission filters reset')
  }

  const sortedPermissions = useMemo(() => {
    const list = data?.items || []
    if (!sortKey || !sortOrder) return list
    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        const comp = (a.name || '').localeCompare(b.name || '')
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'api_path') {
        const comp = (a.api_path || '').localeCompare(b.api_path || '')
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'method') {
        const comp = (a.method || '').localeCompare(b.method || '')
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'module') {
        const comp = (a.module || '').localeCompare(b.module || '')
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'created_at') {
        const timeA = new Date(a.created_at || '').getTime()
        const timeB = new Date(b.created_at || '').getTime()
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
      }
      if (sortKey === 'updated_at') {
        const timeA = new Date(a.updated_at || '').getTime()
        const timeB = new Date(b.updated_at || '').getTime()
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
      }
      return 0
    })
  }, [data?.items, sortKey, sortOrder])

  const modulesList = RBAC_MODULES

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
      align: 'center',
      width: '130px',
      sortable: true,
      render: (perm) => renderTableDate(perm.created_at),
    },
    {
      key: 'updated_at',
      title: isVi ? 'Ngày Cập Nhật' : 'Updated At',
      align: 'center',
      width: '130px',
      sortable: true,
      render: (perm) => renderTableDate(perm.updated_at),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Actions',
      width: '100px',
      align: 'center',
      render: (perm) => (
        <TableRowActions
          onEdit={() => onOpenEditPerm(perm)}
          onDelete={() => onDeletePerm(perm._id)}
          deleteTitle={isVi ? 'Xóa quyền hạn này?' : 'Delete this permission?'}
          deleteDescription={
            isVi
              ? 'Hành động này không thể hoàn tác.'
              : 'This action cannot be undone.'
          }
        />
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
        onClick={() => handleRefresh()}
        disabled={isRefreshing || isLoading || isQueryLoading}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-60"
        title={isVi ? 'Làm mới' : 'Refresh'}
      >
        <RotateCcw className={`w-4 h-4 ${isRefreshing || isLoading || isQueryLoading ? 'animate-spin text-blue-600' : ''}`} />
      </button>
    </div>
  )

  return (
    <DataTable<Permission>
      columns={columns}
      data={sortedPermissions}
      rowKey={(p) => p._id}
      isLoading={isLoading || isQueryLoading}
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
        totalItems: data?.total || 0,
        onPageChange: setCurrentPage,
        onPageSizeChange: (size) => {
          setPageSize(size)
          setCurrentPage(1)
        },
      }}
    />
  )
}
