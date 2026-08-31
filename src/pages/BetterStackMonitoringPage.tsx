import { useState, useEffect, useCallback } from 'react'
import { progressService } from '@/services/progress.service'
import { BetterStackMonitoringTab } from '@/components/progress/BetterStackMonitoringTab'
import type { BetterStackMonitoringData } from '@/types/api.types'
import { toast } from '@/store/toast-store'

export function BetterStackMonitoringPage() {
  const [data, setData] = useState<BetterStackMonitoringData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [params, setParams] = useState<{
    page: number
    limit: number
    search: string
    level: string
  }>({
    page: 1,
    limit: 10,
    search: '',
    level: 'ALL',
  })

  const loadData = useCallback(async (customParams?: Partial<typeof params>) => {
    setIsLoading(true)
    const finalParams = { ...params, ...customParams }
    try {
      const res = await progressService.getBetterStackMonitoring(finalParams)
      setData(res)
    } catch (err) {
      console.warn('Error loading BetterStack monitoring:', err)
      toast.error('Không thể tải dữ liệu BetterStack Monitoring')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    loadData()
  }, [params.page, params.limit, params.level])

  const handleParamsChange = (newParams: Partial<typeof params>) => {
    setParams((prev) => ({ ...prev, ...newParams }))
  }

  const handleSearchSubmit = (searchTerm: string) => {
    setParams((prev) => ({ ...prev, search: searchTerm, page: 1 }))
    loadData({ search: searchTerm, page: 1 })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <BetterStackMonitoringTab
        data={data}
        isLoading={isLoading}
        onRefresh={() => loadData()}
        serverParams={params}
        onParamsChange={handleParamsChange}
        onSearchSubmit={handleSearchSubmit}
      />
    </div>
  )
}
