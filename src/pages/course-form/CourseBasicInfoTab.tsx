import { useState, useMemo } from 'react'
import { categoryLabels, levelLabels } from '@/data/courses-data'
import { R2MediaUploader } from '@/components/admin/R2MediaUploader'
import { CustomSelect, type SelectOption } from '@/components/common/CustomSelect'

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

export interface CourseFormData {
  title: string
  slug: string
  description: string
  category: string
  level: string
  target_score: number
  price: number
  discount_price: number
  thumbnail_url: string
  is_published: boolean
  modules: CourseModule[]
}

export interface LessonQuestion {
  id: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
}

export interface CourseLesson {
  id: string
  title: string
  video_url: string
  duration_minutes: number
  content: string
  is_preview: boolean
  lesson_order: number
  questions?: LessonQuestion[]
}

export interface CourseModule {
  id: string
  title: string
  description: string
  module_order: number
  created_at_timestamp?: number
  lessons: CourseLesson[]
}

interface CourseBasicInfoTabProps {
  formData: CourseFormData
  onChange: (updated: Partial<CourseFormData>) => void
  onGenerateSlug?: () => void
  isVi: boolean
  courseFolder?: string
}

export function CourseBasicInfoTab({
  formData,
  onChange,
  onGenerateSlug,
  isVi,
  courseFolder,
}: CourseBasicInfoTabProps) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  const categoryOptions: SelectOption[] = useMemo(() => {
    return [
      {
        value: 'TOEIC_2_SKILLS',
        label: isVi ? 'TOEIC 2 Kỹ năng (LR)' : 'TOEIC 2 Skills (LR)',
        badge: 'LR',
        badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60',
      },
      {
        value: 'TOEIC_LISTENING',
        label: isVi ? 'Nghe TOEIC (Listening)' : 'TOEIC Listening',
        badge: 'Listening',
        badgeClass: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60',
      },
      {
        value: 'TOEIC_READING',
        label: isVi ? 'Đọc TOEIC (Reading)' : 'TOEIC Reading',
        badge: 'Reading',
        badgeClass: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60',
      },
      {
        value: 'TOEIC_4_SKILLS',
        label: isVi ? 'TOEIC 4 Kỹ năng (Full)' : 'TOEIC 4 Skills (Full)',
        badge: 'Full',
        badgeClass: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60',
      },
      {
        value: 'SPEAKING',
        label: isVi ? 'Luyện nói & Phát âm (Speaking)' : 'Speaking',
        badge: 'Speaking',
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
      },
      {
        value: 'WRITING',
        label: isVi ? 'Luyện viết (Writing)' : 'Writing',
        badge: 'Writing',
        badgeClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60',
      },
      {
        value: 'GRAMMAR',
        label: isVi ? 'Ngữ pháp' : 'Grammar',
        badge: 'Grammar',
        badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60',
      },
      {
        value: 'VOCABULARY',
        label: isVi ? 'Từ vựng SRS' : 'Vocabulary SRS',
        badge: 'SRS',
        badgeClass: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60',
      },
    ]
  }, [isVi])

  const levelOptions: SelectOption[] = useMemo(() => {
    return [
      {
        value: 'BEGINNER',
        label: isVi ? 'Sơ cấp (Beginner)' : 'Beginner',
        badge: 'A1 - A2',
        badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
      },
      {
        value: 'INTERMEDIATE',
        label: isVi ? 'Trung cấp (Intermediate)' : 'Intermediate',
        badge: 'B1 - B2',
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
      },
      {
        value: 'ADVANCED',
        label: isVi ? 'Nâng cao (Advanced)' : 'Advanced',
        badge: 'C1 - C2',
        badgeClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60',
      },
    ]
  }, [isVi])

  const handleTitleChange = (newTitle: string) => {
    if (!isSlugManuallyEdited) {
      onChange({ title: newTitle, slug: generateSlug(newTitle) })
    } else {
      onChange({ title: newTitle })
    }
  }

  const handleSlugChange = (newSlug: string) => {
    setIsSlugManuallyEdited(true)
    onChange({ slug: newSlug })
  }

  const handleAutoSlug = () => {
    setIsSlugManuallyEdited(false)
    const generated = generateSlug(formData.title)
    onChange({ slug: generated })
    onGenerateSlug?.()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          {isVi ? '1. Thông tin chung về khóa học' : '1. General Course Information'}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Tên khóa học' : 'Course Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isVi ? 'VD: TOEIC Master 750+ Chuyên Sâu Listening & Reading' : 'Course Title'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Slug (URL) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
              >
                {isVi ? 'Tạo tự động' : 'Auto Generate'}
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="toeic-master-750-chuyen-sau"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Danh mục' : 'Category'} <span className="text-rose-500">*</span>
            </label>
            <CustomSelect
              value={formData.category}
              onChange={(category) => onChange({ category })}
              options={categoryOptions}
              placeholder={isVi ? 'Chọn danh mục...' : 'Select category...'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Trình độ yêu cầu' : 'Level'} <span className="text-rose-500">*</span>
            </label>
            <CustomSelect
              value={formData.level}
              onChange={(level) => onChange({ level })}
              options={levelOptions}
              placeholder={isVi ? 'Chọn trình độ...' : 'Select level...'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Mục tiêu điểm đầu ra' : 'Target Score'}
            </label>
            <input
              type="number"
              min={0}
              max={990}
              value={formData.target_score}
              onChange={(e) => onChange({ target_score: Math.max(0, Math.min(990, Number(e.target.value) || 0)) })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Giá gốc (VNĐ)' : 'Price (VND)'}
            </label>
            <input
              type="number"
              min={0}
              value={formData.price}
              onChange={(e) => onChange({ price: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Giá khuyến mãi (VNĐ)' : 'Discount Price (VND)'}
            </label>
            <input
              type="number"
              min={0}
              value={formData.discount_price}
              onChange={(e) => onChange({ discount_price: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <R2MediaUploader
              type="image"
              value={formData.thumbnail_url}
              onChange={(url) => onChange({ thumbnail_url: url })}
              folder={courseFolder || (formData.slug ? `courses/${formData.slug}` : 'courses')}
              label={isVi ? 'Ảnh Thumbnail Khóa Học (Cloudflare R2)' : 'Course Thumbnail (Cloudflare R2)'}
              isVi={isVi}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Mô tả tóm tắt khóa học' : 'Description'}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder={isVi ? 'Nhập nội dung mô tả khóa học...' : 'Course Description'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
