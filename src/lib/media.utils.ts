// Tiện ích chuẩn hóa và phân giải URL media cho giao diện quản trị Admin.

import { API_CONFIG } from '@/config/api.config'

const EXTERNAL_TRUSTED_HOSTS = [
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'res.cloudinary.com',
]

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
