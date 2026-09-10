/**
 * @file use.platform.analytics.ts
 * @description Hook quản lý việc nạp dữ liệu thống kê TOEIC toàn sàn và lưu lượng chỉ số AI từ Backend API
 */

import { useState, useEffect, useCallback } from 'react'
import {
  statisticsService,
  type TOEICAnalyticsOverviewResponse,
  type AiMetricsResponse,
} from '@/features/progress/services/statistics.service'

export function usePlatformAnalytics() {
  const [toeicData, setToeicData] = useState<TOEICAnalyticsOverviewResponse | null>(null)
  const [aiData, setAiData] = useState<AiMetricsResponse | null>(null)
  const [isLoadingToeic, setIsLoadingToeic] = useState<boolean>(true)
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(true)
  const [toeicError, setToeicError] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const fetchToeicAnalytics = useCallback(async () => {
    setIsLoadingToeic(true)
    setToeicError(null)
    try {
      const data = await statisticsService.getToeicAnalyticsOverview()
      setToeicData(data)
    } catch (err: unknown) {
      setToeicError(err instanceof Error ? err.message : 'Không thể tải thống kê TOEIC')
    } finally {
      setIsLoadingToeic(false)
    }
  }, [])

  const fetchAiMetrics = useCallback(async () => {
    setIsLoadingAi(true)
    setAiError(null)
    try {
      const data = await statisticsService.getAiMetrics()
      setAiData(data)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Không thể tải chỉ số mô hình AI')
    } finally {
      setIsLoadingAi(false)
    }
  }, [])

  useEffect(() => {
    fetchToeicAnalytics()
    fetchAiMetrics()
  }, [fetchToeicAnalytics, fetchAiMetrics])

  return {
    toeicData,
    aiData,
    isLoadingToeic,
    isLoadingAi,
    toeicError,
    aiError,
    refetchToeic: fetchToeicAnalytics,
    refetchAi: fetchAiMetrics,
  }
}
