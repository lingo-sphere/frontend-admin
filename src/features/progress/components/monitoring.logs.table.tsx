// Bảng hiển thị luồng log thời gian thực từ ClickHouse SQL.

import React, { useState } from 'react'
import {
  Filter,
  Loader2,
  Search,
  Server,
  SlidersHorizontal,
  Columns3,
  ChevronDown,
  RotateCcw,
  X,
} from 'lucide-react'
import { Dropdown, Checkbox } from 'antd'
import { Pagination } from '@/components/pagination'
import type { BetterStackLogItem } from '@/types/api.types'

interface MonitoringLogsTableProps {
  liveLogs: BetterStackLogItem[]
  isLoading: boolean
  isVi: boolean
  totalLogs: number
  currentPage: number
  totalPages: number
  currentLimit: number
  autoRefreshInterval: number
  searchInput: string
  serverLevel?: string
  onSearchInputChange: (val: string) => void
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  onLevelChange: (lvl: string) => void
  onLimitChange: (limit: number) => void
  onPageChange: (page: number) => void
}

const formatLogTimestamp = (ts: string) => {
  if (!ts) return '—'
  try {
    const rawIso = ts.includes('Z') || ts.includes('+') ? ts : ts.replace(' ', 'T') + 'Z'
    const d = new Date(rawIso)
    if (isNaN(d.getTime())) return ts

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    const secs = String(d.getSeconds()).padStart(2, '0')
    const millis = String(d.getMilliseconds()).padStart(3, '0')

    return `${year}-${month}-${day} ${hours}:${mins}:${secs}.${millis}`
  } catch {
    return ts
  }
}

const getLevelBadgeClass = (level: string) => {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
    case 'WARN':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
    default:
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
  }
}

const DENSITY_LABELS: Record<'compact' | 'normal' | 'comfortable', string> = {
  compact: 'Gọn',
  normal: 'Vừa',
  comfortable: 'Rộng',
}

const DENSITY_PADDING: Record<'compact' | 'normal' | 'comfortable', string> = {
  compact: 'py-1.5 px-3.5',
  normal: 'py-2.5 px-4',
  comfortable: 'py-3.5 px-4',
}

export function MonitoringLogsTable({
  liveLogs,
  isLoading,
  isVi,
  totalLogs,
  currentPage,
  totalPages,
  currentLimit,
  autoRefreshInterval,
  searchInput,
  serverLevel = 'ALL',
  onSearchInputChange,
  onSearchKeyDown,
  onClearSearch,
  onLevelChange,
  onLimitChange,
  onPageChange,
}: MonitoringLogsTableProps) {
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal')
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'timestamp',
    'source',
    'level',
    'message',
  ])

  const columnOptions = [
    { label: isVi ? 'Thời gian' : 'Time', value: 'timestamp' },
    { label: isVi ? 'Nguồn' : 'Source', value: 'source' },
    { label: isVi ? 'Mức độ' : 'Level', value: 'level' },
    { label: isVi ? 'Nội dung' : 'Message', value: 'message' },
  ]

  const paddingClass = DENSITY_PADDING[density]

  const handleReset = () => {
    onClearSearch()
    onLevelChange('ALL')
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder={isVi ? 'Gõ tìm kiếm & ấn Enter...' : 'Search logs & press Enter...'}
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchInput && (
              <button
                type="button"
                onClick={onClearSearch}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => {
              const isSelected = serverLevel.toUpperCase() === lvl
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onLevelChange(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              )
            })}
          </div>

          {autoRefreshInterval > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE ({autoRefreshInterval}s)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              PAUSED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'compact', label: 'Gọn' },
                { key: 'normal', label: 'Vừa' },
                { key: 'comfortable', label: 'Rộng' },
              ],
              selectedKeys: [density],
              onClick: ({ key }) => setDensity(key as 'compact' | 'normal' | 'comfortable'),
            }}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{DENSITY_LABELS[density]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </Dropdown>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Đặt lại' : 'Reset'}</span>
          </button>

          <Dropdown
            trigger={['click']}
            popupRender={() => (
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-3 shadow-xl backdrop-blur-xl">
                <Checkbox.Group
                  value={visibleColumns}
                  options={columnOptions}
                  onChange={(values) => setVisibleColumns(values.map(String))}
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
              <span>{isVi ? 'Cột' : 'Columns'}</span>
            </button>
          </Dropdown>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isVi ? 'Đang truy vấn ClickHouse SQL...' : 'Querying ClickHouse SQL...'}</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-sans font-bold text-[12.5px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                {visibleColumns.includes('timestamp') && (
                  <th className="py-3 px-4 w-48 text-center whitespace-nowrap">{isVi ? 'Thời gian (GMT+7)' : 'Time (GMT+7)'}</th>
                )}
                {visibleColumns.includes('source') && (
                  <th className="py-3 px-4 w-36 text-center whitespace-nowrap">{isVi ? 'Nguồn' : 'Source'}</th>
                )}
                {visibleColumns.includes('level') && (
                  <th className="py-3 px-3 w-24 text-center whitespace-nowrap">{isVi ? 'Mức độ' : 'Level'}</th>
                )}
                {visibleColumns.includes('message') && (
                  <th className="py-3 px-4 text-center whitespace-nowrap">{isVi ? 'Nội dung Request / Message' : 'Message'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {liveLogs.length > 0 ? (
                liveLogs.map((log: BetterStackLogItem, idx: number) => {
                  const dateStr = formatLogTimestamp(log.timestamp)
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {visibleColumns.includes('timestamp') && (
                        <td className={`${paddingClass} text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] text-center`}>
                          {dateStr}
                        </td>
                      )}
                      {visibleColumns.includes('source') && (
                        <td className={`${paddingClass} whitespace-nowrap font-sans text-center`}>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                            <Server className="w-3 h-3 text-slate-400" />
                            {log.source || 'lingosphere-backend'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes('level') && (
                        <td className={`${paddingClass} whitespace-nowrap text-center`}>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getLevelBadgeClass(
                              log.level
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {log.level}
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes('message') && (
                        <td className={`${paddingClass} text-slate-800 dark:text-slate-200`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-medium">{log.message}</span>
                            {log.correlation_id && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                                {log.correlation_id}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length} className="text-center py-10 text-slate-500 font-sans text-xs">
                    {isVi
                      ? 'Chưa có log phù hợp với bộ lọc ClickHouse SQL'
                      : 'No logs match your ClickHouse SQL query'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalLogs > 0 && (
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={currentLimit}
            pageSizeOptions={[10, 20, 50, 100]}
            totalItems={totalLogs}
            showTotal={true}
            onPageChange={onPageChange}
            onPageSizeChange={onLimitChange}
          />
        </div>
      )}
    </div>
  )
}
