// Tiện ích giải quyết đường dẫn và phát âm thanh ký hiệu IPA từ hệ thống lưu trữ R2.
const R2_BASE_URL = (import.meta.env.VITE_R2_PUBLIC_URL).replace(/\/+$/, '')

export function resolveIpaAudioUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return ''
  }
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }

  return trimmed.startsWith('/')
    ? `${R2_BASE_URL}${trimmed}`
    : `${R2_BASE_URL}/${trimmed}`
}

export function playIpaAudio(storageKey?: string | null): void {
  const fullUrl = resolveIpaAudioUrl(storageKey)
  if (!fullUrl) return

  const audio = new Audio(fullUrl)
  audio.play().catch(() => {})
}

export const IPA_AUDIO_BASE_URL = R2_BASE_URL
