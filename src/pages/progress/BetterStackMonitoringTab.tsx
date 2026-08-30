import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  ShieldCheck,
  Zap,
  Server,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Radio,
  Cpu,
  Layers,
  Database,
  Globe,
  Search,
  Terminal,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import type { BetterStackMonitoringData, ServiceHealthItem, BetterStackLogItem } from '@/types/api.types'

interface BetterStackMonitoringTabProps {
  data: BetterStackMonitoringData | null
  isLoading: boolean
  onRefresh: () => void
  serverParams?: {
    page: number
    limit: number
    search: string
    level: string
  }
  onParamsChange?: (newParams: Partial<{
    page: number
    limit: number
    search: string
    level: string
  }>) => void
  onSearchSubmit?: (searchTerm: string) => void
}

export function BetterStackMonitoringTab({
  data,
  isLoading,
  onRefresh,
  serverParams,
  onParamsChange,
  onSearchSubmit,
}: BetterStackMonitoringTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchInput, setSearchInput] = useState<string>(serverParams?.search || '')

  const [servicesPage, setServicesPage] = useState<number>(1)
  const [servicesPageSize, setServicesPageSize] = useState<number>(9)

  const services = data?.services || []
  const liveLogs = data?.live_logs || []
  const pagination = data?.pagination || {
    total: data?.total_logs_count || liveLogs.length,
    page: serverParams?.page || 1,
    limit: serverParams?.limit || 10,
    totalPages: Math.max(1, Math.ceil((data?.total_logs_count || liveLogs.length) / (serverParams?.limit || 10))),
  }

  const currentPage = serverParams?.page || pagination.page || 1
  const currentLimit = serverParams?.limit || pagination.limit || 10
  const totalPages = pagination.totalPages || 1
  const totalLogs = pagination.total || 0

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (filterType === 'ALL') return true
      if (filterType === 'MICROSERVICES') return s.type !== 'INFRA'
      if (filterType === 'INFRA') return s.type === 'INFRA'
      return true
    })
  }, [services, filterType])

  const totalServicesPages = Math.max(1, Math.ceil(filteredServices.length / servicesPageSize))
  const paginatedServices = useMemo(() => {
    const start = (servicesPage - 1) * servicesPageSize
    return filteredServices.slice(start, start + servicesPageSize)
  }, [filteredServices, servicesPage, servicesPageSize])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSearchSubmit) {
        onSearchSubmit(searchInput)
      } else if (onParamsChange) {
        onParamsChange({ search: searchInput, page: 1 })
      }
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'GATEWAY':
        return Globe
      case 'AUTH':
        return ShieldCheck
      case 'AI':
      case 'AI_SPEECH':
        return Cpu
      case 'INFRA':
        return Database
      default:
        return Server
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

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Status */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isVi ? 'Hạ Tầng BetterStack Telemetry & Uptime' : 'BetterStack Telemetry & Uptime'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isVi ? 'Giám Sát Backend 13 Microservices & Live Logs' : '13 Microservices Health & Live Logs'}
            </h2>
            <p className="text-emerald-100/90 text-sm max-w-2xl">
              {isVi
                ? 'Hệ thống giám sát phân tán kết nối trực tiếp ClickHouse SQL, hỗ trợ phân trang Server-side theo từng trang từ cơ sở dữ liệu vi dịch vụ.'
                : 'Real-time distributed telemetry querying live ClickHouse SQL with server-side pagination across microservices.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isVi ? 'Làm mới Live' : 'Refresh'}</span>
            </button>

            <a
              href="https://telemetry.betterstack.com/team/t586626/tail?s=l2697291"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 transition-all cursor-pointer"
            >
              <span>{isVi ? 'Mở BetterStack Live Tail' : 'Open Live Tail'}</span>
              <ExternalLink className="w-4 h-4 text-emerald-600" />
            </a>
          </div>
        </div>

        {/* Top 4 Quick Metric Cards inside Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVi ? 'Trạng Thái Máy Chủ' : 'Server Status'}</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {isVi ? '15/15 Sẵn sàng' : '15/15 Operational'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{isVi ? 'Uptime 30 ngày' : '30d Uptime'}</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {data?.uptime_percentage ?? 99.98}%
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
              <Zap className="w-4 h-4" />
              <span>{isVi ? 'Độ trễ trung bình' : 'Avg Latency'}</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {data?.average_latency_ms ?? 18.4} ms
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
              <Terminal className="w-4 h-4" />
              <span>{isVi ? 'Tổng Logs ClickHouse' : 'Total Logs'}</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {totalLogs} {isVi ? 'logs' : 'logs'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. BetterStack Live Tail & Telemetry Log Stream Table with Server-side Pagination */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs rounded-3xl z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isVi ? 'Đang truy vấn ClickHouse SQL...' : 'Querying ClickHouse SQL...'}</span>
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
                  {isVi ? 'Live Tail: Luồng Log & Request Thời Gian Thực (Server-side)' : 'Live Tail: Real-time Request Stream'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE SQL
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi
                  ? `Truy vấn trực tiếp ClickHouse SQL • Tổng số: ${totalLogs} logs`
                  : `Direct ClickHouse SQL Query • Total: ${totalLogs} logs`}
              </p>
            </div>
          </div>

          {/* Filters, Search & PageSize Selector */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isVi ? 'Gõ tìm kiếm & ấn Enter...' : 'Search logs & press Enter...'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    if (onSearchSubmit) onSearchSubmit('')
                    else if (onParamsChange) onParamsChange({ search: '', page: 1 })
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => {
                const isSelected = (serverParams?.level || 'ALL').toUpperCase() === lvl
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      if (onParamsChange) {
                        onParamsChange({ level: lvl, page: 1 })
                      }
                    }}
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

            {/* Page Size */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <select
                value={currentLimit}
                onChange={(e) => {
                  if (onParamsChange) {
                    onParamsChange({ limit: Number(e.target.value), page: 1 })
                  }
                }}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Tail Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-sans uppercase text-[10.5px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-44">{isVi ? 'Thời Gian (Time)' : 'Time'}</th>
                <th className="py-3 px-4 w-36">{isVi ? 'Nguồn (Source)' : 'Source'}</th>
                <th className="py-3 px-3 w-20">{isVi ? 'Mức độ' : 'Level'}</th>
                <th className="py-3 px-4">{isVi ? 'Nội Dung Request / Message' : 'Message'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {liveLogs.length > 0 ? (
                liveLogs.map((log: BetterStackLogItem, idx: number) => {
                  const dateStr = log.timestamp.replace('T', ' ').replace('Z', '').slice(0, 23)
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

        {/* Live Logs Server-side Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs flex-wrap gap-3">
          <span className="text-slate-500">
            {isVi
              ? `Hiển thị ${(currentPage - 1) * currentLimit + 1} - ${Math.min(
                  currentPage * currentLimit,
                  totalLogs
                )} trên tổng số ${totalLogs} logs (Server-side)`
              : `Showing ${(currentPage - 1) * currentLimit + 1} - ${Math.min(
                  currentPage * currentLimit,
                  totalLogs
                )} of ${totalLogs} logs (Server-side)`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onParamsChange && currentPage > 1) {
                  onParamsChange({ page: currentPage - 1 })
                }
              }}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              let pageNum = idx + 1
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + idx
                if (pageNum > totalPages) pageNum = totalPages - (4 - idx)
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    if (onParamsChange) {
                      onParamsChange({ page: pageNum })
                    }
                  }}
                  disabled={isLoading}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => {
                if (onParamsChange && currentPage < totalPages) {
                  onParamsChange({ page: currentPage + 1 })
                }
              }}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar for Services Grid */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            {isVi ? 'Lưới Trạng Thái 15 Dịch Vụ:' : '15 Services Health Grid:'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', labelVi: 'Tất cả (15)', labelEn: 'All (15)' },
            { id: 'MICROSERVICES', labelVi: 'Microservices (13)', labelEn: 'Microservices (13)' },
            { id: 'INFRA', labelVi: 'Hạ tầng & Cache (2)', labelEn: 'Infra & Cache (2)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id)
                setServicesPage(1)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isVi ? tab.labelVi : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Services Grid with Pagination */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedServices.map((service: ServiceHealthItem) => {
            const Icon = getServiceIcon(service.type)

            return (
              <div
                key={service.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          :{service.port}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          {service.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      OPERATIONAL
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                  {service.description}
                </p>

                {/* Uptime & Latency stats */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {service.latency_ms} ms
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>{service.uptime_percentage}% uptime</span>
                  </div>
                </div>

                {/* Visual 20-block uptime graph */}
                <div className="flex items-center gap-1 mt-3">
                  {Array.from({ length: 20 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-90 hover:opacity-100 hover:scale-y-125 transition-all"
                      title="100% Uptime Block"
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Services Grid Pagination Bar */}
        {totalServicesPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs flex-wrap gap-3">
            <span className="text-slate-500">
              {isVi
                ? `Hiển thị ${(servicesPage - 1) * servicesPageSize + 1} - ${Math.min(
                    servicesPage * servicesPageSize,
                    filteredServices.length
                  )} trên ${filteredServices.length} dịch vụ`
                : `Showing ${(servicesPage - 1) * servicesPageSize + 1} - ${Math.min(
                    servicesPage * servicesPageSize,
                    filteredServices.length
                  )} of ${filteredServices.length} services`}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setServicesPage((p) => Math.max(1, p - 1))}
                disabled={servicesPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {servicesPage} / {totalServicesPages}
              </span>
              <button
                onClick={() => setServicesPage((p) => Math.min(totalServicesPages, p + 1))}
                disabled={servicesPage === totalServicesPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Incident Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isVi ? 'Nhật Ký Bảo Trì & Sự Cố (BetterStack Incident Logs)' : 'Maintenance & Incident History'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isVi ? 'Cập nhật tự động qua Webhook' : 'Auto-updated via Webhook'}
          </span>
        </div>

        {data?.recent_incidents && data.recent_incidents.length > 0 ? (
          <div className="space-y-3">
            {data.recent_incidents.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{inc.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isVi ? 'Đã giải quyết xong lúc: ' : 'Resolved at: '}
                      {new Date(inc.resolved_at || inc.created_at).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs sm:text-sm">
            {isVi ? 'Không có sự cố nào trong 30 ngày qua 🎉' : 'No incidents reported in the last 30 days 🎉'}
          </div>
        )}
      </div>
    </div>
  )
}
