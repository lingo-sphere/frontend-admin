// Schema Zod cho cấu hình mô hình AI và hạn mức AI học viên.
import { z } from 'zod'

export const AiModelItemSchema = z.object({
  model_name: z.string(),
  provider: z.string(),
  is_active: z.boolean(),
}).passthrough()

export const AiModelListSchema = z.array(AiModelItemSchema)

export const AiProviderConfigSchema = z.object({
  primary_provider: z.string(),
  fallback_provider: z.string(),
  gemini_model: z.string().optional(),
  groq_model: z.string().optional(),
  updated_at: z.string().optional().nullable(),
  updated_by: z.string().optional().nullable(),
}).passthrough()

export const FreeTierAiLimitsSchema = z.object({
  chat_messages_limit: z.number(),
  context_token_limit: z.number(),
  translation_quota_monthly: z.number(),
  evaluation_quota_monthly: z.number(),
}).passthrough()

export const UserAiQuotaStatusSchema = z.object({
  user_id: z.string(),
  is_premium: z.boolean(),
  plan_type: z.string(),
  chat: z.object({
    used: z.number(),
    limit: z.number().nullable().optional(),
    remaining: z.number(),
    is_unlimited: z.boolean(),
  }),
  translation: z.object({
    used: z.number(),
    limit: z.number().nullable().optional(),
    remaining: z.number(),
    is_unlimited: z.boolean(),
  }),
  context_token_limit: z.number(),
}).passthrough()

export type AiModelItem = z.infer<typeof AiModelItemSchema>
export type AiProviderConfig = z.infer<typeof AiProviderConfigSchema>
export type FreeTierAiLimits = z.infer<typeof FreeTierAiLimitsSchema>
export type UserAiQuotaStatus = z.infer<typeof UserAiQuotaStatusSchema>
