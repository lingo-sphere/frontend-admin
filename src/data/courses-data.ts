export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url?: string
  target_score: number
  category: 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS'
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
  TOEIC_2_SKILLS: { vi: 'TOEIC 2 Kỹ Năng (Listening - Reading)', en: 'TOEIC 2 Skills (LR)' },
  TOEIC_4_SKILLS: { vi: 'TOEIC 4 Kỹ Năng (Full Skills L-R-S-W)', en: 'TOEIC 4 Skills (Full)' },
}

export const categoryColors: Record<string, { bg: string; text: string }> = {
  TOEIC_2_SKILLS: { bg: 'var(--info-soft)', text: 'var(--info)' },
  TOEIC_4_SKILLS: { bg: 'var(--success-soft)', text: 'var(--success)' },
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
