export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url?: string
  target_score: number
  category: 'TOEIC_LISTENING' | 'TOEIC_READING' | 'GRAMMAR' | 'VOCABULARY'
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  total_modules: number
  total_lessons: number
  price: number
  discount_price?: number
  is_published: boolean
  author_id: string
  author_name: string
  created_at: string

  enrollments: number
  completed_count: number
  avg_progress: number
  modules?: CourseModule[]
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  is_free_preview: boolean
  total_lessons: number
}

export const categoryLabels: Record<string, { vi: string; en: string }> = {
  TOEIC_LISTENING: { vi: 'Nghe TOEIC (Listening)', en: 'TOEIC Listening' },
  TOEIC_READING: { vi: 'Đọc TOEIC (Reading)', en: 'TOEIC Reading' },
  TOEIC_2_SKILLS: { vi: 'TOEIC 2 Kỹ năng (LR)', en: 'TOEIC 2 Skills (LR)' },
  TOEIC_4_SKILLS: { vi: 'TOEIC 4 Kỹ năng (Full)', en: 'TOEIC 4 Skills (Full)' },
  SPEAKING: { vi: 'Luyện nói & Phát âm (Speaking)', en: 'Speaking' },
  WRITING: { vi: 'Luyện viết (Writing)', en: 'Writing' },
  GRAMMAR: { vi: 'Ngữ pháp', en: 'Grammar' },
  VOCABULARY: { vi: 'Từ vựng SRS', en: 'Vocabulary' },
}

export const categoryColors: Record<string, { bg: string; text: string }> = {
  TOEIC_LISTENING: { bg: 'var(--info-soft)', text: 'var(--info)' },
  TOEIC_READING: { bg: 'var(--success-soft)', text: 'var(--success)' },
  TOEIC_2_SKILLS: { bg: 'var(--info-soft)', text: 'var(--info)' },
  TOEIC_4_SKILLS: { bg: 'var(--success-soft)', text: 'var(--success)' },
  SPEAKING: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
  WRITING: { bg: 'var(--error-soft)', text: 'var(--error)' },
  GRAMMAR: { bg: 'var(--ai-soft)', text: 'var(--ai)' },
  VOCABULARY: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
}

export const levelLabels: Record<string, { vi: string; en: string }> = {
  BEGINNER: { vi: 'Sơ cấp', en: 'Beginner' },
  INTERMEDIATE: { vi: 'Trung cấp', en: 'Intermediate' },
  ADVANCED: { vi: 'Nâng cao', en: 'Advanced' },
}

export const statusLabels: Record<string, { vi: string; en: string }> = {
  PUBLISHED: { vi: 'Đã xuất bản', en: 'Published' },
  DRAFT: { vi: 'Bản nháp', en: 'Draft' },
  ARCHIVED: { vi: 'Đã lưu trữ', en: 'Archived' },
}
