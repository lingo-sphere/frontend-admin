/**
 * @file vocabulary.data.ts
 * @description Mã nguồn thành phần vocabulary-data.ts
 */

export interface LexicalItem {
  id: string
  word: string
  word_lowercase?: string
  slug?: string
  // word_type = part_of_speech (ở cấp Meaning, không phải LexicalItem)
  word_type?: string
  lexical_type?: 'word' | 'phrase' | 'phrasal_verb' | 'idiom' | 'collocation' | string
  cefr_level?: string
  pronunciation?: string
  audio_url_us?: string
  audio_url_uk?: string
  syllables?: number
  stress_pattern?: string
  frequency_rank?: number
  is_root_word?: boolean
  is_irregular?: boolean
  is_active?: boolean
  is_verified?: boolean
  source?: string
  primary_meaning_vi?: string
  meanings_count?: number
  examples_count?: number
  // Optional detailed meanings (từ detail API)
  meanings?: Array<{
    meaning_order: number
    part_of_speech: string
    definition_en?: string  // Backend vẫn trả về cho compatibility
    definition_vi: string
    short_meaning_vi?: string
    examples?: Array<{ sentence_en: string; sentence_vi?: string }>
    synonyms?: string[]
    antonyms?: string[]
    is_primary?: boolean
  }>
  topic_ids?: string[]
  topics?: Array<{
    id?: string
    _id?: string
    name_en?: string
    name_vi?: string
    slug?: string
    is_primary?: boolean
  }>
  created_at?: string
  updated_at?: string
}

export const lexicalTypeLabels: Record<string, { vi: string; en: string }> = {
  word: { vi: 'Từ đơn', en: 'Word' },
  phrase: { vi: 'Cụm từ', en: 'Phrase' },
  phrasal_verb: { vi: 'Cụm động từ', en: 'Phrasal Verb' },
  idiom: { vi: 'Thành ngữ', en: 'Idiom' },
  collocation: { vi: 'Cặp từ', en: 'Collocation' },
}

export const sourceLabels: Record<string, { vi: string; en: string }> = {
  curated: { vi: 'Biên soạn', en: 'Curated' },
  ingested: { vi: 'Nhập tự động', en: 'AI Ingested' },
}

export interface Topic {
  id: string
  _id?: string
  name_en?: string
  name_vi?: string
  slug?: string
  description?: string
  description_en?: string
  description_vi?: string
  icon?: string
  icon_url?: string
  cefr_level?: string
  lexical_count?: number
  deck_count?: number
  display_order?: number
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
  description_vi?: string
  creator_name?: string
  topic_id?: string
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
  cards?: FlashcardItem[]
  created_at?: string
}

export interface FlashcardItem {
  id?: string
  _id?: string
  lexical_item_id?: string
  front_text?: string
  back_text?: string
  ipa?: string
  part_of_speech?: string
  audio_url?: string
  definition?: string
  definition_vi?: string
  example?: string
  example_vi?: string
}

export interface IpaSymbol {
  id: string
  symbol: string
  symbol_type?: 'VOWEL' | 'CONSONANT' | 'DIPHTHONG' | string
  description_en?: string
  description_vi?: string
  example_word?: string
  example_word_ipa?: string
  audio_url?: string
  example_audio_url?: string
  related_symbols?: string[]
  cefr_min_level?: string
  status?: string
  created_at?: string
}

export const ipaSymbolTypeLabels: Record<string, { vi: string; en: string; color: string }> = {
  VOWEL: { vi: 'Nguyên âm', en: 'Vowel', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  CONSONANT: { vi: 'Phụ âm', en: 'Consonant', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  DIPHTHONG: { vi: 'Nguyên âm đôi', en: 'Diphthong', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
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
