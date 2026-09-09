// Lưới hiển thị trạng thái sức khỏe, độ trễ và uptime của các vi dịch vụ backend.
import { Activity, Cpu, Database, Globe, Layers, Radio, Server, ShieldCheck } from 'lucide-react'
import { Pagination } from '@/components/common/pagination'
import type { ServiceHealthItem } from '@/types/api.types'

interface MonitoringServicesGridProps {
  paginatedServices: ServiceHealthItem[]
  filteredServicesCount: number
  filterType: string
  servicesPage: number
  totalServicesPages: number
  servicesPageSize: number
  isVi: boolean
  onFilterChange: (type: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function MonitoringServicesGrid({
  paginatedServices,
  filteredServicesCount,
  filterType,
  servicesPage,
  totalServicesPages,
  servicesPageSize,
  isVi,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}: MonitoringServicesGridProps) {
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

  return (
    <div className="space-y-4">
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
            {
              id: 'MICROSERVICES',
              labelVi: 'Microservices (13)',
              labelEn: 'Microservices (13)',
            },
            { id: 'INFRA', labelVi: 'Hạ tầng & Cache (2)', labelEn: 'Infra & Cache (2)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {service.latency_ms} ms
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{service.uptime_percentage}% uptime</span>
                </div>
              </div>

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

      {filteredServicesCount > 0 && (
        <Pagination
          currentPage={servicesPage}
          totalPages={totalServicesPages}
          pageSize={servicesPageSize}
          pageSizeOptions={[8, 12, 16, 24]}
          totalItems={filteredServicesCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
