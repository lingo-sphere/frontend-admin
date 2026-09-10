/**
 * @file ai.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ ai
 */

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

export type AiModelItem = z.infer<typeof AiModelItemSchema>
export type AiProviderConfig = z.infer<typeof AiProviderConfigSchema>
