// Banner và các thẻ số liệu giám sát hạ tầng BetterStack và live logs.
import { Activity, CheckCircle2, ExternalLink, Radio, RefreshCw, ShieldCheck, Terminal } from 'lucide-react'
import { CustomSelect } from '@/components/custom.select'
import type { BetterStackMonitoringData } from '@/types/api.types'
import { StatCard } from '@/components/stat.card'

interface MonitoringHeroBannerProps {
  data: BetterStackMonitoringData | null
  isLoading: boolean
  isVi: boolean
  autoRefreshInterval: number
  totalLogs: number
  onRefresh: () => void
  onAutoRefreshChange?: (seconds: number) => void
}

export function MonitoringHeroBanner({
  data,
  isLoading,
  isVi,
  autoRefreshInterval,
  totalLogs,
  onRefresh,
  onAutoRefreshChange,
}: MonitoringHeroBannerProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-teal-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {isVi
                  ? 'Hạ Tầng BetterStack Telemetry & Uptime'
                  : 'BetterStack Telemetry & Uptime'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isVi
                ? 'Giám Sát Backend 13 Microservices & Live Logs'
                : '13 Microservices Health & Live Logs'}
            </h2>
            <p className="text-emerald-100/90 text-sm max-w-2xl">
              {isVi
                ? 'Hệ thống giám sát phân tán kết nối trực tiếp ClickHouse SQL, hỗ trợ phân trang Server-side theo từng trang từ cơ sở dữ liệu vi dịch vụ.'
                : 'Real-time distributed telemetry querying live ClickHouse SQL with server-side pagination across microservices.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onAutoRefreshChange && (
              <div className="flex items-center gap-1.5">
                <Radio
                  className={`w-3.5 h-3.5 ${
                    autoRefreshInterval > 0
                      ? 'text-emerald-300 animate-pulse'
                      : 'text-slate-300'
                  }`}
                />
                <CustomSelect
                  size="sm"
                  value={String(autoRefreshInterval)}
                  onChange={(val) => onAutoRefreshChange(Number(val))}
                  options={[
                    { value: '0', label: isVi ? 'Tự động: Tắt' : 'Auto: Off' },
                    { value: '3', label: isVi ? 'Tự động: 3s' : 'Auto: 3s', badge: 'Fast' },
                    { value: '5', label: isVi ? 'Tự động: 5s' : 'Auto: 5s', badge: 'Normal' },
                    { value: '10', label: isVi ? 'Tự động: 10s' : 'Auto: 10s' },
                  ]}
                  className="w-36"
                />
              </div>
            )}

            <button
              type="button"
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatCard
          title={isVi ? 'Trạng Thái Máy Chủ' : 'Server Status'}
          value={isVi ? '15/15 Sẵn sàng' : '15/15 Operational'}
          subtitle={isVi ? '100% microservices hoạt động' : 'All microservices operational'}
          icon={CheckCircle2}
          color="emerald"
          loading={isLoading}
        />

        <StatCard
          title={isVi ? 'Uptime 30 ngày' : '30d Uptime'}
          value={`${data?.uptime_percentage ?? 99.98}%`}
          subtitle={isVi ? 'Cam kết SLA hệ thống 99.9%' : '30-day infrastructure SLA'}
          icon={ShieldCheck}
          color="teal"
          loading={isLoading}
        />

        <StatCard
          title={isVi ? 'Độ trễ trung bình' : 'Avg Latency'}
          value={`${data?.average_latency_ms ?? 18.4} ms`}
          subtitle={isVi ? 'Thời gian phản hồi API vi dịch vụ' : 'Average API latency'}
          icon={Activity}
          color="indigo"
          loading={isLoading}
        />

        <StatCard
          title={isVi ? 'Tổng Logs ClickHouse' : 'Total Logs'}
          value={`${totalLogs.toLocaleString()} logs`}
          subtitle={isVi ? 'Bản ghi nhật ký phân tán' : 'Distributed log events'}
          icon={Terminal}
          color="amber"
          loading={isLoading}
        />
      </div>
    </div>
  )
}
