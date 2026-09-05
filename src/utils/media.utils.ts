/**
 * @file media.utils.ts
 * @description Tiện ích xử lý và chuẩn hóa URL media (Audio, Video, Image) cho Admin
 */

import { API_CONFIG } from '@/config/api.config'

export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // 1. Dữ liệu âm thanh Base64 hoặc Blob URL trực tiếp
  if (
    trimmed.startsWith('data:audio/') ||
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  // 2. Đường dẫn tương đối từ backend gateway (ví dụ: /media/stream/...)
  if (trimmed.startsWith('/')) {
    const baseUrl = (API_CONFIG.BASE_URL || 'http://localhost:8080').replace(/\/+$/, '')
    return `${baseUrl}${trimmed}`
  }

  // 3. Đường dẫn trực tiếp từ Cloudflare R2 bucket -> chuyển qua API Gateway stream để tránh lỗi CORS
  if (
    trimmed.includes('pub-') ||
    trimmed.includes('r2.cloudflarestorage.com') ||
    trimmed.includes('.r2.dev')
  ) {
    try {
      const parsed = new URL(trimmed)
      const baseUrl = (API_CONFIG.BASE_URL || 'http://localhost:8080').replace(/\/+$/, '')
      return `${baseUrl}/media/stream${parsed.pathname}`
    } catch {
      return trimmed
    }
  }

  return trimmed
}
