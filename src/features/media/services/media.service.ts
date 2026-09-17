// Service xu ly cac logic nghiep vu cho dich vu media, upload file truc tiep Cloudflare R2 va TTS.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  type StorageQuota,
  RawStorageUsageResponseSchema,
  MediaUploadResponseSchema,
  PresignedUploadResponseSchema,
  TtsGenerateResponseSchema,
  type MediaUploadResponse,
  type PresignedUploadResponse,
  type TtsGenerateResponse,
} from '@/features/media/schemas/media.schema'

export type { StorageQuota, MediaUploadResponse, PresignedUploadResponse, TtsGenerateResponse }

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

  async getPresignedUploadUrl(
    filename: string,
    mimeType: string,
    fileSizeBytes: number,
    folder = 'courses'
  ): Promise<PresignedUploadResponse> {
    return api.post(
      '/media/presigned-url',
      {
        filename,
        mime_type: mimeType,
        file_size_bytes: fileSizeBytes,
        folder,
        media_owner_type: 'SYSTEM',
      },
      PresignedUploadResponseSchema
    )
  },

  async uploadDirectR2(
    file: File,
    folder = 'courses',
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<MediaUploadResponse> {
    let mimeType = file.type
    if (!mimeType) {
      const lowerName = file.name.toLowerCase()
      if (lowerName.endsWith('.pdf')) mimeType = 'application/pdf'
      else if (lowerName.endsWith('.mp4')) mimeType = 'video/mp4'
      else if (lowerName.endsWith('.webm')) mimeType = 'video/webm'
      else if (lowerName.endsWith('.wav')) mimeType = 'audio/wav'
      else if (lowerName.endsWith('.mp3')) mimeType = 'audio/mpeg'
      else if (lowerName.endsWith('.ogg')) mimeType = 'audio/ogg'
      else if (lowerName.endsWith('.m4a')) mimeType = 'audio/mp4'
      else if (lowerName.endsWith('.png')) mimeType = 'image/png'
      else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg'
      else if (lowerName.endsWith('.webp')) mimeType = 'image/webp'
      else mimeType = 'application/octet-stream'
    }

    const presigned = await this.getPresignedUploadUrl(file.name, mimeType, file.size, folder)

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', presigned.upload_url, true)
      xhr.setRequestHeader('Content-Type', mimeType)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded * 100) / e.total)
          onProgress?.(pct, e.loaded, e.total)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100, file.size, file.size)
          resolve()
        } else {
          reject(new Error(`Tải file lên Cloudflare R2 thất bại: HTTP ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Lỗi kết nối mạng khi tải trực tiếp lên Cloudflare R2'))
      xhr.send(file)
    })

    return {
      id: presigned.storage_key,
      filename: file.name,
      file_name: file.name,
      file_url: presigned.file_url,
      url: presigned.file_url,
      public_url: presigned.file_url,
      storage_key: presigned.storage_key,
      mime_type: mimeType,
      file_size_bytes: file.size,
    }
  },

  async uploadFile(
    file: File,
    folder = 'courses',
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<MediaUploadResponse> {
    return this.uploadDirectR2(file, folder, onProgress)
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
