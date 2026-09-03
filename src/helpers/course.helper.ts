/**
 * @file course.helper.ts
 * @description Mã nguồn thành phần course.helper.ts
 */

export type FilterCategory = 'ALL' | 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS'
export type FilterLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT'

export const getCategoryBadgeClass = (category: string): string => {
  switch (category) {
    case 'TOEIC_2_SKILLS':
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
    case 'TOEIC_4_SKILLS':
      return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
    default:
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
  }
}

export const getLevelBadgeClass = (level: string): string => {
  switch (level) {
    case 'BEGINNER':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50'
    case 'INTERMEDIATE':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50'
    case 'ADVANCED':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

export const COURSE_REGEX = {
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^(https?:\/\/.+|\/.*)$/,
  INTEGER_NON_NEGATIVE: /^\d+$/,
  TOEIC_SCORE: /^(?:[1-9]\d{1,2}|990)$/,
  EXCEL_FILE: /\.(xlsx|xls)$/i,
  AUDIO_FILE: /\.(mp3|wav|m4a|ogg)$/i,
  IMAGE_FILE: /\.(jpe?g|png|webp|gif)$/i,
  VIDEO_FILE: /\.(mp4|webm|mov|mkv)$/i,
  CORRECT_ANSWER: /^[A-D]$/i,
}

export function validateCourseFormData(formData: any, isVi: boolean = true): string | null {
  if (!formData.title || !formData.title.trim() || formData.title.trim().length < 3) {
    return isVi ? 'Tên khóa học phải có ít nhất 3 ký tự' : 'Course title must be at least 3 characters'
  }
  if (formData.title.trim().length > 200) {
    return isVi ? 'Tên khóa học không được vượt quá 200 ký tự' : 'Course title cannot exceed 200 characters'
  }
  if (formData.slug && !COURSE_REGEX.SLUG.test(formData.slug)) {
    return isVi
      ? 'Đường dẫn rút gọn (Slug) không hợp lệ. Chỉ chấp nhận chữ thường, số và dấu gạch ngang (VD: khoa-hoc-toeic-550)'
      : 'Invalid slug format. Use lowercase letters, numbers, and hyphens (e.g. toeic-550-course)'
  }
  if (formData.target_score !== undefined && formData.target_score !== null) {
    const score = Number(formData.target_score)
    if (isNaN(score) || score < 10 || score > 990) {
      return isVi ? 'Điểm mục tiêu TOEIC phải từ 10 đến 990' : 'Target TOEIC score must be between 10 and 990'
    }
  }
  const price = Number(formData.price || 0)
  const discountPrice = Number(formData.discount_price || 0)
  if (price < 0 || isNaN(price)) {
    return isVi ? 'Giá gốc khóa học không được âm' : 'Price cannot be negative'
  }
  if (discountPrice < 0 || isNaN(discountPrice)) {
    return isVi ? 'Giá khuyến mãi không được âm' : 'Discount price cannot be negative'
  }
  if (discountPrice > 0 && discountPrice >= price) {
    return isVi ? 'Giá khuyến mãi phải thấp hơn giá gốc của khóa học' : 'Discount price must be lower than original price'
  }
  if (formData.author_email && String(formData.author_email).trim()) {
    if (!COURSE_REGEX.EMAIL.test(String(formData.author_email).trim())) {
      return isVi ? 'Email giảng viên phụ trách không hợp lệ (VD: giangvien@lingosphere.vn)' : 'Invalid instructor email format'
    }
  }
  if (formData.author_avatar && String(formData.author_avatar).trim()) {
    if (!COURSE_REGEX.URL.test(String(formData.author_avatar).trim())) {
      return isVi ? 'Link ảnh đại diện giảng viên phải là URL hợp lệ' : 'Instructor avatar must be a valid URL'
    }
  }
  if (formData.thumbnail_url && String(formData.thumbnail_url).trim()) {
    if (!COURSE_REGEX.URL.test(String(formData.thumbnail_url).trim())) {
      return isVi ? 'Ảnh bìa khóa học phải là URL hợp lệ' : 'Course thumbnail must be a valid URL'
    }
  }
  if (Array.isArray(formData.modules)) {
    for (let i = 0; i < formData.modules.length; i++) {
      const m = formData.modules[i]
      if (!m.title || !m.title.trim() || m.title.trim().length < 2) {
        return isVi ? `Chương số ${i + 1} chưa có tiêu đề (tối thiểu 2 ký tự)` : `Module ${i + 1} title must be at least 2 characters`
      }
      if (Array.isArray(m.lessons)) {
        for (let j = 0; j < m.lessons.length; j++) {
          const l = m.lessons[j]
          if (!l.title || !l.title.trim() || l.title.trim().length < 2) {
            return isVi ? `Bài học số ${j + 1} của Chương ${i + 1} chưa có tên bài` : `Lesson ${j + 1} of Module ${i + 1} must have a title`
          }
          if (l.video_url && String(l.video_url).trim() && !COURSE_REGEX.URL.test(String(l.video_url).trim())) {
            return isVi ? `Link video của bài học "${l.title}" không đúng định dạng URL` : `Video URL for "${l.title}" is invalid`
          }
        }
      }
    }
  }
  return null
}
