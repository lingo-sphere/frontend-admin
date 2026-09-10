/**
 * @file monitoring.logs.table.tsx
 * @description Bảng hiển thị luồng log thời gian thực từ ClickHouse SQL kèm phân trang Server-side, tìm kiếm và lọc mức độ log
 */

import { Filter, Loader2, Search, Server, Terminal } from 'lucide-react'
import { CustomSelect } from '@/components/custom.select'
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
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs rounded-3xl z-20 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {isVi
                ? 'Đang truy vấn ClickHouse SQL...'
                : 'Querying ClickHouse SQL...'}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isVi
                  ? 'Live Tail: Luồng Log & Request Thời Gian Thực (Server-side)'
                  : 'Live Tail: Real-time Request Stream'}
              </h3>
              {autoRefreshInterval > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE ({autoRefreshInterval}s)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  SQL PAUSED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVi
                ? `Truy vấn trực tiếp ClickHouse SQL • Tổng số: ${totalLogs} logs • Múi giờ: GMT+7 (Việt Nam)`
                : `Direct ClickHouse SQL Query • Total: ${totalLogs} logs • Timezone: GMT+7`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isVi ? 'Gõ tìm kiếm & ấn Enter...' : 'Search logs & press Enter...'}
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              className="pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
            />
            {searchInput && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
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

          <CustomSelect
            size="sm"
            value={String(currentLimit)}
            onChange={(val) => onLimitChange(Number(val))}
            options={[
              { value: '10', label: isVi ? '10 / trang' : '10 / page' },
              { value: '20', label: isVi ? '20 / trang' : '20 / page' },
              { value: '50', label: isVi ? '50 / trang' : '50 / page' },
            ]}
            className="w-32"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-sans uppercase text-[10.5px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 w-48">{isVi ? 'Thời Gian (GMT+7)' : 'Time (GMT+7)'}</th>
              <th className="py-3 px-4 w-36">{isVi ? 'Nguồn (Source)' : 'Source'}</th>
              <th className="py-3 px-3 w-20">{isVi ? 'Mức độ' : 'Level'}</th>
              <th className="py-3 px-4">{isVi ? 'Nội Dung Request / Message' : 'Message'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {liveLogs.length > 0 ? (
              liveLogs.map((log: BetterStackLogItem, idx: number) => {
                const dateStr = formatLogTimestamp(log.timestamp)
                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {dateStr}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        <Server className="w-3 h-3 text-slate-400" />
                        {log.source || 'lingosphere-backend'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getLevelBadgeClass(
                          log.level
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {log.level}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-medium">{log.message}</span>
                        {log.correlation_id && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                            {log.correlation_id}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500 font-sans text-xs">
                  {isVi
                    ? 'Chưa có log phù hợp với bộ lọc ClickHouse SQL'
                    : 'No logs match your ClickHouse SQL query'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalLogs > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={currentLimit}
            pageSizeOptions={[10, 20, 50, 100]}
            totalItems={totalLogs}
            onPageChange={onPageChange}
            onPageSizeChange={onLimitChange}
          />
        </div>
      )}
    </div>
  )
}
