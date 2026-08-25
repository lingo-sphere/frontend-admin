import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { StorageUsageReport } from '@/types/api.types'

export interface UploadResponse {
  file_id: string
  url: string
  key: string
  mimetype: string
  size: number
}

export interface MediaCollection {
  _id: string
  name: string
  description?: string
  total_files: number
  created_at?: string
}

export const mediaService = {
  // Upload file media lên Cloudflare R2
  async uploadMedia(file: File, folder?: string): Promise<UploadResponse> {
    return api.upload<UploadResponse>(API_CONFIG.ENDPOINTS.MEDIA.UPLOAD, file, folder ? { folder } : undefined)
  },

  // Lấy thông tin file theo ID
  async getMediaFileById(id: string): Promise<UploadResponse> {
    return api.get<UploadResponse>(API_CONFIG.ENDPOINTS.MEDIA.FILE_BY_ID(id))
  },

  // Xóa file media
  async deleteMediaFile(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.MEDIA.FILE_BY_ID(id))
  },

  // Thống kê dung lượng Cloudflare R2
  async getStorageUsage(): Promise<StorageUsageReport> {
    return api.get<StorageUsageReport>(API_CONFIG.ENDPOINTS.MEDIA.STORAGE_USAGE)
  },

  // Danh sách bộ sưu tập Media
  async getAllCollections(): Promise<MediaCollection[]> {
    return api.get<MediaCollection[]>(API_CONFIG.ENDPOINTS.MEDIA.COLLECTIONS)
  },

  // Tạo bộ sưu tập Media
  async createCollection(payload: { name: string; description?: string }): Promise<MediaCollection> {
    return api.post<MediaCollection>(API_CONFIG.ENDPOINTS.MEDIA.COLLECTIONS, payload)
  },
}
