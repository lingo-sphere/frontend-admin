/**
 * @file media.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ media
 */

import { api } from '@/services/api.client'

export interface StorageQuota {
  used_bytes: number
  total_quota_bytes: number
  used_percentage: number
  total_files_count: number
}

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
    const res = await api.get<{
      system_storage: {
        used_bytes: number
        used_mb: number
        used_gb: number
        max_gb: number
        usage_percent: number
        total_files: number
        is_quota_exceeded: boolean
      }
    }>('/media/storage/usage')

    const sys = res?.system_storage
    return {
      used_bytes: sys?.used_bytes ?? 0,
      total_quota_bytes: (sys?.max_gb ?? 10) * 1024 * 1024 * 1024,
      used_percentage: sys?.usage_percent ?? 0,
      total_files_count: sys?.total_files ?? 0,
    }
  },

  async uploadFile(
    file: File,
    folder = 'courses',
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<{ file_url: string; url: string; public_url: string; id: string; filename: string }> {
    return api.upload<{ file_url: string; url: string; public_url: string; id: string; filename: string }>(
      '/media/upload',
      file,
      { folder },
      onProgress
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

  async generateTts(text: string, voice = 'alloy', speed = 1.0): Promise<{ audio_url: string; duration_seconds?: number }> {
    return api.post<{ audio_url: string; duration_seconds?: number }>('/media/tts/generate', {
      text,
      voice,
      speed,
    })
  },
}

export const mediaService = mediaAdminService
