// Hook quản lý truy vấn dữ liệu thống kê TOEIC toàn sàn và lưu lượng chỉ số AI bằng TanStack Query
import { useQuery } from '@tanstack/react-query'
import {
  statisticsService,
  type TOEICAnalyticsOverviewResponse,
  type AiMetricsResponse,
} from '@/features/progress/services/statistics.service'
import { progressAdminKeys } from '@/features/progress/keys/progress.admin.keys'

export function usePlatformAnalytics() {
  const toeicQuery = useQuery<TOEICAnalyticsOverviewResponse>({
    queryKey: progressAdminKeys.toeicOverview(),
    queryFn: () => statisticsService.getToeicAnalyticsOverview(),
    staleTime: 60 * 1000,
  })

  const aiQuery = useQuery<AiMetricsResponse>({
    queryKey: progressAdminKeys.aiMetrics(),
    queryFn: () => statisticsService.getAiMetrics(),
    staleTime: 60 * 1000,
  })

  return {
    toeicData: toeicQuery.data ?? null,
    aiData: aiQuery.data ?? null,
    isLoadingToeic: toeicQuery.isLoading,
    isLoadingAi: aiQuery.isLoading,
    toeicError: toeicQuery.error instanceof Error ? toeicQuery.error.message : null,
    aiError: aiQuery.error instanceof Error ? aiQuery.error.message : null,
    refetchToeic: toeicQuery.refetch,
    refetchAi: aiQuery.refetch,
  }
}
