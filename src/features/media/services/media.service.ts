/**
 * @file media.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ media
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  type StorageQuota,
  RawStorageUsageResponseSchema,
  MediaUploadResponseSchema,
  TtsGenerateResponseSchema,
  type MediaUploadResponse,
  type TtsGenerateResponse,
} from '@/features/media/schemas/media.schema'

export type { StorageQuota, MediaUploadResponse, TtsGenerateResponse }

export interface MediaFileItem {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size_bytes: number
  created_at?: string
}

export const mediaAdminService = {
  async getStorageUsage(): Promise<StorageQuota> {
    const res = await api.get(
      API_CONFIG.ENDPOINTS.MEDIA.STORAGE_USAGE,
      undefined,
      RawStorageUsageResponseSchema
    )

    const sys = res.system_storage
    return {
      used_bytes: sys.used_bytes,
      total_quota_bytes: (sys.max_gb || 10) * 1024 * 1024 * 1024,
      used_percentage: sys.usage_percent,
      total_files_count: sys.total_files,
    }
  },

  async uploadFile(
    file: File,
    folder = 'courses',
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<MediaUploadResponse> {
    return api.upload<MediaUploadResponse>(
      '/media/upload',
      file,
      { folder },
      onProgress,
      MediaUploadResponseSchema
    )
  },

  async confirmMedia(fileUrls: string[], contentId?: string): Promise<{ modifiedCount?: number }> {
    if (!fileUrls || fileUrls.length === 0) return { modifiedCount: 0 }
    try {
      return await api.post<{ modifiedCount?: number }>('/media/confirm', {
        file_urls: fileUrls.filter(Boolean),
        content_id: contentId,
      })
    } catch {
      return { modifiedCount: 0 }
    }
  },

  async cleanupTempMedia(fileUrls: string[]): Promise<{ deleted_count?: number }> {
    if (!fileUrls || fileUrls.length === 0) return { deleted_count: 0 }
    try {
      return await api.post<{ deleted_count?: number }>('/media/cleanup-temp', {
        file_urls: fileUrls.filter(Boolean),
      })
    } catch {
      return { deleted_count: 0 }
    }
  },

  async generateTts(text: string, voice = 'alloy', speed = 1.0): Promise<TtsGenerateResponse> {
    return api.post<TtsGenerateResponse>(
      '/media/tts/generate',
      { text, voice, speed },
      TtsGenerateResponseSchema
    )
  },
}

export const mediaService = mediaAdminService
