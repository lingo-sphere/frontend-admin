/**
 * @file vocabulary.data.ts
 * @description Mã nguồn thành phần vocabulary-data.ts
 */

export interface LexicalItem {
  id: string
  word: string
  word_type?: string
  cefr_level?: string
  pronunciation_us?: string
  pronunciation_uk?: string
  audio_url_us?: string
  meanings_count?: number
  examples_count?: number
  status?: string
  is_verified?: boolean
  created_at?: string
}

export interface Topic {
  id: string
  name_en?: string
  name_vi?: string
  slug?: string
  description?: string
  icon?: string
  cefr_level?: string
  lexical_count?: number
  is_featured?: boolean
  status?: string
  created_at?: string
}

export interface FlashcardDeck {
  id: string
  _id?: string
  name?: string
  title?: string
  name_en?: string
  name_vi?: string
  description?: string
  creator_name?: string
  topic_name?: string
  cefr_level?: string
  card_count?: number
  total_cards?: number
  total_studied?: number
  total_users?: number
  avg_mastery_percent?: number
  rating_average?: number
  rating_count?: number
  visibility?: string
  is_featured?: boolean
  is_premium?: boolean
  created_at?: string
}

export interface VocabularyStats {
  totalWords: number
  activeWords: number
  totalTopics: number
  featuredTopics: number
  totalDecks: number
  publicDecks: number
  avgMastery: number
}

export const wordTypeLabels: Record<string, { vi: string; en: string }> = {
  NOUN: { vi: 'Danh từ', en: 'Noun' },
  VERB: { vi: 'Động từ', en: 'Verb' },
  ADJECTIVE: { vi: 'Tính từ', en: 'Adjective' },
  ADVERB: { vi: 'Trạng từ', en: 'Adverb' },
  PREPOSITION: { vi: 'Giới từ', en: 'Preposition' },
  CONJUNCTION: { vi: 'Liên từ', en: 'Conjunction' },
  PRONOUN: { vi: 'Đại từ', en: 'Pronoun' },
  PHRASE: { vi: 'Cụm từ', en: 'Phrase' },
}

export const cefrLevelLabels: Record<string, { vi: string; en: string }> = {
  A1: { vi: 'A1 - Sơ cấp', en: 'A1 - Beginner' },
  A2: { vi: 'A2 - Tiền trung cấp', en: 'A2 - Elementary' },
  B1: { vi: 'B1 - Trung cấp', en: 'B1 - Intermediate' },
  B2: { vi: 'B2 - Tiền nâng cao', en: 'B2 - Upper Intermediate' },
  C1: { vi: 'C1 - Nâng cao', en: 'C1 - Advanced' },
  C2: { vi: 'C2 - Thành thạo', en: 'C2 - Proficient' },
}

export const cefrLevelColors: Record<string, { bg: string; text: string }> = {
  A1: { bg: 'var(--success-soft)', text: 'var(--success)' },
  A2: { bg: 'var(--success-soft)', text: 'var(--success)' },
  B1: { bg: 'var(--info-soft)', text: 'var(--info)' },
  B2: { bg: 'var(--info-soft)', text: 'var(--info)' },
  C1: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
  C2: { bg: 'var(--error-soft)', text: 'var(--error)' },
}
