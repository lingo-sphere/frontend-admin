// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ vocabulary trong Admin.

import { z } from 'zod'

export const WordMeaningSchema = z.object({
  meaning_order: z.number().nullable().optional(),
  part_of_speech: z.string().nullable().optional(),
  definition_en: z.string(),
  definition_vi: z.string(),
  short_meaning_vi: z.string().nullable().optional(),
  examples: z.array(z.string()).optional(),
  is_primary: z.boolean().nullable().optional(),
}).passthrough()

export const LexicalItemSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  word: z.string(),
  word_lowercase: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  word_type: z.string().default('NOUN'),
  cefr_level: z.string().default('A1'),
  pronunciation_us: z.string().nullable().optional(),
  pronunciation_uk: z.string().nullable().optional(),
  audio_url_us: z.string().nullable().optional(),
  audio_url_uk: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  meanings: z.array(WordMeaningSchema).optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
  updated_at: z.union([z.string(), z.date()]).nullable().optional(),
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
  lexical_count: z.number().nullable().optional(),
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
  creator_id: z.string().nullable().optional(),
  creator_name: z.string().nullable().optional(),
  is_public: z.boolean().default(true),
  is_system: z.boolean().optional(),
  total_cards: z.number().default(0),
  card_count: z.number().default(0),
  rating: z.number().nullable().optional(),
  enrolled_count: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
}).passthrough()

export const FlashcardDeckListSchema = z.array(FlashcardDeckSchema)

export const IpaSymbolSchema = z.object({
  _id: z.string(),
  symbol: z.string(),
  symbol_type: z.string().nullable().optional(),
  example_word: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.string().optional(),
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
