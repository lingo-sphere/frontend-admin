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

  async uploadMedia(file: File, folder?: string): Promise<UploadResponse> {
    return api.upload<UploadResponse>(API_CONFIG.ENDPOINTS.MEDIA.UPLOAD, file, folder ? { folder } : undefined)
  },

  async getMediaFileById(id: string): Promise<UploadResponse> {
    return api.get<UploadResponse>(API_CONFIG.ENDPOINTS.MEDIA.FILE_BY_ID(id))
  },

  async deleteMediaFile(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.MEDIA.FILE_BY_ID(id))
  },

  async getStorageUsage(): Promise<StorageUsageReport> {
    return api.get<StorageUsageReport>(API_CONFIG.ENDPOINTS.MEDIA.STORAGE_USAGE)
  },

  async getAllCollections(): Promise<MediaCollection[]> {
    return api.get<MediaCollection[]>(API_CONFIG.ENDPOINTS.MEDIA.COLLECTIONS)
  },

  async createCollection(payload: { name: string; description?: string }): Promise<MediaCollection> {
    return api.post<MediaCollection>(API_CONFIG.ENDPOINTS.MEDIA.COLLECTIONS, payload)
  },
}
