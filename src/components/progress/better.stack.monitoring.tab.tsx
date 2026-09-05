/**
 * @file better.stack.monitoring.tab.tsx
 * @description Component giao diện điều phối toàn diện giám sát hạ tầng BetterStack, luồng live logs ClickHouse và lưới trạng thái 15 vi dịch vụ
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BetterStackMonitoringData } from '@/types/api.types'
import { MonitoringHeroBanner } from './monitoring/monitoring.hero.banner'
import { MonitoringLogsTable } from './monitoring/monitoring.logs.table'
import { MonitoringServicesGrid } from './monitoring/monitoring.services.grid'
import { MonitoringIncidentsCard } from './monitoring/monitoring.incidents.card'

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
  onParamsChange?: (
    newParams: Partial<{
      page: number
      limit: number
      search: string
      level: string
    }>
  ) => void
  onSearchSubmit?: (searchTerm: string) => void
  autoRefreshInterval?: number
  onAutoRefreshChange?: (seconds: number) => void
}

export function BetterStackMonitoringTab({
  data,
  isLoading,
  onRefresh,
  serverParams,
  onParamsChange,
  onSearchSubmit,
  autoRefreshInterval = 0,
  onAutoRefreshChange,
}: BetterStackMonitoringTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchInput, setSearchInput] = useState<string>(serverParams?.search || '')

  const [servicesPage, setServicesPage] = useState<number>(1)
  const [servicesPageSize, setServicesPageSize] = useState<number>(8)

  const services = data?.services || []
  const liveLogs = data?.live_logs || []
  const pagination = data?.pagination || {
    total: data?.total_logs_count || liveLogs.length,
    page: serverParams?.page || 1,
    limit: serverParams?.limit || 10,
    totalPages: Math.max(
      1,
      Math.ceil((data?.total_logs_count || liveLogs.length) / (serverParams?.limit || 10))
    ),
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

  const totalServicesPages = Math.max(
    1,
    Math.ceil(filteredServices.length / servicesPageSize)
  )
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

  return (
    <div className="space-y-6">
      <MonitoringHeroBanner
        data={data}
        isLoading={isLoading}
        isVi={isVi}
        autoRefreshInterval={autoRefreshInterval}
        totalLogs={totalLogs}
        onRefresh={onRefresh}
        onAutoRefreshChange={onAutoRefreshChange}
      />

      <MonitoringLogsTable
        liveLogs={liveLogs}
        isLoading={isLoading}
        isVi={isVi}
        totalLogs={totalLogs}
        currentPage={currentPage}
        totalPages={totalPages}
        currentLimit={currentLimit}
        autoRefreshInterval={autoRefreshInterval}
        searchInput={searchInput}
        serverLevel={serverParams?.level || 'ALL'}
        onSearchInputChange={setSearchInput}
        onSearchKeyDown={handleSearchKeyDown}
        onClearSearch={() => {
          setSearchInput('')
          if (onSearchSubmit) onSearchSubmit('')
          else if (onParamsChange) onParamsChange({ search: '', page: 1 })
        }}
        onLevelChange={(lvl) => {
          if (onParamsChange) onParamsChange({ level: lvl, page: 1 })
        }}
        onLimitChange={(limit) => {
          if (onParamsChange) onParamsChange({ limit, page: 1 })
        }}
        onPageChange={(page) => {
          if (onParamsChange) onParamsChange({ page })
        }}
      />

      <MonitoringServicesGrid
        paginatedServices={paginatedServices}
        filteredServicesCount={filteredServices.length}
        filterType={filterType}
        servicesPage={servicesPage}
        totalServicesPages={totalServicesPages}
        servicesPageSize={servicesPageSize}
        isVi={isVi}
        onFilterChange={(type) => {
          setFilterType(type)
          setServicesPage(1)
        }}
        onPageChange={setServicesPage}
        onPageSizeChange={(size) => {
          setServicesPageSize(size)
          setServicesPage(1)
        }}
      />

      <MonitoringIncidentsCard
        incidents={data?.recent_incidents}
        isVi={isVi}
      />
    </div>
  )
}
