// Component giao diện DataTable được vận hành bởi TanStack Table phục vụ khu vực Quản trị Admin.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  createColumnHelper,
} from '@tanstack/react-table'
import {
  TableControls,
  type TableDensity,
  type ColumnOption,
} from '@/components/table.controls'
import { Pagination } from '@/components/pagination'
import { Loader2, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'

export { createColumnHelper }
export type { ColumnDef }

export interface DataTableColumn<T> {
  key: string
  title: React.ReactNode
  render?: (record: T, index: number) => React.ReactNode
  dataIndex?: keyof T
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  sortable?: boolean
  sticky?: 'left' | 'right'
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
  onResetFilters?: () => void | Promise<void>

  viewMode?: 'table' | 'grid'
  onViewModeChange?: (mode: 'table' | 'grid') => void
  renderGridItem?: (record: T, index: number) => React.ReactNode

  sortKey?: string | null
  sortOrder?: 'asc' | 'desc' | null
  onSortChange?: (key: string, order: 'asc' | 'desc' | null) => void

  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    onPrefetchPage?: (page: number) => void
  }

  onRowClick?: (record: T) => void
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey = (record) => {
    const rec = record as { _id?: string; user_id?: string; id?: string }
    return rec._id || rec.user_id || rec.id || ''
  },
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
  sortKey,
  sortOrder,
  onSortChange,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const resolvedEmptyText = emptyText || (isVi ? 'Không tìm thấy dữ liệu nào phù hợp' : 'No matching data found')

  const [internalSortKey, setInternalSortKey] = useState<string | null>(null)
  const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc' | null>(null)

  const activeSortKey = sortKey !== undefined ? sortKey : internalSortKey
  const activeSortOrder = sortOrder !== undefined ? sortOrder : internalSortOrder

  const [density, setDensity] = useState<TableDensity>('middle')

  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(() =>
    columns.map((col) => ({
      key: col.key,
      label: typeof col.title === 'string' ? col.title : col.key,
      visible: !col.hidden,
    }))
  )

  const columnVisibility = useMemo<VisibilityState>(() => {
    const visibility: VisibilityState = {}
    columnOptions.forEach((c) => {
      visibility[c.key] = c.visible
    })
    return visibility
  }, [columnOptions])

  const tanstackColumns = useMemo<ColumnDef<T>[]>(() => {
    return columns.map((col) => {
      const def: ColumnDef<T> = {
        id: col.key,
        header: () => col.title,
        cell: (info) => {
          const row = info.row.original
          if (col.render) {
            return col.render(row, info.row.index)
          }
          if (col.dataIndex) {
            const val = row[col.dataIndex]
            return val !== undefined && val !== null ? String(val) : ''
          }
          const rec = row as Record<string, unknown>
          const val = rec[col.key]
          return val !== undefined && val !== null ? String(val) : ''
        },
        enableSorting: Boolean(col.sortable),
      }
      return def
    })
  }, [columns])

  const sorting = useMemo<SortingState>(() => {
    if (!activeSortKey || !activeSortOrder) return []
    return [{ id: activeSortKey, desc: activeSortOrder === 'desc' }]
  }, [activeSortKey, activeSortOrder])

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater
      if (nextSorting.length > 0) {
        const item = nextSorting[0]
        const order = item.desc ? 'desc' : 'asc'
        if (onSortChange) {
          onSortChange(item.id, order)
        } else {
          setInternalSortKey(item.id)
          setInternalSortOrder(order)
        }
      } else {
        if (onSortChange) {
          onSortChange('', null)
        } else {
          setInternalSortKey(null)
          setInternalSortOrder(null)
        }
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: onSortChange ? undefined : getSortedRowModel(),
    manualSorting: Boolean(onSortChange),
    manualPagination: true,
  })

  const getCellPadding = () => {
    if (density === 'compact') return 'py-2 px-4'
    if (density === 'comfortable') return 'py-5 px-4'
    return 'py-3.5 px-4'
  }

  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize) || 1
    : 1

  const handleResetFiltersInternal = async () => {
    setColumnOptions(
      columns.map((col) => ({
        key: col.key,
        label: typeof col.title === 'string' ? col.title : col.key,
        visible: !col.hidden,
      }))
    )
    setDensity('middle')
    setInternalSortKey(null)
    setInternalSortOrder(null)
    if (onResetFilters) {
      await onResetFilters()
    }
  }

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
          onResetFilters={onResetFilters ? handleResetFiltersInternal : undefined}
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
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60">
                    {headerGroup.headers.map((header) => {
                      const col = columns.find((c) => c.key === header.id)
                      const isStickyRight = col?.sticky === 'right'
                      const isStickyLeft = col?.sticky === 'left'
                      const isSortable = header.column.getCanSort()
                      const sortState = header.column.getIsSorted()

                      return (
                        <th
                          key={header.id}
                          style={{ width: col?.width, minWidth: col?.minWidth }}
                          onClick={header.column.getToggleSortingHandler()}
                          className={`py-3.5 px-3.5 whitespace-nowrap ${
                            col?.align === 'right'
                              ? 'text-right'
                              : col?.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          } ${
                            isSortable
                              ? 'cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors'
                              : ''
                          } ${
                            isStickyRight
                              ? 'sticky right-0 bg-slate-50/95 dark:bg-slate-950/95 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.4)]'
                              : isStickyLeft
                              ? 'sticky left-0 bg-slate-50/95 dark:bg-slate-950/95 z-20 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_6px_-2px_rgba(0,0,0,0.4)]'
                              : ''
                          }`}
                        >
                          <div
                            className={`inline-flex items-center gap-1.5 text-[13px] sm:text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap ${
                              col?.align === 'right'
                                ? 'justify-end'
                                : col?.align === 'center'
                                ? 'justify-center'
                                : 'justify-start'
                            }`}
                          >
                            <span className="tracking-tight whitespace-nowrap">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {isSortable && (
                              <span className="shrink-0 transition-colors">
                                {sortState === 'asc' ? (
                                  <ArrowUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />
                                ) : sortState === 'desc' ? (
                                  <ArrowDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />
                                ) : (
                                  <ChevronsUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200 text-xs">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={table.getVisibleLeafColumns().length || 1}
                      className="py-16 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-xs">{isVi ? 'Đang tải dữ liệu...' : 'Loading data...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getVisibleLeafColumns().length || 1}
                      className="py-16 text-center text-slate-400"
                    >
                      {resolvedEmptyText}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={rowKey(row.original)}
                      onClick={() => onRowClick && onRowClick(row.original)}
                      className={`group border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-[background-color] duration-100 ${
                        onRowClick ? 'cursor-pointer' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const col = columns.find((c) => c.key === cell.column.id)
                        const isStickyRight = col?.sticky === 'right'
                        const isStickyLeft = col?.sticky === 'left'

                        return (
                          <td
                            key={cell.id}
                            style={{ width: col?.width, minWidth: col?.minWidth }}
                            className={`${getCellPadding()} ${
                              col?.align === 'right'
                                ? 'text-right'
                                : col?.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            } ${
                              isStickyRight
                                ? 'sticky right-0 bg-white group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800/80 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.4)] transition-colors'
                                : isStickyLeft
                                ? 'sticky left-0 bg-white group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800/80 z-10 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_6px_-2px_rgba(0,0,0,0.4)] transition-colors'
                                : ''
                            }`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        )
                      })}
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
          onPrefetchPage={pagination.onPrefetchPage}
        />
      )}
    </div>
  )
}
