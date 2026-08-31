import { useState, useEffect, useCallback, useRef } from 'react'
import { progressService } from '@/services/progress.service'
import { BetterStackMonitoringTab } from '@/components/progress/BetterStackMonitoringTab'
import type { BetterStackMonitoringData } from '@/types/api.types'
import { toast } from '@/store/toast-store'

export function BetterStackMonitoringPage() {
  const [data, setData] = useState<BetterStackMonitoringData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(3)
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

  const isFetchingRef = useRef<boolean>(false)

  const loadData = useCallback(async (customParams?: Partial<typeof params>, isSilent: boolean = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    if (!isSilent) setIsLoading(true)

    const finalParams = { ...params, ...customParams }
    try {
      const res = await progressService.getBetterStackMonitoring(finalParams)
      setData(res)
    } catch (err) {
      console.warn('Error loading BetterStack monitoring:', err)
      if (!isSilent) {
        toast.error('Không thể tải dữ liệu BetterStack Monitoring')
      }
    } finally {
      if (!isSilent) setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [params])

  useEffect(() => {
    loadData()
  }, [params.page, params.limit, params.level])

  useEffect(() => {
    if (autoRefreshInterval <= 0) return

    const intervalId = setInterval(() => {
      loadData(undefined, true)
    }, autoRefreshInterval * 1000)

    return () => clearInterval(intervalId)
  }, [autoRefreshInterval, loadData])

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
        autoRefreshInterval={autoRefreshInterval}
        onAutoRefreshChange={setAutoRefreshInterval}
      />
    </div>
  )
}
