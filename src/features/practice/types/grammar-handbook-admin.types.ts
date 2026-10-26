/**
 * @file grammar-handbook-admin.types.ts
 * @description Types cho phân hệ Quản lý Sổ tay 44 Ngữ pháp & Mẹo TOEIC Tips trên Frontend Admin
 */

export interface GrammarFormulaDetailExample {
  sentence_en: string
  sentence_vi: string
  highlight?: string
}

export interface GrammarFormulaDetail {
  form_type: string
  form_label: string
  pattern: string
  explanation?: string
  examples: GrammarFormulaDetailExample[]
}

export interface GrammarHandbookItem {
  _id: string
  title_en: string
  title_vi: string
  slug: string
  category: string
  cefr_level: string
  image_url?: string
  description_en?: string
  description_vi?: string
  rule_en?: string
  rule_vi?: string
  structure_form?: string
  formula_details: GrammarFormulaDetail[]
  common_mistakes?: string
  usage_notes?: string
  toeic_relevance: number
  is_featured: boolean
  is_published: boolean
  created_at?: string
  updated_at?: string
}

export type GrammarHandbookPayload = Partial<Omit<GrammarHandbookItem, '_id' | 'created_at' | 'updated_at'>>

export interface GrammarHandbookQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  cefr_level?: string
  is_published?: boolean
  is_featured?: boolean
}

export interface GrammarHandbookPageResponse {
  items: GrammarHandbookItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ==================== TOEIC TIPS TYPES ====================

export interface ToeicTipExample {
  question: string
  options: string[]
  correct_answer: string
  explanation: string
}

export interface ToeicTipItem {
  _id: string
  title: string
  skill: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' | string
  part?: string
  summary: string
  content_markdown: string
  traps: string[]
  key_takeaways: string[]
  examples: ToeicTipExample[]
  image_url?: string
  order: number
  is_published: boolean
  created_at?: string
  updated_at?: string
}

export type ToeicTipPayload = Partial<Omit<ToeicTipItem, '_id' | 'created_at' | 'updated_at'>>

export interface ToeicTipQuery {
  page?: number
  limit?: number
  search?: string
  skill?: string
  part?: string
  is_published?: boolean
}

export interface ToeicTipPageResponse {
  items: ToeicTipItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

