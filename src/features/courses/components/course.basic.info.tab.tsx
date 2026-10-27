import type { CourseAssessmentConfig } from './course.assessment.config.fields'
// Tab thong tin co ban cua khoa hoc.

import { useMemo, useEffect } from 'react'
import { NumberInput } from '@/components/number.input'
import { categoryLabels } from '@/features/courses/data/courses.data'
import { R2MediaUploader } from '@/features/media/components/r2.media.uploader'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import type { QuizQuestionItem } from '@/features/courses/schemas/course.schema'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { CourseInstructorCard } from '@/features/courses/components/course.instructor.card'
import { CourseFinalTestCard } from '@/features/courses/components/course.final.test.card'
import { generateSlug } from '@/features/courses/helpers/course.helper'

export interface CourseFormData {
  assessment_config?: CourseAssessmentConfig
  title: string
  slug: string
  description: string
  category: string
  target_score: number
  price: number
  discount_price: number
  thumbnail_url: string
  document_url?: string
  document_name?: string
  is_published: boolean
  author_id?: string
  author_name?: string
  author_email?: string
  author_avatar?: string
  author_title?: string
  author_bio?: string
  pre_test_exam_id?: string
  final_test_exam_id?: string
  final_test_passing_score?: number
  final_test_duration_minutes?: number
  final_test_questions?: QuizQuestionItem[]
  final_test_audio_url?: string
  final_test_speaking_prompt?: string
  final_test_speaking_file_url?: string
  final_test_writing_prompt?: string
  final_test_writing_file_url?: string
  modules: CourseModule[]
}

export type LessonQuestion = QuizQuestionItem

export interface CourseLesson {
  id: string
  title: string
  video_url: string
  duration_minutes: number
  duration_seconds?: number
  content: string
  is_preview: boolean
  lesson_order: number
  theory_file_url?: string
  theory_file_name?: string
  pending_video_name?: string
  pending_theory_name?: string
  questions?: QuizQuestionItem[]
}

export interface CourseModule {
  assessment_config?: CourseAssessmentConfig
  id: string
  title: string
  description: string
  module_order: number
  theory_file_url?: string
  theory_file_name?: string
  pending_theory_name?: string
  created_at_timestamp?: number
  is_free_preview?: boolean
  passing_score?: number
  duration_minutes?: number
  test_questions?: QuizQuestionItem[]
  challenge_test_exam_id?: string
  challenge_passing_score?: number
  challenge_duration_minutes?: number
  challenge_questions?: QuizQuestionItem[]
  post_mini_test_exam_id?: string
  post_mini_passing_score?: number
  post_mini_questions?: QuizQuestionItem[]
  test_audio_url?: string
  challenge_audio_url?: string
  audio_url?: string
  speaking_prompt?: string
  speaking_file_url?: string
  writing_prompt?: string
  writing_file_url?: string
  lessons: CourseLesson[]
}

interface CourseBasicInfoTabProps {
  formData: CourseFormData
  onChange: (updated: Partial<CourseFormData>) => void
  isVi: boolean
  courseFolder?: string
}

export function CourseBasicInfoTab({
  formData,
  onChange,
  isVi,
  courseFolder,
}: CourseBasicInfoTabProps) {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)

  const categoryOptions: SelectOption[] = useMemo(() => {
    return Object.entries(categoryLabels).map(([key, label]) => ({
      value: key,
      label: isVi ? label.vi : label.en,
    }))
  }, [isVi])

  useEffect(() => {
    if (!formData.author_name && (profile || user)) {
      const currentAuthorId = user?.user_id || profile?.user_id
      const currentFullName = profile?.full_name || user?.full_name
      if (currentFullName && currentAuthorId) {
        onChange({
          author_id: currentAuthorId,
          author_name: currentFullName,
          author_email: profile?.email || user?.email || '',
          author_avatar: profile?.avatar_url || user?.avatar_url || '',
          author_title: (profile?.role || user?.role) === 'INSTRUCTOR' ? 'Giảng viên chuyên môn' : 'Quản trị viên học thuật',
        })
      }
    }
  }, [profile, user, formData.author_name, onChange])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{isVi ? '1. Thông tin cơ bản khóa học' : '1. Basic Course Information'}</span>
          </h2>
          <div className="flex items-center gap-2.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer" onClick={() => onChange({ is_published: !formData.is_published })}>
              {isVi ? 'Công khai khóa học' : 'Published'}
            </label>
            <button
              type="button"
              onClick={() => onChange({ is_published: !formData.is_published })}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.is_published ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  formData.is_published ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Tên khóa học' : 'Course Title'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value
                  const currentSlug = formData.slug ? formData.slug.trim() : ''
                  const prevAutoSlug = formData.title ? generateSlug(formData.title.trim()) : ''
                  if (!currentSlug || currentSlug === prevAutoSlug) {
                    onChange({ title: newTitle, slug: generateSlug(newTitle) })
                  } else {
                    onChange({ title: newTitle })
                  }
                }}
                placeholder={isVi ? 'VD: Khóa học TOEIC 4 Kỹ Năng 750+ Bứt Phá' : 'Enter course title...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Danh mục khóa học' : 'Category'} <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(val) => onChange({ category: val })}
                  placeholder={isVi ? 'Chọn danh mục...' : 'Select category...'}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Mục tiêu điểm' : 'Target Score'}
                </label>
                <NumberInput
                  min={0}
                  max={990}
                  fallbackValue={0}
                  value={formData.target_score}
                  onChange={(val) => onChange({ target_score: val })}
                  placeholder="VD: 750"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Giá gốc (VNĐ)' : 'Price (VND)'}
                </label>
                <NumberInput
                  min={0}
                  fallbackValue={0}
                  value={formData.price}
                  onChange={(val) => onChange({ price: val })}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Giá khuyến mãi (VNĐ)' : 'Discount Price (VND)'}
                </label>
                <NumberInput
                  min={0}
                  fallbackValue={0}
                  value={formData.discount_price}
                  onChange={(val) => onChange({ discount_price: val })}
                  className={`w-full h-11 rounded-xl border bg-slate-50 px-3.5 text-xs text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100 font-semibold ${
                    formData.discount_price > 0 && formData.discount_price >= formData.price
                      ? 'border-rose-500 focus:border-rose-500 text-rose-600 dark:text-rose-400'
                      : 'border-slate-200 focus:border-indigo-500 dark:border-slate-800'
                  }`}
                />
                {formData.discount_price > 0 && formData.discount_price >= formData.price && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {isVi
                      ? '⚠️ Giá khuyến mãi phải thấp hơn giá gốc của khóa học.'
                      : '⚠️ Discount price must be lower than original price.'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Mô tả tóm tắt khóa học' : 'Description'}
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder={isVi ? 'Nhập nội dung mô tả khóa học, mục tiêu đạt được và đối tượng học viên phù hợp...' : 'Course Description'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100 resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-start space-y-4">
            <R2MediaUploader
              type="image"
              value={formData.thumbnail_url}
              onChange={(url) => onChange({ thumbnail_url: url })}
              folder={courseFolder || (formData.slug ? `courses/${formData.slug}` : 'courses')}
              label={isVi ? 'Ảnh Thumbnail Khóa Học' : 'Course Thumbnail'}
              isVi={isVi}
            />

            <R2MediaUploader
              type="document"
              value={formData.document_url || ''}
              fileName={formData.document_name || ''}
              onChange={(url) => onChange({ document_url: url })}
              onFileNameChange={(name) => onChange({ document_name: name })}
              folder={courseFolder || (formData.slug ? `courses/${formData.slug}/documents` : 'courses/documents')}
              label={isVi ? 'Tài liệu / Giáo trình tổng quan khóa học' : 'Course Handbook / Syllabus Document'}
              isVi={isVi}
            />

            <CourseInstructorCard formData={formData} isVi={isVi} />
          </div>
        </div>
      </div>

      <CourseFinalTestCard formData={formData} onChange={onChange} isVi={isVi} />
    </div>
  )
}
