import { useState, useEffect } from 'react'
import { progressService } from '@/services/progress.service'
import { BetterStackMonitoringTab } from '@/pages/progress/BetterStackMonitoringTab'
import type { BetterStackMonitoringData } from '@/types/api.types'
import { toast } from '@/store/toast-store'

export function BetterStackMonitoringPage() {
  const [data, setData] = useState<BetterStackMonitoringData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await progressService.getBetterStackMonitoring()
      setData(res)
    } catch (err) {
      console.warn('Error loading BetterStack monitoring:', err)
      toast.error('Không thể tải dữ liệu BetterStack Monitoring')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <BetterStackMonitoringTab
        data={data}
        isLoading={isLoading}
        onRefresh={loadData}
      />
    </div>
  )
}
