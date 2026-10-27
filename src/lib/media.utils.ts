// Tiện ích chuẩn hóa và phân giải URL media cho giao diện quản trị Admin.

import { API_CONFIG } from '@/config/api.config'

const EXTERNAL_TRUSTED_HOSTS = [
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'res.cloudinary.com',
]

export const IMAGE_FALLBACK_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120" fill="none"><rect width="160" height="120" fill="%23f1f5f9" rx="8"/><path d="M70 52a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM50 78h60l-18-24-14 18-8-10-20 16Z" fill="%2394a3b8"/><text x="80" y="98" fill="%2394a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">Ảnh không khả dụng</text></svg>'

export function isExternalStorageUrl(urlOrPath?: string | null): boolean {
  if (!urlOrPath || typeof urlOrPath !== 'string') return false
  const trimmed = urlOrPath.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return false
    }
    return EXTERNAL_TRUSTED_HOSTS.some((trusted) => host.includes(trusted))
  } catch {
    return false
  }
}

export function normalizeToRelativePath(urlOrPath?: string | null): string {
  if (!urlOrPath || typeof urlOrPath !== 'string') return ''
  const trimmed = urlOrPath.trim()
  if (!trimmed) return ''

  if (isExternalStorageUrl(trimmed)) {
    return trimmed
  }

  let raw = trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      raw = parsed.pathname
    } catch {
      raw = trimmed
    }
  }

  try {
    raw = decodeURIComponent(raw)
  } catch {
    raw = raw
  }

  let cleaned = raw.replace(/^\/+/, '')
  cleaned = cleaned.replace(/^(api\/)?media\/stream\//i, '')
  cleaned = cleaned.replace(/^lingosphere-media\//i, '')
  cleaned = cleaned.replace(/^\/+/, '')

  return cleaned
}

export function resolveMediaUrl(urlOrPath?: string | null): string {
  if (!urlOrPath || typeof urlOrPath !== 'string') return ''
  const trimmed = urlOrPath.trim()
  if (!trimmed) return ''

  if (isExternalStorageUrl(trimmed)) {
    return trimmed
  }

  const cleanKey = normalizeToRelativePath(trimmed)
  if (!cleanKey) return ''

  const base = (API_CONFIG.BASE_URL ?? '').replace(/\/+$/, '')
  return `${base}/media/stream/${cleanKey}`
}
