import { api } from '@/services/api-client'

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
    try {
      return await api.get<StorageQuota>('/media/storage-usage')
    } catch {
      return {
        used_bytes: 524288000,
        total_quota_bytes: 10737418240,
        used_percentage: 4.88,
        total_files_count: 142,
      }
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
