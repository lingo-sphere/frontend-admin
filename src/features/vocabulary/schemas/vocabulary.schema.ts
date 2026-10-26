// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ vocabulary trong Admin.

import { z } from 'zod'

export const WordMeaningSchema = z.object({
  meaning_order: z.number().nullable().optional(),
  part_of_speech: z.string().nullable().optional(),
  definition_en: z.string(),
  definition_vi: z.string(),
  short_meaning_vi: z.string().nullable().optional(),
  examples: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  collocations: z.array(z.string()).optional(),
  cefr_level: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  is_primary: z.boolean().nullable().optional(),
}).passthrough()

export const LexicalItemSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  word: z.string(),
  word_lowercase: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  // word_type = part_of_speech (ở cấp Meaning, backend có thể trả về)
  word_type: z.string().nullable().optional(),
  lexical_type: z.string().default('word'),
  phrase_type: z.string().nullable().optional(),
  cefr_level: z.string().default('A1'),
  frequency_rank: z.number().nullable().optional(),
  pronunciation: z.string().nullable().optional(),  // ✅ IPA pronunciation (backend field: p)
  audio_url_us: z.string().nullable().optional(),
  audio_url_uk: z.string().nullable().optional(),
  syllables: z.number().nullable().optional(),
  stress_pattern: z.string().nullable().optional(),
  is_root_word: z.boolean().nullable().optional().default(false),
  is_homograph: z.boolean().nullable().optional().default(false),
  homograph_number: z.number().nullable().optional(),
  is_irregular: z.boolean().nullable().optional().default(false),
  is_active: z.boolean().default(true),
  is_verified: z.boolean().nullable().optional().default(false),
  source: z.string().nullable().optional().default('curated'),
  meanings_count: z.number().nullable().optional(),
  examples_count: z.number().nullable().optional(),
  meanings: z.array(WordMeaningSchema).optional(),
  topic_ids: z.array(z.string()).optional(),
  topics: z.array(z.any()).optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
  updated_at: z.union([z.string(), z.date()]).nullable().optional(),
}).passthrough()

export const IngestVocabularyResultSchema = z.object({
  success: z.boolean(),
  word: z.string(),
  lexical_item_id: z.string().nullable().optional(),
  dictionary_found: z.boolean().nullable().optional(),
  meanings_count: z.number().nullable().optional(),
  audio_us_url: z.string().nullable().optional(),
  audio_uk_url: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
}).passthrough()

export const LexicalItemListSchema = z.array(LexicalItemSchema)

export const TopicSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  name_en: z.string().nullable().optional(),
  name_vi: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  slug: z.string().default(''),
  description: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  description_vi: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(),
  cefr_level: z.string().nullable().optional(),
  lexical_count: z.number().nullable().optional(),
  deck_count: z.number().nullable().optional(),
  display_order: z.number().nullable().optional(),
  words_count: z.number().nullable().optional(),
  is_featured: z.boolean().optional(),
  status: z.string().optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
}).passthrough()

export const TopicListSchema = z.array(TopicSchema)

export const FlashcardDeckSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  name: z.string().default(''),
  title: z.string().default(''),
  name_vi: z.string().nullable().optional(),
  name_en: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  description_vi: z.string().nullable().optional(),
  creator_id: z.string().nullable().optional(),
  creator_name: z.string().nullable().optional(),
  topic_id: z.string().nullable().optional(),
  topic_name: z.string().nullable().optional(),
  cefr_level: z.string().nullable().optional(),
  visibility: z.string().nullable().optional(),
  is_public: z.boolean().default(true),
  is_system: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  total_cards: z.number().default(0),
  card_count: z.number().default(0),
  rating: z.number().nullable().optional(),
  enrolled_count: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  cards: z.array(z.record(z.string(), z.unknown())).optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
}).passthrough()

export const FlashcardDeckListSchema = z.array(FlashcardDeckSchema)

export const IpaSymbolSchema = z.object({
  // Backend trả về 'id', không phải '_id'
  id: z.string(),
  _id: z.string().optional(), // Giữ để tương thích
  symbol: z.string(),
  symbol_type: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  description_vi: z.string().nullable().optional(),
  example_word: z.string().nullable().optional(),
  example_word_ipa: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  example_audio_url: z.string().nullable().optional(),
  related_symbols: z.array(z.string()).optional().default([]),
  cefr_min_level: z.string().nullable().optional(),
  status: z.string().optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
}).passthrough()

export const IpaSymbolListSchema = z.array(IpaSymbolSchema)

export const GrammarPointSchema = z.object({
  _id: z.string(),
  title: z.string(),
  title_vi: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  rule_explanation: z.string().nullable().optional(),
  examples: z.array(z.string()).optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
}).passthrough()

export const GrammarPointListSchema = z.array(GrammarPointSchema)

export type WordMeaning = z.infer<typeof WordMeaningSchema>
export type LexicalItem = z.infer<typeof LexicalItemSchema>
export type Topic = z.infer<typeof TopicSchema>
export type FlashcardDeck = z.infer<typeof FlashcardDeckSchema>
export type IpaSymbol = z.infer<typeof IpaSymbolSchema>
export type GrammarPoint = z.infer<typeof GrammarPointSchema>
