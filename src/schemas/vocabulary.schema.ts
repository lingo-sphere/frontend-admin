/**
 * @file vocabulary.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ vocabulary
 */

import { z } from 'zod'

export const WordMeaningSchema = z.object({
  meaning_order: z.number().optional(),
  part_of_speech: z.string().optional(),
  definition_en: z.string(),
  definition_vi: z.string(),
  short_meaning_vi: z.string().optional(),
  examples: z.array(z.string()).optional(),
  is_primary: z.boolean().optional(),
}).passthrough()

export const LexicalItemSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  word: z.string(),
  word_lowercase: z.string().optional(),
  slug: z.string().optional(),
  word_type: z.string().default('NOUN'),
  cefr_level: z.string().default('A1'),
  pronunciation_us: z.string().optional(),
  pronunciation_uk: z.string().optional(),
  audio_url_us: z.string().optional(),
  audio_url_uk: z.string().optional(),
  is_active: z.boolean().default(true),
  meanings: z.array(WordMeaningSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough()

export const LexicalItemListSchema = z.array(LexicalItemSchema)

export const TopicSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  name_en: z.string().optional(),
  name_vi: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().default(''),
  description: z.string().optional(),
  description_en: z.string().optional(),
  description_vi: z.string().optional(),
  icon_url: z.string().optional(),
  lexical_count: z.number().optional(),
  words_count: z.number().optional(),
  is_featured: z.boolean().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
}).passthrough()

export const TopicListSchema = z.array(TopicSchema)

export const FlashcardDeckSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  title: z.string().default(''),
  name: z.string().optional(),
  name_vi: z.string().optional(),
  description: z.string().optional(),
  creator_id: z.string().optional(),
  is_public: z.boolean().default(true),
  is_system: z.boolean().optional(),
  total_cards: z.number().default(0),
  card_count: z.number().optional(),
  rating: z.number().optional(),
  enrolled_count: z.number().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.string().optional(),
}).passthrough()

export const FlashcardDeckListSchema = z.array(FlashcardDeckSchema)

export const IpaSymbolSchema = z.object({
  _id: z.string(),
  symbol: z.string(),
  symbol_type: z.string().optional(),
  example_word: z.string().optional(),
  audio_url: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
}).passthrough()

export const IpaSymbolListSchema = z.array(IpaSymbolSchema)

export const GrammarPointSchema = z.object({
  _id: z.string(),
  title: z.string(),
  title_vi: z.string().optional(),
  level: z.string().optional(),
  category: z.string().optional(),
  rule_explanation: z.string().optional(),
  examples: z.array(z.string()).optional(),
  created_at: z.string().optional(),
}).passthrough()

export const GrammarPointListSchema = z.array(GrammarPointSchema)

export type WordMeaning = z.infer<typeof WordMeaningSchema>
export type LexicalItem = z.infer<typeof LexicalItemSchema>
export type Topic = z.infer<typeof TopicSchema>
export type FlashcardDeck = z.infer<typeof FlashcardDeckSchema>
export type IpaSymbol = z.infer<typeof IpaSymbolSchema>
export type GrammarPoint = z.infer<typeof GrammarPointSchema>
