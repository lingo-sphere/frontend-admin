/**
 * @file vocabulary.helper.ts
 * @description Mã nguồn thành phần vocabulary.helper.ts
 */
export type VocabularyTabType = 'words' | 'topics' | 'decks'

// R2 Public URL cho audio files
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || ''

/**
 * Resolve vocabulary audio URL - ghép R2 URL với audio path
 * Backend trả về: audio/vocabulary/us/A1/a/a.mp3
 * Cần ghép thành: https://pub-xxx.r2.dev/audio/vocabulary/us/A1/a/a.mp3
 */
export function resolveVocabularyAudioUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Nếu đã là full URL (bắt đầu bằng http)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Nếu là relative path, ghép với R2 URL
  if (trimmed.startsWith('/') || trimmed.startsWith('audio/')) {
    // Chỉ encode các ký tự đặc biệt, giữ nguyên /
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
    // Encode path để xử lý ký tự đặc biệt như '
    const encodedPath = cleanPath.split('/').map(part => encodeURIComponent(part)).join('/')
    return `${R2_PUBLIC_URL}/${encodedPath}`
  }

  return trimmed
}

/**
 * Play vocabulary audio từ URL
 * Tự động ghép R2 URL với audio path từ backend
 */
export function playAudio(url?: string | null): void {
  if (!url) return
  const resolvedUrl = resolveVocabularyAudioUrl(url)
  if (!resolvedUrl) return

  const audio = new Audio(resolvedUrl)
  audio.play().catch(() => {
    // Silently fail - audio file có thể không tồn tại trên R2
  })
}
