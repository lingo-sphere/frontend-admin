/**
 * @file media.utils.ts
 * @description Tiện ích xử lý và chuẩn hóa URL media (Audio, Video, Image) cho Admin
 */

import { API_CONFIG } from '@/config/api.config'

export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (
    trimmed.startsWith('data:audio/') ||
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    const baseUrl = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '')
    return `${baseUrl}${trimmed}`
  }

  if (
    trimmed.includes('pub-') ||
    trimmed.includes('r2.cloudflarestorage.com') ||
    trimmed.includes('.r2.dev')
  ) {
    try {
      const parsed = new URL(trimmed)
      const baseUrl = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '')
      return `${baseUrl}/media/stream${parsed.pathname}`
    } catch {
      return trimmed
    }
  }

  return trimmed
}
