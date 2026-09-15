/**
 * @file vocabulary.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ vocabulary
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  LexicalItemSchema,
  LexicalItemListSchema,
  TopicSchema,
  TopicListSchema,
  FlashcardDeckSchema,
  FlashcardDeckListSchema,
  IpaSymbolSchema,
  IpaSymbolListSchema,
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
  // word_type được chỉ định ở cấp Meaning
}

export interface IngestVocabularyParams {
  word: string
  cefr_level?: string
  lexical_type?: string
  // word_type được chỉ định ở cấp Meaning
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

  async listVocabulary(params?: SearchVocabParams & { page?: number; limit?: number }): Promise<LexicalItem[]> {
    // Bypass Zod validation vì backend trả về {data: [...]} object thay vì array trực tiếp
    return api.get<LexicalItem[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.LIST,
      params as Record<string, unknown>,
      null
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
    const formData = new FormData()
    formData.append('file', file)
    formData.append('audio_type', audioType)

    return api.post<{ url: string; storage_key: string }>(
      `${API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id)}/upload-audio`,
      formData,
      null,
      { 'Content-Type': 'multipart/form-data' }
    )
  },

  async ingestVocabulary(params: IngestVocabularyParams): Promise<IngestVocabularyResult> {
    return api.post<IngestVocabularyResult>(
      API_CONFIG.ENDPOINTS.VOCABULARY.INGEST,
      params,
      null
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
      { items },
      null
    )
  },

  async deleteLexicalItem(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id))
  },

  async getAllTopics(): Promise<Topic[]> {
    // Bypass Zod validation vì backend trả về {data: [...]} hoặc {items: [...]} object
    return api.get<Topic[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.TOPICS,
      undefined,
      null
    )
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

  async getAllIpaSymbols(symbolType?: string): Promise<IpaSymbol[]> {
    // Bypass Zod validation vì backend trả về 'id' không phải '_id'
    return api.get<IpaSymbol[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.IPA_SYMBOLS,
      symbolType ? { symbol_type: symbolType } : undefined,
      null // Bypass validation
    )
  },

  async getIpaSymbolById(id: string): Promise<IpaSymbol> {
    return api.get<IpaSymbol>(
      API_CONFIG.ENDPOINTS.VOCABULARY.IPA_BY_ID(id),
      undefined,
      null // Bypass validation
    )
  },

  async updateIpaSymbol(id: string, payload: Partial<IpaSymbol>): Promise<IpaSymbol> {
    return api.put<IpaSymbol>(
      API_CONFIG.ENDPOINTS.VOCABULARY.IPA_BY_ID(id),
      payload,
      null
    )
  },

  async uploadIpaSymbolAudio(
    id: string,
    file: File,
    audioType: 'symbol' | 'example' = 'symbol'
  ): Promise<{ url: string; storage_key: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('audio_type', audioType)

    const response = await api.post<{ url: string; storage_key: string }>(
      `${API_CONFIG.ENDPOINTS.VOCABULARY.IPA_BY_ID(id)}/upload-audio`,
      formData,
      null,
      { 'Content-Type': 'multipart/form-data' }
    )
    return response
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
      API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_BY_ID,
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

  async addCardToDeck(deckId: string, payload: Record<string, unknown>): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.ADD_CARD(deckId), payload)
  },
}
