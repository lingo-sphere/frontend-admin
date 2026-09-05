/**
 * @file statistics.service.ts
 * @description Service kết nối các API thống kê toàn sàn TOEIC Analytics và chỉ số mô hình AI
 */

import { api } from '@/services/api.client'

export interface TOEICScoreDistributionItem {
  range: string
  count: number
  percent: number
}

export interface TOEICPartStat {
  partNumber: number
  partNameVi: string
  section: string
  avgAccuracyPercent: number
}

export interface TOEICAnalyticsOverviewResponse {
  overview: {
    averageTotalScore: number
    averageListeningScore: number
    averageReadingScore: number
    highestScoreRecord: number
    totalExams: number
    totalExamAttempts: number
  }
  scoreDistribution: TOEICScoreDistributionItem[]
  partStats: TOEICPartStat[]
}

export interface AIModelUsageItem {
  id: string
  modelName: string
  provider: string
  capabilities?: string[]
  totalRequests: number
  inputTokens: number
  outputTokens: number
  costUSD: number
  costVND: number
  avgLatencyMs: number
  successRatePercent: number
  isPrimary?: boolean
}

export interface AIEvaluationCategoryItem {
  category: string
  labelVi: string
  totalEvaluations: number
  avgScore: number
  avgProcessingTimeMs: number
}

export interface AiMetricsResponse {
  aiModelUsageList: AIModelUsageItem[]
  aiEvaluationCategories: AIEvaluationCategoryItem[]
}

export const statisticsService = {
  async getToeicAnalyticsOverview(): Promise<TOEICAnalyticsOverviewResponse> {
    const res = await api.get<TOEICAnalyticsOverviewResponse>('/exams/analytics/overview')
    return res
  },

  async getAiMetrics(): Promise<AiMetricsResponse> {
    const res = await api.get<AiMetricsResponse>('/ai/analytics/metrics')
    return res
  },
}
