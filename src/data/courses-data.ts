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
  is_published: boolean
  author_id: string
  author_name: string
  created_at: string

  enrollments: number
  completed_count: number
  avg_progress: number
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
  TOEIC_LISTENING: { vi: 'Nghe TOEIC', en: 'TOEIC Listening' },
  TOEIC_READING: { vi: 'Đọc TOEIC', en: 'TOEIC Reading' },
  GRAMMAR: { vi: 'Ngữ pháp', en: 'Grammar' },
  VOCABULARY: { vi: 'Từ vựng', en: 'Vocabulary' },
}

export const categoryColors: Record<string, { bg: string; text: string }> = {
  TOEIC_LISTENING: { bg: 'var(--info-soft)', text: 'var(--info)' },
  TOEIC_READING: { bg: 'var(--success-soft)', text: 'var(--success)' },
  GRAMMAR: { bg: 'var(--ai-soft)', text: 'var(--ai)' },
  VOCABULARY: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
}

export const levelLabels: Record<string, { vi: string; en: string }> = {
  BEGINNER: { vi: 'Sơ cấp', en: 'Beginner' },
  INTERMEDIATE: { vi: 'Trung cấp', en: 'Intermediate' },
  ADVANCED: { vi: 'Nâng cao', en: 'Advanced' },
}

export const levelColors: Record<string, { bg: string; text: string }> = {
  BEGINNER: { bg: 'var(--success-soft)', text: 'var(--success)' },
  INTERMEDIATE: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
  ADVANCED: { bg: 'var(--error)', text: '#fff' },
}

export const mockCourses: Course[] = [
  {
    id: 'course-001',
    title: 'Luyện nghe TOEIC Part 1-2',
    slug: 'luyen-nghe-toeic-part-1-2',
    description: 'Khóa học luyện nghe TOEIC phần 1-2, tập trung vào mô tả hình ảnh và câu hỏi đáp án.',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400',
    target_score: 450,
    category: 'TOEIC_LISTENING',
    level: 'BEGINNER',
    total_modules: 4,
    total_lessons: 24,
    price: 299000,
    is_published: true,
    author_id: 'teacher-001',
    author_name: 'Lan Chi',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 1250,
    completed_count: 420,
    avg_progress: 65,
  },
  {
    id: 'course-002',
    title: 'Luyện nghe TOEIC Part 3-4',
    slug: 'luyen-nghe-toeic-part-3-4',
    description: 'Khóa học luyện nghe TOEIC phần 3-4, hội thoại và bài nói ngắn.',
    thumbnail_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
    target_score: 550,
    category: 'TOEIC_LISTENING',
    level: 'INTERMEDIATE',
    total_modules: 6,
    total_lessons: 36,
    price: 399000,
    is_published: true,
    author_id: 'teacher-001',
    author_name: 'Lan Chi',
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 980,
    completed_count: 310,
    avg_progress: 58,
  },
  {
    id: 'course-003',
    title: 'Đọc hiểu TOEIC Part 5-6',
    slug: 'doc-hieu-toeic-part-5-6',
    description: 'Khóa học luyện đọc TOEIC phần 5-6, hoàn thành câu và hoàn thành đoạn văn.',
    thumbnail_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    target_score: 650,
    category: 'TOEIC_READING',
    level: 'INTERMEDIATE',
    total_modules: 5,
    total_lessons: 30,
    price: 449000,
    is_published: true,
    author_id: 'teacher-002',
    author_name: 'Đức Minh',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 720,
    completed_count: 245,
    avg_progress: 52,
  },
  {
    id: 'course-004',
    title: 'Đọc hiểu TOEIC Part 7',
    slug: 'doc-hieu-toeic-part-7',
    description: 'Khóa học luyện đọc TOEIC phần 7, đoạn văn đọc hiểu đơn và kép.',
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    target_score: 750,
    category: 'TOEIC_READING',
    level: 'ADVANCED',
    total_modules: 8,
    total_lessons: 48,
    price: 599000,
    is_published: true,
    author_id: 'teacher-002',
    author_name: 'Đức Minh',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 580,
    completed_count: 180,
    avg_progress: 48,
  },
  {
    id: 'course-005',
    title: 'Ngữ pháp TOEIC cơ bản',
    slug: 'ngu-phap-toeic-co-ban',
    description: 'Khóa học ngữ pháp TOEIC từ cơ bản đến nâng cao, phù hợp cho người mới bắt đầu.',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    target_score: 450,
    category: 'GRAMMAR',
    level: 'BEGINNER',
    total_modules: 6,
    total_lessons: 36,
    price: 199000,
    is_published: true,
    author_id: 'teacher-001',
    author_name: 'Lan Chi',
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 2100,
    completed_count: 890,
    avg_progress: 72,
  },
  {
    id: 'course-006',
    title: 'Từ vựng TOEIC 450',
    slug: 'tu-vung-toeic-450',
    description: 'Học 450 từ vựng TOEIC thiết yếu với hình ảnh và ví dụ thực tế.',
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    target_score: 450,
    category: 'VOCABULARY',
    level: 'BEGINNER',
    total_modules: 10,
    total_lessons: 60,
    price: 0,
    is_published: true,
    author_id: 'teacher-001',
    author_name: 'Lan Chi',
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 4500,
    completed_count: 2100,
    avg_progress: 78,
  },
  {
    id: 'course-007',
    title: 'Từ vựng TOEIC 750',
    slug: 'tu-vung-toeic-750',
    description: 'Học 750 từ vựng TOEIC nâng cao cho mục tiêu 700+.',
    thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    target_score: 750,
    category: 'VOCABULARY',
    level: 'ADVANCED',
    total_modules: 12,
    total_lessons: 72,
    price: 499000,
    is_published: false,
    author_id: 'teacher-002',
    author_name: 'Đức Minh',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 0,
    completed_count: 0,
    avg_progress: 0,
  },
  {
    id: 'course-008',
    title: 'Luyện đề TOEIC Full Test',
    slug: 'luyen-de-toeic-full-test',
    description: 'Luyện tập đề thi TOEIC full test với giải thích chi tiết từng câu.',
    thumbnail_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    target_score: 900,
    category: 'VOCABULARY',
    level: 'ADVANCED',
    total_modules: 20,
    total_lessons: 120,
    price: 799000,
    is_published: true,
    author_id: 'teacher-001',
    author_name: 'Lan Chi',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    enrollments: 890,
    completed_count: 156,
    avg_progress: 35,
  },
]

export function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí'
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
