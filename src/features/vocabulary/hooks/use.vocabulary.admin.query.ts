// Custom hook quản lý truy vấn và thao tác từ vựng, bộ thẻ bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  vocabularyService,
  type SearchVocabParams,
  type FlashcardDeck as ApiFlashcardDeck,
  type LexicalItem as ApiLexicalItem,
  type Topic as ApiTopic,
  type IpaSymbol as ApiIpaSymbol,
} from '@/features/vocabulary/services/vocabulary.service'
import { vocabAdminKeys } from '@/features/vocabulary/keys/vocabulary.admin.keys'
import type { LexicalItem, Topic, FlashcardDeck, IpaSymbol } from '@/features/vocabulary/data/vocabulary.data'

// Response type với pagination info
interface VocabularyWordsResponse {
  items: LexicalItem[]
  total: number
  page: number
  limit: number
  total_pages: number
  next_cursor: string | null
}

export function useVocabularyWordsQuery(params?: SearchVocabParams & { page?: number; limit?: number; cursor?: string }) {
  return useQuery<VocabularyWordsResponse>({
    queryKey: vocabAdminKeys.words(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await vocabularyService.listVocabulary(params)

      // Extract items và total từ response
      let items: any[] = []
      let total = 0
      let page = 1
      let limit = 20
      let totalPages = 1
      let nextCursor: string | null = null

      if (Array.isArray(res)) {
        items = res
        total = res.length
      } else if (res && typeof res === 'object') {
        if ('items' in res && Array.isArray((res as any).items)) {
          items = (res as any).items
          total = (res as any).total || items.length
          page = (res as any).page || 1
          limit = (res as any).limit || 20
          totalPages = (res as any).total_pages || 1
          nextCursor = (res as any).next_cursor || null
        } else if ('data' in res && Array.isArray((res as any).data)) {
          items = (res as any).data
          total = (res as any).total || items.length
          page = (res as any).page || 1
          limit = (res as any).limit || 20
          totalPages = (res as any).total_pages || 1
          nextCursor = (res as any).next_cursor || null
        }
      }

      const mappedItems = (items || []).map((w: ApiLexicalItem) => ({
        id: String(w._id || w.id || ''),
        word: w.word || '',
        word_lowercase: w.word_lowercase || undefined,
        slug: w.slug || undefined,
        word_type: w.word_type || undefined,
        lexical_type: w.lexical_type || 'word',
        cefr_level: w.cefr_level || '',
        pronunciation: w.pronunciation || undefined,  // ✅ Backend trả về pronunciation
        audio_url_us: w.audio_url_us || undefined,
        audio_url_uk: w.audio_url_uk || undefined,
        syllables: w.syllables || undefined,
        stress_pattern: w.stress_pattern || undefined,
        frequency_rank: w.frequency_rank || undefined,
        is_root_word: w.is_root_word || false,
        is_irregular: w.is_irregular || false,
        is_active: w.is_active !== false,
        is_verified: w.is_verified || false,
        source: w.source || undefined,
        meanings_count: w.meanings_count || (w.meanings?.length || 1),
        examples_count: w.examples_count || (w.meanings?.reduce((acc, m) => acc + (Array.isArray(m.examples) ? m.examples.length : 0), 0) || 0),
        created_at: typeof w.created_at === 'string' ? w.created_at : (w.created_at ? new Date(w.created_at).toISOString() : ''),
        updated_at: typeof w.updated_at === 'string' ? w.updated_at : (w.updated_at ? new Date(w.updated_at).toISOString() : ''),
      }))

      return {
        items: mappedItems,
        total,
        page,
        limit,
        total_pages: totalPages,
        next_cursor: nextCursor,
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

export function useVocabularyTopicsQuery() {
  return useQuery<Topic[]>({
    queryKey: vocabAdminKeys.topics(),
    queryFn: async () => {
      const res = await vocabularyService.getAllTopics()
      // Handle multiple response formats
      let items: any[] = []
      if (Array.isArray(res)) {
        items = res
      } else if (res && typeof res === 'object') {
        if ('items' in res && Array.isArray((res as any).items)) {
          items = (res as any).items
        } else if ('data' in res && Array.isArray((res as any).data)) {
          items = (res as any).data
        }
      }
      return (items || []).map((t: ApiTopic) => ({
        id: t._id,
        name_vi: t.name_vi || undefined,
        name_en: t.name_en || t.name || undefined,
        slug: t.slug,
        description: t.description || '',
        icon: t.icon_url || undefined,
        is_featured: t.is_featured,
        status: t.status,
        lexical_count: t.lexical_count || 0,
        created_at: typeof t.created_at === 'string' ? t.created_at : (t.created_at ? new Date(t.created_at).toISOString() : ''),
      }))
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
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
        created_at: typeof d.created_at === 'string' ? d.created_at : (d.created_at instanceof Date ? d.created_at.toISOString() : new Date().toISOString()),
      }))
    },
    staleTime: 0,
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
    staleTime: 0,
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

export function useVocabularyIpaSymbolsQuery(symbolType?: string) {
  return useQuery<IpaSymbol[]>({
    queryKey: [...vocabAdminKeys.all, 'ipa-symbols', symbolType],
    queryFn: async () => {
      const res = await vocabularyService.getAllIpaSymbols(symbolType)
      return (res || []).map((s: ApiIpaSymbol) => ({
        id: s._id || s.id || '',
        symbol: s.symbol || '',
        symbol_type: s.symbol_type || undefined,
        description_en: s.description_en || undefined,
        description_vi: s.description_vi || undefined,
        example_word: s.example_word || undefined,
        example_word_ipa: s.example_word_ipa || undefined,
        // audio_url = IPA symbol audio, example_audio_url = example word audio
        audio_url: s.audio_url || undefined,
        example_audio_url: s.example_audio_url || undefined,
        related_symbols: s.related_symbols || [],
        cefr_min_level: s.cefr_min_level || undefined,
        status: s.status || 'ACTIVE',
        created_at: s.created_at ? String(s.created_at) : undefined,
      }))
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}

export function useUpdateIpaSymbolMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ApiIpaSymbol> }) =>
      vocabularyService.updateIpaSymbol(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...vocabAdminKeys.all, 'ipa-symbols'] })
    },
  })
}

export function useUploadIpaAudioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file, audioType }: { id: string; file: File; audioType: 'symbol' | 'example' }) =>
      vocabularyService.uploadIpaSymbolAudio(id, file, audioType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...vocabAdminKeys.all, 'ipa-symbols'] })
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
