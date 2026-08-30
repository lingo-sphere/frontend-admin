import { useState, useEffect } from 'react'
import { progressService } from '@/services/progress.service'
import { PostHogAnalyticsTab } from '@/pages/progress/PostHogAnalyticsTab'
import type { PostHogAnalyticsData } from '@/types/api.types'
import { toast } from '@/store/toast-store'

export function PostHogAnalyticsPage() {
  const [data, setData] = useState<PostHogAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await progressService.getPostHogAnalytics()
      setData(res)
    } catch (err) {
      console.warn('Error loading PostHog analytics:', err)
      toast.error('Không thể tải dữ liệu PostHog Analytics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <PostHogAnalyticsTab
        data={data}
        isLoading={isLoading}
        onRefresh={loadData}
      />
    </div>
  )
}
