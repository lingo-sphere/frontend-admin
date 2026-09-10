// Service API xử lý cấu hình AI, điều phối provider và quản lý hạn mức quota học viên.
import { api } from '@/services/api.client'
import {
  AiModelListSchema,
  type AiModelItem,
  AiProviderConfigSchema,
  type AiProviderConfig,
  FreeTierAiLimitsSchema,
  type FreeTierAiLimits,
  UserAiQuotaStatusSchema,
  type UserAiQuotaStatus,
} from '@/features/settings/schemas/ai.schema'

export type { AiModelItem, AiProviderConfig, FreeTierAiLimits, UserAiQuotaStatus }

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

  async getFreeTierLimits(): Promise<FreeTierAiLimits> {
    return api.get<FreeTierAiLimits>('/ai/admin/config/free-limits', undefined, FreeTierAiLimitsSchema)
  },

  async updateFreeTierLimits(limits: Partial<FreeTierAiLimits>): Promise<FreeTierAiLimits> {
    return api.put<FreeTierAiLimits>('/ai/admin/config/free-limits', limits, FreeTierAiLimitsSchema)
  },

  async getUserAiQuota(userId: string): Promise<{ quota: Record<string, unknown>; status: UserAiQuotaStatus }> {
    return api.get<{ quota: Record<string, unknown>; status: UserAiQuotaStatus }>(`/ai/admin/users/${userId}/quota`)
  },

  async updateUserAiQuota(
    userId: string,
    data: { chat_messages_limit?: number; context_token_limit?: number; translation_quota_monthly?: number; is_suspended?: boolean },
  ): Promise<{ quota: Record<string, unknown>; status: UserAiQuotaStatus }> {
    return api.put<{ quota: Record<string, unknown>; status: UserAiQuotaStatus }>(`/ai/admin/users/${userId}/quota`, data)
  },

  async resetUserAiQuota(userId: string): Promise<{ success: boolean; message: string; quota: UserAiQuotaStatus }> {
    return api.post<{ success: boolean; message: string; quota: UserAiQuotaStatus }>(`/ai/admin/users/${userId}/quota/reset`)
  },

  async resetAllUsersAiQuota(): Promise<{ success: boolean; message: string; modified_count: number }> {
    return api.post<{ success: boolean; message: string; modified_count: number }>('/ai/admin/quotas/reset-all')
  },
}

export const aiService = aiAdminService
