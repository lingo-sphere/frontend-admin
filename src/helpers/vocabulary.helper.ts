export type VocabularyTabType = 'words' | 'topics' | 'decks'

export function playAudio(url?: string): void {
  if (!url) return
  const audio = new Audio(url)
  audio.play().catch((err) => console.warn('Cannot play audio:', err))
}
