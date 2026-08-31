import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TableControls,
  type TableDensity,
  type ColumnOption,
} from '@/components/common/TableControls'
import { Pagination } from '@/components/common/Pagination'
import { Loader2 } from 'lucide-react'

export interface DataTableColumn<T> {
  key: string
  title: React.ReactNode
  render?: (record: T, index: number) => React.ReactNode
  dataIndex?: keyof T
  width?: string
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey?: (record: T) => string
  isLoading?: boolean
  emptyText?: string

  title?: React.ReactNode
  subtitle?: React.ReactNode
  filterSlot?: React.ReactNode
  extraActions?: React.ReactNode
  onResetFilters?: () => void

  viewMode?: 'table' | 'grid'
  onViewModeChange?: (mode: 'table' | 'grid') => void
  renderGridItem?: (record: T, index: number) => React.ReactNode

  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
  }

  onRowClick?: (record: T) => void
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey = (record) => (record as { _id?: string; id?: string })._id || (record as { _id?: string; id?: string }).id || String(Math.random()),
  isLoading = false,
  emptyText,
  title,
  subtitle,
  filterSlot,
  extraActions,
  onResetFilters,
  viewMode = 'table',
  onViewModeChange,
  renderGridItem,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const resolvedEmptyText = emptyText || (isVi ? 'Không tìm thấy dữ liệu nào phù hợp' : 'No matching data found')

  const [density, setDensity] = useState<TableDensity>('middle')

  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(() =>
    columns.map((col) => ({
      key: col.key,
      label: typeof col.title === 'string' ? col.title : col.key,
      visible: !col.hidden,
    }))
  )

  const visibleColumns = useMemo(() => {
    const visibleKeys = new Set(
      columnOptions.filter((c) => c.visible).map((c) => c.key)
    )
    return columns.filter((col) => visibleKeys.has(col.key))
  }, [columns, columnOptions])

  const getCellPadding = () => {
    if (density === 'compact') return 'py-2 px-4'
    if (density === 'comfortable') return 'py-5 px-4'
    return 'py-3.5 px-4'
  }

  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize) || 1
    : 1

  return (
    <div className="space-y-4">

      {(title || extraActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {extraActions && (
            <div className="flex items-center gap-2.5">{extraActions}</div>
          )}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {filterSlot}
        </div>

        <TableControls
          density={density}
          onDensityChange={setDensity}
          columns={columnOptions}
          onColumnsChange={setColumnOptions}
          viewMode={renderGridItem ? viewMode : undefined}
          onViewModeChange={onViewModeChange}
          onResetFilters={onResetFilters}
          totalCount={pagination ? pagination.totalItems : data.length}
        />
      </div>

      {viewMode === 'grid' && renderGridItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">{isVi ? 'Đang tải dữ liệu...' : 'Loading data...'}</span>
            </div>
          ) : data.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              {resolvedEmptyText}
            </div>
          ) : (
            data.map((record, idx) => (
              <div key={rowKey(record)}>{renderGridItem(record, idx)}</div>
            ))
          )}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-semibold">
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={`py-3.5 px-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="py-16 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-xs">{isVi ? 'Đang tải dữ liệu...' : 'Loading data...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="py-16 text-center text-slate-400"
                    >
                      {resolvedEmptyText}
                    </td>
                  </tr>
                ) : (
                  data.map((record, index) => (
                    <tr
                      key={rowKey(record)}
                      onClick={() => onRowClick && onRowClick(record)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                        onRowClick ? 'cursor-pointer' : ''
                      }`}
                    >
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={`${getCellPadding()} ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {col.render
                            ? col.render(record, index)
                            : col.dataIndex
                            ? String(record[col.dataIndex] ?? '')
                            : null}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && pagination.totalItems > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  )
}
