import { Image } from 'lucide-react'
import { categoryLabels, levelLabels } from '@/data/courses-data'

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
  lessons: CourseLesson[]
}

interface CourseBasicInfoTabProps {
  formData: CourseFormData
  onChange: (updated: Partial<CourseFormData>) => void
  onGenerateSlug: () => void
  isVi: boolean
}

export function CourseBasicInfoTab({
  formData,
  onChange,
  onGenerateSlug,
  isVi,
}: CourseBasicInfoTabProps) {
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
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder={isVi ? 'VD: TOEIC Master 750+ Chuyên Sâu Listening & Reading' : 'Course Title'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Slug (URL) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={onGenerateSlug}
                className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {isVi ? 'Tạo tự động' : 'Auto Generate'}
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder="toeic-master-750-chuyen-sau"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Danh mục' : 'Category'}
            </label>
            <select
              value={formData.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label[isVi ? 'vi' : 'en']}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Trình độ yêu cầu' : 'Level'}
            </label>
            <select
              value={formData.level}
              onChange={(e) => onChange({ level: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              {Object.entries(levelLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label[isVi ? 'vi' : 'en']}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Mục tiêu điểm đầu ra' : 'Target Score'}
            </label>
            <input
              type="number"
              value={formData.target_score}
              onChange={(e) => onChange({ target_score: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Giá gốc (VNĐ)' : 'Price (VND)'}
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => onChange({ price: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Giá khuyến mãi (VNĐ)' : 'Discount Price (VND)'}
            </label>
            <input
              type="number"
              value={formData.discount_price}
              onChange={(e) => onChange({ discount_price: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Ảnh Thumbnail URL' : 'Thumbnail URL'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.thumbnail_url}
                onChange={(e) => onChange({ thumbnail_url: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
              {formData.thumbnail_url && (
                <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
