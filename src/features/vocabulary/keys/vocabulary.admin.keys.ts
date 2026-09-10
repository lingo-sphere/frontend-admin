// Quản lý Query Key tập trung cho module từ vựng trong frontend-admin.
export const vocabAdminKeys = {
  all: ['vocabulary-admin'] as const,
  words: (params?: Record<string, unknown>) => [...vocabAdminKeys.all, 'words', params ?? {}] as const,
  topics: () => [...vocabAdminKeys.all, 'topics'] as const,
  decks: () => [...vocabAdminKeys.all, 'decks'] as const,
  publicDecks: () => [...vocabAdminKeys.all, 'public-decks'] as const,
}
