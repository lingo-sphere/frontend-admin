/**
 * @file ipa.helper.ts
 * @description Helper xử lý IPA audio URLs và playback
 *
 * Audio URLs từ backend là relative R2 paths (vd: "audio/ipa/vowels/ilong.mp3")
 * Helper này ghép với VITE_R2_PUBLIC_URL để tạo full URL trực tiếp từ R2
 */

const R2_BASE_URL = (import.meta.env.VITE_R2_PUBLIC_URL || '').replace(/\/+$/, '')

/**
 * Resolve audio URL thành full URL để play
 * - Nếu là URL đầy đủ (http/https/blob/data) → trả nguyên
 * - Nếu là relative path → ghép với R2_BASE_URL
 */
export function resolveIpaAudioUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return ''
  }
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Already full URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }

  // Relative path - prepend R2 base
  return trimmed.startsWith('/')
    ? `${R2_BASE_URL}${trimmed}`
    : `${R2_BASE_URL}/${trimmed}`
}

/**
 * Play IPA audio từ storage_key (relative R2 path)
 */
export function playIpaAudio(storageKey?: string | null): void {
  const fullUrl = resolveIpaAudioUrl(storageKey)
  if (!fullUrl) return

  const audio = new Audio(fullUrl)
  audio.play().catch(() => {})
}

export const IPA_AUDIO_BASE_URL = R2_BASE_URL
