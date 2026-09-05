/**
 * @file statistics.service.ts
 * @description Service kết nối các API thống kê toàn sàn TOEIC Analytics và chỉ số mô hình AI
 */

import { api } from '@/services/api.client'
import {
  type TOEICScoreDistributionItem,
  type TOEICPartStat,
  type TOEICAnalyticsOverviewResponse,
  type AIModelUsageItem,
  type AIEvaluationCategoryItem,
  type AiMetricsResponse,
  TOEICAnalyticsOverviewResponseSchema,
  AiMetricsResponseSchema,
} from '@/schemas/statistics.schema'

export type {
  TOEICScoreDistributionItem,
  TOEICPartStat,
  TOEICAnalyticsOverviewResponse,
  AIModelUsageItem,
  AIEvaluationCategoryItem,
  AiMetricsResponse,
}

export const statisticsService = {
  async getToeicAnalyticsOverview(): Promise<TOEICAnalyticsOverviewResponse> {
    return api.get<TOEICAnalyticsOverviewResponse>(
      '/exams/analytics/overview',
      undefined,
      TOEICAnalyticsOverviewResponseSchema
    )
  },

  async getAiMetrics(): Promise<AiMetricsResponse> {
    return api.get<AiMetricsResponse>(
      '/ai/analytics/metrics',
      undefined,
      AiMetricsResponseSchema
    )
  },
}
