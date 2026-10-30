// Component bảng dữ liệu dùng chung (DataTable / AdminDataTable) chuẩn hóa giao diện cho toàn bộ Admin.

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Button,
  ConfigProvider,
  DatePicker,
  Input,
  InputNumber,
  Space,
  Table,
  type TableProps,
} from 'antd'
import type {
  ColumnType,
  FilterDropdownProps,
  TableRowSelection,
  FilterValue,
} from 'antd/es/table/interface'
import { Filter, Search, X, Plus, Minus } from 'lucide-react'
import dayjs from 'dayjs'
import {
  TableControls,
  type TableDensity,
  type ColumnOption,
} from '@/components/table.controls'
import { Pagination } from '@/components/pagination'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import type { useIpaTableState } from '@/features/practice/hooks/use.ipa.table-state'

export interface DataTableColumn<T> {
  key: string
  title?: ReactNode
  label?: string
  dataIndex?: (keyof T & (string | number)) | string
  render?: (record: T, index: number) => ReactNode
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  initiallyHidden?: boolean
  sortable?: boolean
  sorter?: boolean | ((a: T, b: T) => number)
  sticky?: 'left' | 'right'
  fixed?: 'left' | 'right' | boolean
  ellipsis?: boolean
  filterKind?: 'text' | 'enum' | 'media' | 'date' | 'number' | 'tree'
  filterOptions?: SelectOption[]
  filteredValue?: FilterValue | null
  onCell?: (record: T, rowIndex?: number) => React.HTMLAttributes<HTMLElement>
}

export interface IpaColumn<T> extends Omit<ColumnType<T>, 'title'> {
  key: string
  title?: ReactNode
  label?: string
  initiallyHidden?: boolean
  sortable?: boolean
  sticky?: 'left' | 'right'
  filterKind?: 'text' | 'enum' | 'media' | 'date' | 'number' | 'tree'
  filterOptions?: SelectOption[]
}

function isIpaColumn<T>(col: DataTableColumn<T> | IpaColumn<T>): col is IpaColumn<T> {
  return col.label !== undefined
}

export interface DataTableProps<T> {
  columns: (DataTableColumn<T> | IpaColumn<T>)[]
  data?: T[]
  items?: T[]
  dataSource?: T[]
  rowKey?: string | ((record: T) => string)
  isLoading?: boolean
  loading?: boolean
  error?: Error | null
  retry?: () => unknown
  emptyText?: string

  title?: ReactNode
  subtitle?: ReactNode
  filterSlot?: ReactNode
  extraFilters?: ReactNode
  extraActions?: ReactNode
  onResetFilters?: () => void | Promise<void>
  search?: string
  onSearchChange?: (val: string) => void
  searchLabel?: string
  searchPlaceholder?: string

  state?: ReturnType<typeof useIpaTableState>
  total?: number

  viewMode?: 'table' | 'grid'
  onViewModeChange?: (mode: 'table' | 'grid') => void
  renderGridItem?: (record: T, index: number) => ReactNode

  sortKey?: string | null
  sortOrder?: 'asc' | 'desc' | null
  onSortChange?: (key: string, order: 'asc' | 'desc' | null) => void

  rowSelection?: TableRowSelection<T>
  onRowClick?: (record: T) => void
  rowClassName?: string | ((record: T, index: number, indent: number) => string)

  scroll?: { x?: number | string | true; y?: number | string }
  className?: string
  hideTopBar?: boolean
  expandable?: TableProps<T>['expandable']

  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages?: number
    pageSizeOptions?: number[]
    showTotal?: boolean
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    onPrefetchPage?: (page: number) => void
  }
}

function normalizeWidth(width?: string | number): number | string | undefined {
  if (typeof width === 'number') return width
  if (!width) return undefined
  const match = width.match(/\[([0-9]+)(px)?\]/)
  if (match) return Number(match[1])
  const numMatch = width.match(/^([0-9]+)px$/)
  if (numMatch) return Number(numMatch[1])
  if (/^[0-9]+$/.test(width)) return Number(width)
  return width
}

function defaultCompare<T>(a: T, b: T, key: keyof T | string): number {
  const valA = (a as Record<string, unknown>)[String(key)]
  const valB = (b as Record<string, unknown>)[String(key)]
  if (valA === valB) return 0
  if (valA === null || valA === undefined) return -1
  if (valB === null || valB === undefined) return 1
  if (typeof valA === 'number' && typeof valB === 'number') return valA - valB
  return String(valA).localeCompare(String(valB))
}

function ColumnFilter({
  kind,
  options,
  selectedKeys,
  setSelectedKeys,
  confirm,
  clearFilters,
  isVi,
}: FilterDropdownProps & { kind: string; options?: SelectOption[]; isVi: boolean }) {
  return (
    <div style={{ padding: 12, width: 280 }} onKeyDown={(event) => event.stopPropagation()}>
      {kind === 'number' ? (
        <Space>
          <InputNumber
            aria-label={isVi ? 'Từ' : 'From'}
            placeholder={isVi ? 'Từ' : 'From'}
            min={0}
            value={selectedKeys[0] ? Number(selectedKeys[0]) : null}
            onChange={(value) =>
              setSelectedKeys([value === null ? '' : String(value), String(selectedKeys[1] || '')])
            }
            style={{ width: 115 }}
          />
          <InputNumber
            aria-label={isVi ? 'Đến' : 'To'}
            placeholder={isVi ? 'Đến' : 'To'}
            min={0}
            value={selectedKeys[1] ? Number(selectedKeys[1]) : null}
            onChange={(value) =>
              setSelectedKeys([String(selectedKeys[0] || ''), value === null ? '' : String(value)])
            }
            style={{ width: 115 }}
          />
        </Space>
      ) : kind === 'tree' ? (
        <CustomSelect
          aria-label={isVi ? 'Giá trị lọc cột' : 'Column filter value'}
          style={{ width: '100%' }}
          mode="multiple"
          allowClear
          placeholder={isVi ? 'Chọn giá trị' : 'Select values'}
          value={selectedKeys}
          options={options}
          onChange={(value) =>
            setSelectedKeys(value === undefined ? [] : Array.isArray(value) ? value : [value])
          }
        />
      ) : kind === 'text' ? (
        <Input
          aria-label={isVi ? 'Lọc cột' : 'Column filter'}
          value={String(selectedKeys[0] || '')}
          onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])}
          onPressEnter={() => confirm()}
          allowClear
        />
      ) : kind === 'date' ? (
        <DatePicker.RangePicker
          value={
            selectedKeys.length === 2
              ? [dayjs(String(selectedKeys[0])), dayjs(String(selectedKeys[1]))]
              : null
          }
          onChange={(dates) =>
            setSelectedKeys(
              dates?.[0] && dates[1]
                ? [dates[0].startOf('day').toISOString(), dates[1].endOf('day').toISOString()]
                : []
            )
          }
        />
      ) : (
        <CustomSelect
          aria-label={isVi ? 'Giá trị lọc cột' : 'Column filter value'}
          style={{ width: '100%' }}
          mode={kind === 'media' ? undefined : 'multiple'}
          allowClear
          placeholder={isVi ? 'Chọn giá trị' : 'Select value'}
          value={kind === 'media' ? selectedKeys[0] : selectedKeys}
          options={
            kind === 'media'
              ? [
                  { value: 'present', label: isVi ? 'Có media' : 'Has media' },
                  { value: 'missing', label: isVi ? 'Thiếu media' : 'Missing media' },
                ]
              : options
          }
          onChange={(value) =>
            setSelectedKeys(value === undefined ? [] : Array.isArray(value) ? value : [value])
          }
        />
      )}
      <Space style={{ marginTop: 12 }}>
        <Button type="primary" size="small" onClick={() => confirm()}>
          {isVi ? 'Áp dụng' : 'Apply'}
        </Button>
        <Button size="small" onClick={() => clearFilters?.({ confirm: true })}>
          {isVi ? 'Xóa lọc' : 'Clear'}
        </Button>
      </Space>
    </div>
  )
}

export function DataTable<T extends object>({
  columns,
  data,
  items,
  dataSource,
  rowKey,
  isLoading = false,
  loading,
  error = null,
  retry,
  emptyText,
  title,
  subtitle,
  filterSlot,
  extraFilters,
  extraActions,
  onResetFilters,
  search,
  onSearchChange,
  searchLabel,
  searchPlaceholder,
  state,
  total,
  viewMode = 'table',
  onViewModeChange,
  renderGridItem,
  sortKey,
  sortOrder,
  onSortChange,
  rowSelection,
  onRowClick,
  rowClassName,
  scroll,
  className,
  hideTopBar = false,
  expandable,
  pagination,
}: DataTableProps<T>) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const effectiveData = useMemo(() => {
    return data ?? items ?? dataSource ?? []
  }, [data, items, dataSource])

  const effectiveLoading = Boolean(loading ?? isLoading)
  const resolvedEmptyText = emptyText || (isVi ? 'Không tìm thấy dữ liệu nào phù hợp' : 'No matching data found')
  const resolvedSearchLabel = searchLabel || (isVi ? 'Tìm kiếm' : 'Search')
  const resolvedSearchPlaceholder = searchPlaceholder || (isVi ? 'Tìm kiếm nội dung...' : 'Search content...')

  const [density, setDensity] = useState<TableDensity>('middle')
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null)
  const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc' | null>(null)

  const activeSortKey = sortKey !== undefined ? sortKey : internalSortKey
  const activeSortOrder = sortOrder !== undefined ? sortOrder : internalSortOrder

  const mergedExpandable = useMemo(() => {
    return {
      ...expandable,
      expandIcon: (props: {
        prefixCls: string
        expanded: boolean
        record: T
        expandable: boolean
        onExpand: (record: T, e: React.MouseEvent<HTMLElement>) => void
      }) => {
        if (expandable?.expandIcon) {
          return expandable.expandIcon(props)
        }
        if (!props.expandable) {
          return (
            <span
              className="ant-table-row-expand-icon-spaced inline-block w-[18px] h-[18px] mr-2 shrink-0 align-middle"
              aria-hidden="true"
            />
          )
        }
        return (
          <button
            type="button"
            onClick={(e) => {
              props.onExpand(props.record, e)
              e.stopPropagation()
            }}
            className="inline-flex items-center justify-center w-[18px] h-[18px] rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs transition-colors cursor-pointer select-none mr-2 shrink-0 align-middle leading-none focus:outline-none"
            aria-label={props.expanded ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Mở rộng' : 'Expand')}
          >
            {props.expanded ? (
              <Minus size={11} strokeWidth={2.5} className="shrink-0" />
            ) : (
              <Plus size={11} strokeWidth={2.5} className="shrink-0" />
            )}
          </button>
        )
      },
    }
  }, [expandable, isVi])

  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(() =>
    columns.map((col) => ({
      key: col.key,
      label: col.label || (typeof col.title === 'string' ? col.title : col.key),
      visible: !(col.hidden || col.initiallyHidden),
    }))
  )

  useEffect(() => {
    setColumnOptions((prev) => {
      const prevMap = new Map(prev.map((p) => [p.key, p.visible]))
      return columns.map((col) => ({
        key: col.key,
        label: col.label || (typeof col.title === 'string' ? col.title : col.key),
        visible: prevMap.has(col.key)
          ? prevMap.get(col.key)!
          : !(col.hidden || col.initiallyHidden),
      }))
    })
  }, [columns])

  const visibleKeys = useMemo(
    () => new Set(columnOptions.filter((c) => c.visible).map((c) => c.key)),
    [columnOptions]
  )

  const densityTokens: Record<TableDensity, Record<string, number | string>> = {
    compact: {
      cellPaddingBlockMD: 6,
      cellPaddingInlineMD: 10,
      cellPaddingBlockSM: 4,
      cellPaddingInlineSM: 8,
      cellPaddingBlock: 6,
      cellPaddingInline: 10,
      borderColor: 'rgba(226, 232, 240, 0.8)',
    },
    middle: {
      cellPaddingBlockMD: 9,
      cellPaddingInlineMD: 14,
      cellPaddingBlockSM: 8,
      cellPaddingInlineSM: 12,
      cellPaddingBlock: 9,
      cellPaddingInline: 14,
      borderColor: 'rgba(226, 232, 240, 0.8)',
    },
    comfortable: {
      cellPaddingBlockMD: 14,
      cellPaddingInlineMD: 16,
      cellPaddingBlockSM: 10,
      cellPaddingInlineSM: 14,
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
      borderColor: 'rgba(226, 232, 240, 0.8)',
    },
  }

  const antdSize = density === 'compact' ? 'small' : density === 'comfortable' ? 'large' : 'middle'

  const effectiveRowKey = (record: T): string => {
    if (typeof rowKey === 'function') return rowKey(record)
    if (typeof rowKey === 'string') return String((record as Record<string, unknown>)[rowKey] ?? '')
    const rec = record as { _id?: string; id?: string }
    return String(rec._id || rec.id || '')
  }

  const handleResetFiltersInternal = async () => {
    setColumnOptions(
      columns.map((col) => ({
        key: col.key,
        label: col.label || (typeof col.title === 'string' ? col.title : col.key),
        visible: !(col.hidden || col.initiallyHidden),
      }))
    )
    setDensity('middle')
    setInternalSortKey(null)
    setInternalSortOrder(null)
    if (state) {
      state.reset()
    }
    if (onResetFilters) {
      await onResetFilters()
    }
  }

  const hasSearch = Boolean(state || onSearchChange || search !== undefined)
  const effectiveSearch = state ? state.search : (search || '')
  const handleSearchChange = (val: string) => {
    if (state) state.setSearch(val)
    else onSearchChange?.(val)
  }

  const antdColumns = useMemo<ColumnType<T>[]>(() => {
    return columns
      .filter((col) => visibleKeys.has(col.key) || col.key === 'actions' || col.key === 'action')
      .map((col) => {
        const isActionsCol = col.key === 'actions' || col.key === 'action'
        const isSortable =
          col.sortable !== undefined
            ? Boolean(col.sortable)
            : col.sorter !== undefined
            ? Boolean(col.sorter)
            : !isActionsCol

        const isColActive = state
          ? state.query.sort === col.key || (col.dataIndex && String(col.dataIndex) === state.query.sort)
          : activeSortKey === col.key || (col.dataIndex && String(col.dataIndex) === activeSortKey)

        const effectiveOrder = state ? state.query.order : activeSortOrder
        const currentSortOrderForCol = isColActive
          ? effectiveOrder === 'asc'
            ? ('ascend' as const)
            : ('descend' as const)
          : null

        const normalizedW = normalizeWidth(col.width)
        const isStickyLeft = col.sticky === 'left' || col.fixed === 'left'
        const isStickyRight =
          col.sticky === 'right' || col.fixed === 'right' || (isActionsCol && col.fixed !== false)

        const isIpa = isIpaColumn(col)
        const effectiveDataIndex = (
          col.dataIndex
            ? String(col.dataIndex)
            : isIpa
            ? col.key
            : col.render
            ? undefined
            : col.key
        ) as (keyof T & (string | number)) | undefined

        const minW = col.minWidth ? normalizeWidth(col.minWidth) : undefined
        const antdCol: ColumnType<T> = {
          key: col.key,
          dataIndex: effectiveDataIndex,
          title: col.title ?? col.label ?? col.key,
          width: normalizedW,
          align: col.align || (isActionsCol ? 'center' : 'left'),
          ellipsis: col.ellipsis,
          fixed: isStickyRight ? 'right' : isStickyLeft ? 'left' : undefined,
          sortDirections: isSortable ? ['ascend', 'descend', 'ascend'] : undefined,
          showSorterTooltip: false,
          onHeaderCell: () => ({
            style: {
              textAlign: 'center',
              ...(minW ? { minWidth: minW } : {}),
            },
            className: '!text-center',
          }),
          onCell: (record: T, rowIndex?: number) => {
            const userCell = 'onCell' in col && typeof col.onCell === 'function' ? col.onCell(record, rowIndex) : {}
            return {
              ...userCell,
              style: minW ? { minWidth: minW, ...(userCell?.style as React.CSSProperties | undefined) } : userCell?.style,
            }
          },
          sorter: isSortable
            ? onSortChange || state
              ? true
              : typeof col.sorter === 'function'
              ? col.sorter
              : (a: T, b: T) => defaultCompare(a, b, String(col.dataIndex || col.key))
            : false,
          sortOrder: currentSortOrderForCol,
          render: (value: unknown, record: T, index: number) => {
            if (!col.render) {
              return (value !== undefined && value !== null ? String(value) : '') as ReactNode
            }
            if (isIpa) {
              const cellValue =
                value === record
                  ? (record as Record<string, unknown>)[col.key]
                  : value !== undefined
                  ? value
                  : (record as Record<string, unknown>)[col.key]
              return col.render(cellValue, record, index)
            }
            return col.render(record, index)
          },
          ...(col.filterKind
            ? {
                filteredValue: (state?.filters[col.key] || col.filteredValue || null) as FilterValue | null,
                filterOnClose: false,
                filterIcon: (active: boolean) => (
                  <Filter size={13} color={active ? '#4f46e5' : undefined} />
                ),
                filterDropdown: (dropdownProps: FilterDropdownProps) => (
                  <ColumnFilter
                    {...dropdownProps}
                    kind={col.filterKind!}
                    options={col.filterOptions}
                    isVi={isVi}
                  />
                ),
              }
            : {}),
        }
        return antdCol
      })
  }, [columns, visibleKeys, state, activeSortKey, activeSortOrder, onSortChange, isVi])

  const totalCount = pagination ? pagination.totalItems : total ?? effectiveData.length
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize) || 1
    : state && total !== undefined
    ? Math.ceil(total / state.query.limit) || 1
    : 1

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          {extraActions && <div className="flex items-center gap-2.5">{extraActions}</div>}
        </div>
      )}

      {!hideTopBar && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {hasSearch && (
              <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="text"
                  aria-label={resolvedSearchLabel}
                  value={effectiveSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={resolvedSearchPlaceholder}
                  className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
                />
                {effectiveSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            {filterSlot}
            {extraFilters}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <TableControls
              density={density}
              onDensityChange={setDensity}
              columns={columnOptions}
              onColumnsChange={setColumnOptions}
              viewMode={renderGridItem ? viewMode : undefined}
              onViewModeChange={onViewModeChange}
              onResetFilters={handleResetFiltersInternal}
              totalCount={totalCount}
            />
            {!title && !subtitle && extraActions && (
              <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200/80 dark:border-slate-800">
                {extraActions}
              </div>
            )}
          </div>
        </div>
      )}

      {error ? (
        <Alert
          type="error"
          showIcon
          title={isVi ? 'Không tải được dữ liệu' : 'Failed to load data'}
          description={error.message}
          action={
            retry ? (
              <Button onClick={() => void retry()}>{isVi ? 'Thử lại' : 'Retry'}</Button>
            ) : undefined
          }
        />
      ) : viewMode === 'grid' && renderGridItem ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {effectiveLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`skeleton-card-${idx}`}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                <div className="h-8 w-1/2 rounded-md bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                <div className="h-3.5 w-full rounded-md bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
              </div>
            ))
          ) : effectiveData.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              {resolvedEmptyText}
            </div>
          ) : (
            effectiveData.map((record, index) => renderGridItem(record, index))
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs [&_.ant-table]:!bg-transparent [&_.ant-table-container]:!bg-transparent [&_.ant-table-thead_th]:!whitespace-nowrap [&_.ant-table-thead_th]:!text-center [&_.ant-table-thead_.ant-table-column-title]:!whitespace-nowrap [&_.ant-table-thead_.ant-table-filter-column]:!justify-center [&_.ant-table-thead_.ant-table-filter-column]:!gap-1.5 [&_.ant-table-thead_.ant-table-column-sorters]:!flex [&_.ant-table-thead_.ant-table-column-sorters]:!flex-nowrap [&_.ant-table-thead_.ant-table-column-sorters]:!justify-center [&_.ant-table-thead_.ant-table-column-sorters]:!items-center [&_.ant-table-thead_.ant-table-column-sorters]:!gap-1.5 [&_.ant-table-thead_.ant-table-column-sorters]:!w-full [&_.ant-table-thead_.ant-table-column-sorters]:!cursor-pointer [&_.ant-table-thead_.ant-table-column-sorters]:!select-none [&_.ant-table-thead_.ant-table-column-sorter]:!shrink-0 [&_.ant-table-thead_.ant-table-filter-trigger]:!shrink-0 [&_.ant-table-thead_.ant-table-filter-trigger]:!m-0 [&_.ant-table-thead_.ant-table-filter-trigger]:!ml-0.5 [&_.ant-table-row-indent]:!float-none [&_.ant-table-row-indent]:!inline-block [&_.ant-table-row-indent]:!align-middle [&_.ant-table-cell-with-append]:!align-middle [&_.ant-table-cell-with-append>div]:!inline-flex [&_.ant-table-cell-with-append>div]:!align-middle [&_.ant-table-row-expand-icon]:!float-none [&_.ant-table-row-expand-icon]:!inline-flex [&_.ant-table-row-expand-icon]:!items-center [&_.ant-table-row-expand-icon]:!justify-center [&_.ant-table-row-expand-icon]:!align-middle [&_.ant-table-row-expand-icon]:!m-0 [&_.ant-table-row-expand-icon]:!mr-2">
          <ConfigProvider theme={{ components: { Table: densityTokens[density] } }}>
            <Table<T>
              rowKey={effectiveRowKey}
              columns={antdColumns}
              dataSource={effectiveData}
              loading={effectiveLoading}
              size={antdSize}
              scroll={{ x: scroll?.x ?? 'max-content', y: scroll?.y }}
              pagination={false}
              rowSelection={rowSelection}
              rowClassName={rowClassName}
              expandable={mergedExpandable}
              sortDirections={['ascend', 'descend', 'ascend']}
              showSorterTooltip={false}
              locale={{
                emptyText: (
                  <div className="py-12 text-center text-xs text-slate-400">
                    {resolvedEmptyText}
                  </div>
                ),
              }}
              onRow={
                onRowClick
                  ? (record) => ({
                      onClick: (e: React.MouseEvent) => {
                        const target = e.target as HTMLElement | null
                        if (
                          target?.closest(
                            'button, a, input, textarea, select, [role="button"], .ant-btn, .ant-popover, .ant-popconfirm, .ant-dropdown, .ant-switch, .ant-checkbox, .ant-radio, .ant-select, [data-no-row-click]'
                          )
                        ) {
                          return
                        }
                        onRowClick(record)
                      },
                      className:
                        'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors',
                    })
                  : undefined
              }
              onChange={(_p, filters, sorter, extra) => {
                if (extra.action === 'filter' && state) {
                  const next = { ...state.filters }
                  Object.entries(filters).forEach(([key, values]) => {
                    if (values?.length) next[key] = values.map(String)
                    else delete next[key]
                  })
                  state.setFilters(next)
                }
                if (extra.action === 'sort') {
                  const sort = Array.isArray(sorter) ? sorter[0] : sorter
                  const colKey = String(sort?.columnKey || sort?.field || sort?.column?.key || '')
                  if (!colKey) return

                  const currentActiveKey = state ? state.query.sort : activeSortKey
                  const currentActiveOrder = state ? state.query.order : activeSortOrder

                  const isSameColumn = Boolean(
                    currentActiveKey &&
                      (currentActiveKey === colKey ||
                        (sort?.column?.key && String(sort.column.key) === currentActiveKey) ||
                        (sort?.field && String(sort.field) === currentActiveKey) ||
                        (sort?.column?.dataIndex && String(sort.column.dataIndex) === currentActiveKey))
                  )

                  const nextOrder: 'asc' | 'desc' = isSameColumn
                    ? currentActiveOrder === 'asc'
                      ? 'desc'
                      : 'asc'
                    : 'asc'

                  if (state) {
                    state.change({ sort: colKey, order: nextOrder, page: '1' })
                  } else if (onSortChange) {
                    onSortChange(colKey, nextOrder)
                  } else {
                    setInternalSortKey(colKey)
                    setInternalSortOrder(nextOrder)
                  }
                }
              }}
            />
          </ConfigProvider>
        </div>
      )}

      {pagination && pagination.totalItems > 0 ? (
        <div className="pt-2">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={true}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            onPrefetchPage={pagination.onPrefetchPage}
          />
        </div>
      ) : state && total !== undefined && total > 0 ? (
        <div className="pt-2">
          <Pagination
            currentPage={state.query.page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={state.query.limit}
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={true}
            onPageChange={(page) => state.change({ page: String(page) })}
            onPageSizeChange={(limit) => state.change({ limit: String(limit), page: '1' })}
          />
        </div>
      ) : null}
    </div>
  )
}

export { DataTable as AdminDataTable, DataTable as IpaDataTable }
