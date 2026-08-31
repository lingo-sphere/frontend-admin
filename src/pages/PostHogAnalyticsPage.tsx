import { useState, useEffect, useCallback } from 'react'
import { progressService } from '@/services/progress.service'
import { PostHogAnalyticsTab } from '@/components/progress/PostHogAnalyticsTab'
import type { PostHogAnalyticsData } from '@/types/api.types'
import { toast } from '@/store/toast-store'

export function PostHogAnalyticsPage() {
  const [data, setData] = useState<PostHogAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [params, setParams] = useState<{
    page: number
    limit: number
    search: string
  }>({
    page: 1,
    limit: 10,
    search: '',
  })

  const loadData = useCallback(async (customParams?: Partial<typeof params>) => {
    setIsLoading(true)
    const finalParams = { ...params, ...customParams }
    try {
      const res = await progressService.getPostHogAnalytics(finalParams)
      setData(res)
    } catch (err) {
      console.warn('Error loading PostHog analytics:', err)
      toast.error('Không thể tải dữ liệu PostHog Analytics')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    loadData()
  }, [params.page, params.limit])

  const handleParamsChange = (newParams: Partial<typeof params>) => {
    setParams((prev) => ({ ...prev, ...newParams }))
  }

  const handleSearchSubmit = (searchTerm: string) => {
    setParams((prev) => ({ ...prev, search: searchTerm, page: 1 }))
    loadData({ search: searchTerm, page: 1 })
  }

  return (
    <div className="space-y-6">
      <PostHogAnalyticsTab
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
