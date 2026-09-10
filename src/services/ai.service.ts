/**
 * @file ai.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ ai
 */

import { api } from '@/services/api.client'
import {
  AiModelListSchema,
  type AiModelItem,
  AiProviderConfigSchema,
  type AiProviderConfig,
} from '@/schemas/ai.schema'

export type { AiModelItem, AiProviderConfig }

export const aiAdminService = {
  async getAiModels(): Promise<Array<{ model_name: string; provider: string; is_active: boolean }>> {
    return api.get<Array<{ model_name: string; provider: string; is_active: boolean }>>('/ai/models', undefined, AiModelListSchema)
  },

  async getAiProviderConfig(): Promise<AiProviderConfig> {
    return api.get<AiProviderConfig>('/ai/admin/config/provider', undefined, AiProviderConfigSchema)
  },

  async setAiProviderConfig(provider: 'gemini' | 'groq'): Promise<AiProviderConfig> {
    return api.put<AiProviderConfig>('/ai/admin/config/provider', { provider }, AiProviderConfigSchema)
  },
}

export const aiService = aiAdminService
