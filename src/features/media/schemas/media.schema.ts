// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ media trong Admin.

import { z } from 'zod'

export const StorageQuotaSchema = z.object({
  used_bytes: z.number(),
  total_quota_bytes: z.number(),
  used_percentage: z.number(),
  total_files_count: z.number(),
})

export const RawStorageUsageResponseSchema = z.object({
  system_storage: z.object({
    used_bytes: z.number(),
    used_mb: z.number(),
    used_gb: z.number(),
    max_gb: z.number(),
    usage_percent: z.number(),
    total_files: z.number(),
    is_quota_exceeded: z.boolean(),
  }).passthrough(),
  user_quota: z.unknown().optional(),
}).passthrough()

export const MediaUploadResponseSchema = z.object({
  id: z.string(),
  file_url: z.string(),
  url: z.string().optional(),
  public_url: z.string().optional(),
  filename: z.string(),
  mime_type: z.string().optional(),
  file_size_bytes: z.number().optional(),
  storage_key: z.string().optional(),
  content_type: z.string().optional(),
  media_owner_type: z.string().optional(),
}).passthrough()

export const PresignedUploadResponseSchema = z.object({
  upload_url: z.string(),
  public_url: z.string(),
  file_url: z.string(),
  url: z.string(),
  raw_r2_url: z.string().optional(),
  storage_key: z.string(),
  expires_in_seconds: z.number(),
}).passthrough()

export const TtsGenerateResponseSchema = z.object({
  audio_url: z.string(),
  duration_seconds: z.number().optional(),
}).passthrough()

export type StorageQuota = z.infer<typeof StorageQuotaSchema>
export type RawStorageUsageResponse = z.infer<typeof RawStorageUsageResponseSchema>
export type MediaUploadResponse = z.infer<typeof MediaUploadResponseSchema>
export type PresignedUploadResponse = z.infer<typeof PresignedUploadResponseSchema>
export type TtsGenerateResponse = z.infer<typeof TtsGenerateResponseSchema>
