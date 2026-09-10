// Custom hook quản lý truy vấn và thao tác từ vựng, bộ thẻ bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { vocabularyService, type SearchVocabParams } from '@/features/vocabulary/services/vocabulary.service'
import { vocabAdminKeys } from '@/features/vocabulary/keys/vocabulary.admin.keys'
import type { LexicalItem, Topic, FlashcardDeck } from '@/features/vocabulary/data/vocabulary.data'
import type {
  LexicalItem as ApiLexicalItem,
  Topic as ApiTopic,
  FlashcardDeck as ApiFlashcardDeck,
} from '@/types/api.types'

export function useVocabularyWordsQuery(params?: SearchVocabParams) {
  return useQuery<LexicalItem[]>({
    queryKey: vocabAdminKeys.words(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await vocabularyService.searchVocabulary(params)
      return (res || []).map((w: ApiLexicalItem) => ({
        id: w._id,
        word: w.word,
        word_type: w.word_type,
        cefr_level: w.cefr_level,
        pronunciation_us: w.pronunciation_us,
        pronunciation_uk: w.pronunciation_uk,
        audio_url_us: w.audio_url_us,
        created_at: w.created_at,
      }))
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}

export function useVocabularyTopicsQuery() {
  return useQuery<Topic[]>({
    queryKey: vocabAdminKeys.topics(),
    queryFn: async () => {
      const res = await vocabularyService.getAllTopics()
      return (res || []).map((t: ApiTopic) => ({
        id: t._id,
        name_vi: t.name_vi,
        name_en: t.name_en || t.name,
        slug: t.slug,
        description: t.description || '',
        icon: t.icon_url,
        is_featured: t.is_featured,
        status: t.status,
        lexical_count: t.lexical_count ?? t.words_count ?? 0,
        created_at: t.created_at || new Date().toISOString(),
      }))
    },
    staleTime: 60 * 1000,
  })
}

export function useVocabularyDecksQuery() {
  return useQuery<FlashcardDeck[]>({
    queryKey: vocabAdminKeys.decks(),
    queryFn: async () => {
      const res = await vocabularyService.getAllFlashcardDecks()
      return (res || []).map((d: ApiFlashcardDeck) => ({
        id: d._id,
        _id: d._id,
        name: d.name || d.title || 'Bộ thẻ',
        title: d.title || d.name || 'Bộ thẻ',
        creator_name: 'LingoSphere Master',
        name_vi: d.name_vi || d.title || d.name,
        name_en: d.title || d.name,
        description: d.description || '',
        card_count: d.card_count ?? d.total_cards ?? 0,
        total_cards: d.total_cards ?? d.card_count ?? 0,
        created_at: d.created_at || new Date().toISOString(),
      }))
    },
    staleTime: 60 * 1000,
  })
}

export function usePublicDecksQuery() {
  return useQuery<ApiFlashcardDeck[]>({
    queryKey: vocabAdminKeys.publicDecks(),
    queryFn: async () => {
      const res = await vocabularyService.explorePublicDecks()
      return res || []
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}

export function useDeleteWordMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vocabularyService.deleteLexicalItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabAdminKeys.all })
    },
  })
}

export function useCreatePublicDeckMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<ApiFlashcardDeck>) => vocabularyService.createFlashcardDeck(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabAdminKeys.publicDecks() })
      queryClient.invalidateQueries({ queryKey: vocabAdminKeys.decks() })
    },
  })
}
