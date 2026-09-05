/**
 * @file data.table.tsx
 * @description Component giao diện DataTable phục vụ khu vực Quản trị Admin
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TableControls,
  type TableDensity,
  type ColumnOption,
} from '@/components/common/table.controls'
import { Pagination } from '@/components/common/pagination'
import { Loader2, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'

export interface DataTableColumn<T> {
  key: string
  title: React.ReactNode
  render?: (record: T, index: number) => React.ReactNode
  dataIndex?: keyof T
  width?: string
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  sortable?: boolean
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

  sortKey?: string | null
  sortOrder?: 'asc' | 'desc' | null
  onSortChange?: (key: string, order: 'asc' | 'desc' | null) => void

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

  const handleHeaderClick = (colKey: string, isSortable?: boolean) => {
    if (!isSortable) return
    let nextOrder: 'asc' | 'desc' = 'asc'

    if (activeSortKey === colKey && activeSortOrder) {
      nextOrder = activeSortOrder === 'asc' ? 'desc' : 'asc'
    } else {
      if (data && data.length >= 2) {
        const col = columns.find((c) => c.key === colKey)
        const getVal = (item: T): unknown => {
          if (!item) return ''
          if (col?.dataIndex && item[col.dataIndex] !== undefined) {
            return item[col.dataIndex]
          }
          const rec = item as Record<string, unknown>
          if (colKey === 'user' || colKey === 'learner') return rec.full_name || rec.email
          if (colKey === 'info' || colKey === 'course') return rec.title || rec.name
          if (colKey === 'price') return rec.price ?? 0
          if (colKey === 'created_at') return rec.created_at
          if (colKey === 'updated_at') return rec.updated_at
          return rec[colKey]
        }

        const first = getVal(data[0])
        const last = getVal(data[data.length - 1])

        if (first !== undefined && first !== null && last !== undefined && last !== null) {
          let isCurrentAsc = false
          if (typeof first === 'number' && typeof last === 'number') {
            isCurrentAsc = first <= last
          } else {
            const strFirst = String(first).trim().toLowerCase()
            const strLast = String(last).trim().toLowerCase()
            const timeFirst = Date.parse(strFirst)
            const timeLast = Date.parse(strLast)
            if (!isNaN(timeFirst) && !isNaN(timeLast) && strFirst.length > 8) {
              isCurrentAsc = timeFirst <= timeLast
            } else {
              isCurrentAsc = strFirst.localeCompare(strLast) <= 0
            }
          }
          nextOrder = isCurrentAsc ? 'desc' : 'asc'
        } else {
          nextOrder = 'desc'
        }
      } else {
        nextOrder = 'desc'
      }
    }

    if (onSortChange) {
      onSortChange(colKey, nextOrder)
    } else {
      setInternalSortKey(colKey)
      setInternalSortOrder(nextOrder)
    }
  }

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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60">
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      onClick={() => handleHeaderClick(col.key, col.sortable)}
                      className={`py-3.5 px-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${
                        col.sortable
                          ? 'cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors'
                          : ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-2 text-[13.5px] sm:text-sm font-bold text-slate-800 dark:text-slate-100 ${
                          col.align === 'right'
                            ? 'justify-end'
                            : col.align === 'center'
                            ? 'justify-center'
                            : 'justify-start'
                        }`}
                      >
                        <span className="tracking-tight">{col.title}</span>
                        {col.sortable && (
                          <span className="shrink-0 transition-colors">
                            {activeSortKey === col.key && activeSortOrder === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />
                            ) : activeSortKey === col.key && activeSortOrder === 'desc' ? (
                              <ArrowDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />
                            ) : (
                              <ChevronsUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200 text-xs">
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
                      className={`border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-[background-color] duration-100 ${
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
