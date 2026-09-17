/**
 * @file courses.data.ts
 * @description Mã nguồn thành phần courses-data.ts
 */

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url?: string
  target_score: number
  category: 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS'
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
  TOEIC_2_SKILLS: { vi: 'TOEIC 2 Kỹ Năng', en: 'TOEIC 2 Skills' },
  TOEIC_4_SKILLS: { vi: 'TOEIC 4 Kỹ Năng', en: 'TOEIC 4 Skills' },
}

export const categoryColors: Record<string, { bg: string; text: string }> = {
  TOEIC_2_SKILLS: { bg: 'var(--info-soft)', text: 'var(--info)' },
  TOEIC_4_SKILLS: { bg: 'var(--success-soft)', text: 'var(--success)' },
}

export const statusLabels: Record<string, { vi: string; en: string }> = {
  PUBLISHED: { vi: 'Đã xuất bản', en: 'Published' },
  DRAFT: { vi: 'Bản nháp', en: 'Draft' },
  ARCHIVED: { vi: 'Đã lưu trữ', en: 'Archived' },
}
