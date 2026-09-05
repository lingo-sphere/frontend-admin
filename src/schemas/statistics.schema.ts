/**
 * @file statistics.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ statistics
 */

import { z } from 'zod'

export const TOEICScoreDistributionItemSchema = z.object({
  range: z.string(),
  count: z.number(),
  percent: z.number(),
}).passthrough()

export const TOEICPartStatSchema = z.object({
  partNumber: z.number(),
  partNameVi: z.string(),
  section: z.string(),
  avgAccuracyPercent: z.number(),
}).passthrough()

export const TOEICAnalyticsOverviewResponseSchema = z.object({
  overview: z.object({
    averageTotalScore: z.number(),
    averageListeningScore: z.number(),
    averageReadingScore: z.number(),
    highestScoreRecord: z.number(),
    totalExams: z.number(),
    totalExamAttempts: z.number(),
  }).passthrough(),
  scoreDistribution: z.array(TOEICScoreDistributionItemSchema),
  partStats: z.array(TOEICPartStatSchema),
}).passthrough()

export const AIModelUsageItemSchema = z.object({
  id: z.string(),
  modelName: z.string(),
  provider: z.string(),
  capabilities: z.array(z.string()).optional(),
  totalRequests: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  costUSD: z.number(),
  costVND: z.number(),
  avgLatencyMs: z.number(),
  successRatePercent: z.number(),
  isPrimary: z.boolean().optional(),
}).passthrough()

export const AIEvaluationCategoryItemSchema = z.object({
  category: z.string(),
  labelVi: z.string(),
  totalEvaluations: z.number(),
  avgScore: z.number(),
  avgProcessingTimeMs: z.number(),
}).passthrough()

export const AiMetricsResponseSchema = z.object({
  aiModelUsageList: z.array(AIModelUsageItemSchema),
  aiEvaluationCategories: z.array(AIEvaluationCategoryItemSchema),
}).passthrough()

export type TOEICScoreDistributionItem = z.infer<typeof TOEICScoreDistributionItemSchema>
export type TOEICPartStat = z.infer<typeof TOEICPartStatSchema>
export type TOEICAnalyticsOverviewResponse = z.infer<typeof TOEICAnalyticsOverviewResponseSchema>
export type AIModelUsageItem = z.infer<typeof AIModelUsageItemSchema>
export type AIEvaluationCategoryItem = z.infer<typeof AIEvaluationCategoryItemSchema>
export type AiMetricsResponse = z.infer<typeof AiMetricsResponseSchema>
