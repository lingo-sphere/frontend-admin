// Bảng dữ liệu dùng chung (IpaDataTable) cho các module luyện tập.

import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Checkbox, DatePicker, Dropdown, Input, InputNumber, Space, Table } from 'antd'
import type { ColumnType, FilterDropdownProps } from 'antd/es/table/interface'
import { Filter, Columns3, Search, X, RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import { usePracticeText } from '@/features/practice/hooks/use.practice.text'
import type { useIpaTableState } from '@/features/practice/hooks/use.ipa.table-state'
import { Pagination } from '@/components/pagination'

export interface IpaColumn<T> extends ColumnType<T> {
  key: string; label: string
  filterKind?: 'text' | 'enum' | 'media' | 'date' | 'number' | 'tree'
  filterOptions?: SelectOption[]
  initiallyHidden?: boolean
}

function ColumnFilter({ kind, options, selectedKeys, setSelectedKeys, confirm, clearFilters }: FilterDropdownProps & { kind: string; options?: SelectOption[] }) {
  const p = usePracticeText()
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  return <div style={{ padding: 12, width: 280 }} onKeyDown={event => event.stopPropagation()}>
    {kind === 'number' ? <Space><InputNumber aria-label={isVi ? p("Từ") : "From"} placeholder={isVi ? p("Từ") : "From"} min={0} value={selectedKeys[0] ? Number(selectedKeys[0]) : null} onChange={value => setSelectedKeys([value === null ? '' : String(value), String(selectedKeys[1] || '')])} style={{ width: 115 }} /><InputNumber aria-label={isVi ? p("Đến") : "To"} placeholder={isVi ? p("Đến") : "To"} min={0} value={selectedKeys[1] ? Number(selectedKeys[1]) : null} onChange={value => setSelectedKeys([String(selectedKeys[0] || ''), value === null ? '' : String(value)])} style={{ width: 115 }} /></Space>
      : kind === 'tree' ? <CustomSelect aria-label={p("Giá trị lọc cột")} style={{ width: '100%' }} mode="multiple" allowClear placeholder={p("Chọn giá trị")} value={selectedKeys} options={options} onChange={value => setSelectedKeys(value === undefined ? [] : Array.isArray(value) ? value : [value])} />
      : kind === 'text' ? <Input aria-label={p("Lọc cột")} value={String(selectedKeys[0] || '')} onChange={event => setSelectedKeys(event.target.value ? [event.target.value] : [])} onPressEnter={() => confirm()} allowClear />
      : kind === 'date' ? <DatePicker.RangePicker value={selectedKeys.length === 2 ? [dayjs(String(selectedKeys[0])), dayjs(String(selectedKeys[1]))] : null} onChange={dates => setSelectedKeys(dates?.[0] && dates[1] ? [dates[0].startOf('day').toISOString(), dates[1].endOf('day').toISOString()] : [])} />
        : <CustomSelect aria-label={p("Giá trị lọc cột")} style={{ width: '100%' }} mode={kind === 'media' ? undefined : 'multiple'} allowClear placeholder={p("Chọn giá trị")} value={kind === 'media' ? selectedKeys[0] : selectedKeys} options={kind === 'media' ? [{ value: 'present', label: isVi ? p("Có media") : 'Has media' }, { value: 'missing', label: isVi ? p("Thiếu media") : 'Missing media' }] : options} onChange={value => setSelectedKeys(value === undefined ? [] : Array.isArray(value) ? value : [value])} />}
    <Space style={{ marginTop: 12 }}><Button type="primary" size="small" onClick={() => confirm()}>{isVi ? p("Áp dụng") : 'Apply'}</Button><Button size="small" onClick={() => clearFilters?.({ confirm: true })}>{isVi ? p("Xóa lọc") : 'Clear'}</Button></Space>
  </div>
}

export function IpaDataTable<T extends object>({ columns, items, total, loading, error, retry, state, extraFilters, searchLabel, searchPlaceholder }: {
  columns: IpaColumn<T>[]; items: T[]; total: number; loading: boolean; error: Error | null
  retry: () => unknown; state: ReturnType<typeof useIpaTableState>; extraFilters?: ReactNode; searchLabel?: string; searchPlaceholder?: string
}) {
  const p = usePracticeText()
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const resolvedSearchLabel = searchLabel || (isVi ? p("Tìm kiếm") : 'Search');
  const resolvedSearchPlaceholder = searchPlaceholder || (isVi ? p("Tìm kiếm nội dung...") : 'Search content...');
  const [visible, setVisible] = useState(() => columns.filter(column => !column.initiallyHidden).map(column => column.key))
  const allColumns = columns.filter(column => visible.includes(column.key) || column.key === 'actions').map(column => {
    const { filterKind, filterOptions, initiallyHidden: _hidden, label: _label, ...base } = column
    return { ...base, dataIndex: column.dataIndex || column.key, title: column.label, sorter: column.key !== 'actions', sortOrder: state.query.sort === column.key ? state.query.order === 'asc' ? 'ascend' as const : 'descend' as const : null,
      ...(filterKind ? { filteredValue: state.filters[column.key] || null, filterOnClose: false, filterIcon: (active: boolean) => <Filter size={13} color={active ? '#4f46e5' : undefined} />, filterDropdown: (props: FilterDropdownProps) => <ColumnFilter {...props} kind={filterKind} options={filterOptions} /> } : {}),
    }
  })
  return <div className="space-y-4">
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            aria-label={resolvedSearchLabel}
            value={state.search}
            onChange={(e) => state.setSearch(e.target.value)}
            placeholder={resolvedSearchPlaceholder}
            className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
          />
          {state.search && (
            <button
              type="button"
              onClick={() => state.setSearch('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {extraFilters}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={state.reset}
          className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isVi ? p("Đặt lại") : 'Reset'}</span>
        </button>
        <Dropdown
          trigger={['click']}
          popupRender={() => (
            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-3 shadow-xl backdrop-blur-xl">
              <Checkbox.Group
                value={visible}
                options={columns.filter(column => column.key !== 'actions').map(column => ({ label: column.label, value: column.key }))}
                onChange={values => setVisible(values.map(String))}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              />
            </div>
          )}
        >
          <button
            type="button"
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>{isVi ? p("Cột") : 'Columns'}</span>
          </button>
        </Dropdown>
      </div>
    </div>
    {error ? (
      <Alert type="error" showIcon title={isVi ? p("Không tải được dữ liệu") : "Failed to load data"} description={error.message} action={<Button onClick={() => retry()}>{isVi ? p("Thử lại") : "Retry"}</Button>} />
    ) : (
      <>
        <Table<T>
          rowKey={record => String((record as { _id?: string; id?: string })._id || (record as { id?: string }).id)}
          columns={allColumns}
          dataSource={items}
          loading={loading}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={false}
          onChange={(_pagination, filters, sorter, extra) => {
            if (extra.action === 'filter') {
              const next = { ...state.filters }
              Object.entries(filters).forEach(([key, values]) => { if (values?.length) next[key] = values.map(String); else delete next[key] })
              state.setFilters(next)
            }
            if (extra.action === 'sort') {
              const sort = Array.isArray(sorter) ? sorter[0] : sorter
              state.change({ sort: sort.order ? String(sort.columnKey) : undefined, order: sort.order === 'ascend' ? 'asc' : 'desc', page: '1' })
            }
          }}
        />
        {total > 0 && (
          <div className="pt-2">
            <Pagination
              currentPage={state.query.page}
              totalPages={Math.ceil(total / state.query.limit) || 1}
              totalItems={total}
              pageSize={state.query.limit}
              pageSizeOptions={[10, 20, 50, 100]}
              showTotal={true}
              onPageChange={(page) => state.change({ page: String(page) })}
              onPageSizeChange={(limit) => state.change({ limit: String(limit), page: '1' })}
            />
          </div>
        )}
      </>
    )}
  </div>
}
