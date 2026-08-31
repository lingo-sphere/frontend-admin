import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { LexicalItem, Topic, IpaSymbol, GrammarPoint, FlashcardDeck } from '@/types/api.types'

export interface SearchVocabParams {
  q?: string
  cefr_level?: string
  topic_id?: string
}

export const vocabularyService = {

  async searchVocabulary(params?: SearchVocabParams): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH, params as Record<string, unknown>)
  },

  async getLexicalItemById(id: string): Promise<LexicalItem> {
    return api.get<LexicalItem>(API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id))
  },

  async createLexicalItem(payload: Partial<LexicalItem>): Promise<LexicalItem> {
    return api.post<LexicalItem>(API_CONFIG.ENDPOINTS.VOCABULARY.CREATE, payload)
  },

  async deleteLexicalItem(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.BY_ID(id))
  },

  async getAllTopics(): Promise<Topic[]> {
    return api.get<Topic[]>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPICS)
  },

  async getTopicById(id: string): Promise<Topic> {
    return api.get<Topic>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPIC_BY_ID(id))
  },

  async createTopic(payload: Partial<Topic>): Promise<Topic> {
    return api.post<Topic>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPICS, payload)
  },

  async getAllIpaSymbols(symbolType?: string): Promise<IpaSymbol[]> {
    return api.get<IpaSymbol[]>(API_CONFIG.ENDPOINTS.VOCABULARY.IPA_SYMBOLS, symbolType ? { symbolType } : undefined)
  },

  async getIpaSymbolById(id: string): Promise<IpaSymbol> {
    return api.get<IpaSymbol>(API_CONFIG.ENDPOINTS.VOCABULARY.IPA_BY_ID(id))
  },

  async createIpaSymbol(payload: Partial<IpaSymbol>): Promise<IpaSymbol> {
    return api.post<IpaSymbol>(API_CONFIG.ENDPOINTS.VOCABULARY.IPA_SYMBOLS, payload)
  },

  async getAllGrammarPoints(): Promise<GrammarPoint[]> {
    return api.get<GrammarPoint[]>(API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINTS)
  },

  async getGrammarPointById(id: string): Promise<GrammarPoint> {
    return api.get<GrammarPoint>(API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_BY_ID(id))
  },

  async createGrammarPoint(payload: Partial<GrammarPoint>): Promise<GrammarPoint> {
    return api.post<GrammarPoint>(API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINTS, payload)
  },

  async getAllFlashcardDecks(): Promise<FlashcardDeck[]> {
    return api.get<FlashcardDeck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.DECKS)
  },

  async explorePublicDecks(): Promise<FlashcardDeck[]> {
    return api.get<FlashcardDeck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.PUBLIC_DECKS)
  },

  async getFlashcardDeckById(id: string): Promise<FlashcardDeck> {
    return api.get<FlashcardDeck>(API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(id))
  },

  async createFlashcardDeck(payload: Partial<FlashcardDeck>): Promise<FlashcardDeck> {
    return api.post<FlashcardDeck>(API_CONFIG.ENDPOINTS.VOCABULARY.DECKS, payload)
  },

  async addCardToDeck(deckId: string, payload: Record<string, unknown>): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.VOCABULARY.ADD_CARD(deckId), payload)
  },
}
