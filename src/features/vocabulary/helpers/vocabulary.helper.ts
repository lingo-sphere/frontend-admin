// Tiện ích xử lý URL âm thanh từ vựng và phát âm thanh từ dịch vụ lưu trữ R2.
export type VocabularyTabType = 'words' | 'topics' | 'decks'

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL

export function resolveVocabularyAudioUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('audio/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
    const encodedPath = cleanPath.split('/').map(part => encodeURIComponent(part)).join('/')
    return `${R2_PUBLIC_URL}/${encodedPath}`
  }

  return trimmed
}

export function playAudio(url?: string | null): void {
  if (!url) return
  const resolvedUrl = resolveVocabularyAudioUrl(url)
  if (!resolvedUrl) return

  const audio = new Audio(resolvedUrl)
  audio.play().catch(() => {})
}
