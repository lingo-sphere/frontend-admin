import { useState, useMemo } from 'react'
import { Plus, RotateCcw, Edit2, Trash2, SlidersHorizontal, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import type { Permission } from '@/types/api.types'
import { Pagination } from '@/components/common/Pagination'

interface PermissionsListTabProps {
  permissions: Permission[]
  onOpenCreatePerm: () => void
  onOpenEditPerm: (perm: Permission) => void
  onDeletePerm: (permId: string) => void
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
  const [filterName, setFilterName] = useState('')
  const [filterApi, setFilterApi] = useState('')
  const [filterModule, setFilterModule] = useState('ALL')
  const [isExpandedFilter, setIsExpandedFilter] = useState(false)

  // Applied search states
  const [searchQuery, setSearchQuery] = useState({ name: '', api: '', module: 'ALL' })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchQuery({
      name: filterName.trim().toLowerCase(),
      api: filterApi.trim().toLowerCase(),
      module: filterModule,
    })
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFilterName('')
    setFilterApi('')
    setFilterModule('ALL')
    setSearchQuery({ name: '', api: '', module: 'ALL' })
    setCurrentPage(1)
  }

  const modulesList = useMemo(() => {
    const set = new Set(permissions.map((p) => (p.module || 'GENERAL').toUpperCase()))
    return Array.from(set).sort()
  }, [permissions])

  const filteredData = useMemo(() => {
    return permissions.filter((p) => {
      const matchName = !searchQuery.name || p.name.toLowerCase().includes(searchQuery.name)
      const matchApi = !searchQuery.api || (p.api_path || '').toLowerCase().includes(searchQuery.api)
      const matchModule = searchQuery.module === 'ALL' || (p.module || '').toUpperCase() === searchQuery.module
      return matchName && matchApi && matchModule
    })
  }, [permissions, searchQuery])

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const getMethodBadgeClass = (method?: string) => {
    switch (method?.toUpperCase()) {
      case 'POST':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 font-bold'
      case 'PUT':
      case 'PATCH':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 font-bold'
      case 'DELETE':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 font-bold'
      case 'GET':
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 font-bold'
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

  return (
    <div className="space-y-4">
      {/* 1. Filter Card (HoiDanIT Style) */}
      <form
        onSubmit={handleSearch}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
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
              className="h-9 w-52 sm:w-64 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
              API:
            </span>
            <input
              type="text"
              value={filterApi}
              onChange={(e) => setFilterApi(e.target.value)}
              placeholder="nhập dữ liệu"
              className="h-9 w-52 sm:w-64 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-mono"
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
            <button
              type="button"
              onClick={() => setIsExpandedFilter(!isExpandedFilter)}
              className="flex items-center gap-1 h-9 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>{isExpandedFilter ? 'Thu gọn' : 'Mở rộng'}</span>
              {isExpandedFilter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpandedFilter && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-12 text-right">
              Module:
            </span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả Module</option>
              {modulesList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>

      {/* 2. Main Data Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Danh sách Permissions (Quyền Hạn)
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreatePerm}
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

            <button
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Tùy chỉnh cột"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Cài đặt bảng"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4 min-w-[180px]">Name</th>
                <th className="py-3 px-4 min-w-[200px]">API</th>
                <th className="py-3 px-4 w-28">Method</th>
                <th className="py-3 px-4 w-32">Module</th>
                <th className="py-3 px-4 min-w-[150px]">CreatedAt</th>
                <th className="py-3 px-4 min-w-[150px]">UpdatedAt</th>
                <th className="py-3 px-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy Permission nào phù hợp
                  </td>
                </tr>
              ) : (
                paginatedData.map((perm, index) => {
                  const itemIndex = (currentPage - 1) * pageSize + index + 1
                  return (
                    <tr
                      key={perm._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500 font-semibold">
                        {itemIndex}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {perm.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {perm.api_path || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${getMethodBadgeClass(
                            perm.method,
                          )}`}
                        >
                          {perm.method || 'GET'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                          {(perm.module || 'GENERAL').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDate(perm.created_at)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDate(perm.updated_at)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenEditPerm(perm)}
                            className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePerm(perm._id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Hiển thị <strong>{paginatedData.length}</strong> / <strong>{totalItems}</strong> quyền hạn (Tổng <strong>{permissions.length}</strong>)
          </span>

          {totalItems > 0 && (
            <div className="w-full sm:w-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 20, 50, 100]}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                showTotal={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
