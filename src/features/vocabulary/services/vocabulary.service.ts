// Service xử lý các yêu cầu API quản lý từ vựng, chủ đề, phiên âm IPA và ngữ pháp.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  LexicalItemSchema,
  LexicalItemListSchema,
  TopicSchema,
  FlashcardDeckSchema,
  FlashcardDeckListSchema,
  GrammarPointSchema,
  GrammarPointListSchema,
  type LexicalItem,
  type Topic,
  type IpaSymbol,
  type GrammarPoint,
  type FlashcardDeck,
} from '@/features/vocabulary/schemas/vocabulary.schema'

export type { LexicalItem, Topic, IpaSymbol, GrammarPoint, FlashcardDeck }

export interface SearchVocabParams {
  q?: string
  cefr_level?: string
  topic_id?: string
  lexical_type?: string
}

export interface IngestVocabularyParams {
  word: string
  cefr_level?: string
  lexical_type?: string
  skip_existing?: boolean
}

export interface IngestVocabularyResult {
  success: boolean
  word: string
  lexical_item_id?: string
  dictionary_found?: boolean
  meanings_count?: number
  audio_us_url?: string
  audio_uk_url?: string
  error?: string
}

export const vocabularyService = {
  async searchVocabulary(params?: SearchVocabParams): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH,
      params as Record<string, unknown>,
      LexicalItemListSchema
    )
  },

  async listVocabulary(params?: SearchVocabParams & { page?: number; limit?: number }): Promise<LexicalItem[] | { items: LexicalItem[]; total?: number; page?: number; limit?: number; total_pages?: number; next_cursor?: string | null }> {
    return api.get(
      API_CONFIG.ENDPOINTS.VOCABULARY.LIST,
      params as Record<string, unknown>
    )
  },

  async getLexicalItemById(id: string): Promise<LexicalItem> {
    return api.get<LexicalItem>(
      API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id),
      undefined,
      LexicalItemSchema
    )
  },

  async createLexicalItem(payload: Partial<LexicalItem>): Promise<LexicalItem> {
    return api.post<LexicalItem>(
      API_CONFIG.ENDPOINTS.VOCABULARY.CREATE,
      payload,
      LexicalItemSchema
    )
  },

  async updateLexicalItem(id: string, payload: Partial<LexicalItem>): Promise<LexicalItem> {
    return api.put<LexicalItem>(
      API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id),
      payload,
      LexicalItemSchema
    )
  },

  async uploadLexicalItemAudio(
    id: string,
    file: File,
    audioType: 'us' | 'uk' = 'us'
  ): Promise<{ url: string; storage_key: string }> {
    return api.upload<{ url: string; storage_key: string }>(
      `${API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id)}/upload-audio`,
      file,
      { audio_type: audioType }
    )
  },

  async ingestVocabulary(params: IngestVocabularyParams): Promise<IngestVocabularyResult> {
    return api.post<IngestVocabularyResult>(
      API_CONFIG.ENDPOINTS.VOCABULARY.INGEST,
      params
    )
  },

  async ingestVocabularyBatch(items: IngestVocabularyParams[]): Promise<{
    total: number
    success: number
    failed: number
    skipped: number
    results: IngestVocabularyResult[]
  }> {
    return api.post<{
      total: number
      success: number
      failed: number
      skipped: number
      results: IngestVocabularyResult[]
    }>(
      API_CONFIG.ENDPOINTS.VOCABULARY.INGEST_BATCH,
      { items }
    )
  },

  async deleteLexicalItem(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id))
  },

  async getAllTopics(): Promise<Topic[]> {
    return api.get<Topic[]>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPICS)
  },

  async getTopicById(id: string): Promise<Topic> {
    return api.get<Topic>(
      API_CONFIG.ENDPOINTS.VOCABULARY.TOPIC_BY_ID(id),
      undefined,
      TopicSchema
    )
  },

  async createTopic(payload: Partial<Topic>): Promise<Topic> {
    return api.post<Topic>(
      API_CONFIG.ENDPOINTS.VOCABULARY.TOPICS,
      payload,
      TopicSchema
    )
  },

  async updateTopic(id: string, payload: Partial<Topic>): Promise<Topic> {
    return api.put<Topic>(
      API_CONFIG.ENDPOINTS.VOCABULARY.TOPIC_BY_ID(id),
      payload,
      TopicSchema
    )
  },

  async deleteTopic(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPIC_BY_ID(id))
  },

  async getAllIpaSymbols(symbolType?: string): Promise<IpaSymbol[]> {
    return api.get<IpaSymbol[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.IPA_SYMBOLS,
      symbolType ? { symbol_type: symbolType } : undefined
    )
  },

  async getIpaSymbolById(id: string): Promise<IpaSymbol> {
    return api.get<IpaSymbol>(API_CONFIG.ENDPOINTS.VOCABULARY.IPA_BY_ID(id))
  },

  async updateIpaSymbol(id: string, payload: Partial<IpaSymbol>): Promise<IpaSymbol> {
    return api.put<IpaSymbol>(
      API_CONFIG.ENDPOINTS.VOCABULARY.IPA_BY_ID(id),
      payload
    )
  },

  async uploadIpaSymbolAudio(
    id: string,
    file: File,
    audioType: 'symbol' | 'example' = 'symbol'
  ): Promise<{ url: string; storage_key: string }> {
    return api.upload<{ url: string; storage_key: string }>(
      `${API_CONFIG.ENDPOINTS.VOCABULARY.IPA_BY_ID(id)}/upload-audio`,
      file,
      { audio_type: audioType }
    )
  },

  async getAllGrammarPoints(): Promise<GrammarPoint[]> {
    return api.get<GrammarPoint[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINTS,
      undefined,
      GrammarPointListSchema
    )
  },

  async getGrammarPointById(id: string): Promise<GrammarPoint> {
    return api.get<GrammarPoint>(
      API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_BY_ID(id),
      undefined,
      GrammarPointSchema
    )
  },

  async createGrammarPoint(payload: Partial<GrammarPoint>): Promise<GrammarPoint> {
    return api.post<GrammarPoint>(
      API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINTS,
      payload,
      GrammarPointSchema
    )
  },

  async getAllFlashcardDecks(): Promise<FlashcardDeck[]> {
    return api.get<FlashcardDeck[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.DECKS,
      undefined,
      FlashcardDeckListSchema
    )
  },

  async explorePublicDecks(): Promise<FlashcardDeck[]> {
    return api.get<FlashcardDeck[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.PUBLIC_DECKS,
      undefined,
      FlashcardDeckListSchema
    )
  },

  async getFlashcardDeckById(id: string): Promise<FlashcardDeck> {
    return api.get<FlashcardDeck>(
      API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(id),
      undefined,
      FlashcardDeckSchema
    )
  },

  async createFlashcardDeck(payload: Partial<FlashcardDeck>): Promise<FlashcardDeck> {
    return api.post<FlashcardDeck>(
      API_CONFIG.ENDPOINTS.VOCABULARY.DECKS,
      payload,
      FlashcardDeckSchema
    )
  },

  async updateFlashcardDeck(id: string, payload: Partial<FlashcardDeck>): Promise<FlashcardDeck> {
    return api.put<FlashcardDeck>(
      API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(id),
      payload,
      FlashcardDeckSchema
    )
  },

  async deleteFlashcardDeck(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(id))
  },

  async addCardToDeck(deckId: string, payload: Record<string, unknown>): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.ADD_CARD(deckId), payload)
  },

  async removeCardFromDeck(deckId: string, cardId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.REMOVE_CARD(deckId, cardId))
  },
}
