/**
 * @file CourseBasicInfoTab.tsx
 * @description Component giao diện CourseBasicInfoTab phục vụ khu vực Quản trị Admin
 */

import { useState, useMemo, useEffect } from 'react'
import { FileSpreadsheet, Eye, Award, UserCheck, X } from 'lucide-react'
import { categoryLabels, levelLabels } from '@/data/courses-data'
import { R2MediaUploader } from '@/components/admin/R2MediaUploader'
import { CustomSelect, type SelectOption } from '@/components/common/CustomSelect'
import { ExcelQuizImporterModal } from '@/components/admin/ExcelQuizImporterModal'
import { ModuleQuestionViewerModal } from '@/components/admin/ModuleQuestionViewerModal'
import type { QuizQuestionItem } from '@/services/ai.service'
import { COURSE_REGEX } from '@/helpers/course.helper'
import { useAuthStore } from '@/store/auth-store'

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
  author_id?: string
  author_name?: string
  author_email?: string
  author_avatar?: string
  author_title?: string
  author_bio?: string
  pre_test_exam_id?: string
  final_test_exam_id?: string
  final_test_passing_score?: number
  final_test_questions?: QuizQuestionItem[]
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
  duration_seconds?: number
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
  is_free_preview?: boolean
  passing_score?: number
  test_questions?: QuizQuestionItem[]
  challenge_test_exam_id?: string
  challenge_passing_score?: number
  challenge_questions?: QuizQuestionItem[]
  post_mini_test_exam_id?: string
  post_mini_passing_score?: number
  post_mini_questions?: QuizQuestionItem[]
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
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)
  const [previewAvatarModal, setPreviewAvatarModal] = useState(false)

  const categoryOptions: SelectOption[] = useMemo(() => {
    return Object.entries(categoryLabels).map(([key, label]) => ({
      value: key,
      label: isVi ? label.vi : label.en,
    }))
  }, [isVi])

  const levelOptions: SelectOption[] = useMemo(() => {
    return Object.entries(levelLabels).map(([key, label]) => ({
      value: key,
      label: isVi ? label.vi : label.en,
    }))
  }, [isVi])

  const finalQuestionsCount = formData.final_test_questions?.length || 0

  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)

  useEffect(() => {
    if (!formData.author_name && (profile || user)) {
      const userPayload = user as unknown as Record<string, unknown>
      const fullName =
        profile?.full_name ||
        (userPayload?.full_name as string) ||
        (userPayload?.name as string) ||
        (user?.email ? user.email.split('@')[0] : '')
      if (fullName) {
        onChange({
          author_id: profile?.user_id || user?.user_id,
          author_name: String(fullName),
          author_email: profile?.email || user?.email || '',
          author_avatar: profile?.avatar_url || (userPayload?.avatar_url as string) || (userPayload?.avatar as string) || '',
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
                  onChange({
                    title: newTitle,
                  })
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
                  {isVi ? 'Trình độ phù hợp' : 'Level'}
                </label>
                <CustomSelect
                  options={levelOptions}
                  value={formData.level}
                  onChange={(val) => onChange({ level: val })}
                  placeholder={isVi ? 'Chọn trình độ...' : 'Select level...'}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Mục tiêu điểm' : 'Target Score'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={990}
                  value={formData.target_score}
                  onChange={(e) =>
                    onChange({
                      target_score: Math.max(0, Math.min(990, Number(e.target.value) || 0)),
                    })
                  }
                  placeholder="VD: 750"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Giá gốc (VNĐ)' : 'Price (VND)'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => onChange({ price: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Giá khuyến mãi (VNĐ)' : 'Discount Price (VND)'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.discount_price}
                  onChange={(e) => onChange({ discount_price: Math.max(0, Number(e.target.value) || 0) })}
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{isVi ? 'Thông tin người tạo / Giảng viên phụ trách' : 'Instructor & Creator Information'}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {isVi ? 'Chỉ xem' : 'Read-only'}
                </span>
              </div>

              <div className="flex items-center gap-3.5 pt-1">
                <div className="shrink-0">
                  {formData.author_avatar ? (
                    <button
                      type="button"
                      onClick={() => setPreviewAvatarModal(true)}
                      className="group relative cursor-pointer rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform hover:scale-105"
                      title={isVi ? 'Bấm vào ảnh để phóng to xem' : 'Click to zoom avatar'}
                    >
                      <img
                        src={formData.author_avatar}
                        alt={formData.author_name || 'Avatar'}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:opacity-90 transition-all dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                      />
                    </button>
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-900/40">
                      {formData.author_name ? formData.author_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                      {isVi ? 'Họ tên Giảng viên' : 'Instructor Name'}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {formData.author_name || (isVi ? 'Giảng viên LingoSphere' : 'Instructor')}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                      {isVi ? 'Chức danh / Học vị' : 'Academic Title'}
                    </span>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                      {formData.author_title || (isVi ? 'Giảng viên chuyên môn' : 'Lecturer')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-400">
                  {isVi ? 'Email liên hệ:' : 'Email:'}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
                  {formData.author_email || 'admin@lingosphere.edu.vn'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-500/20 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/30">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isVi ? '2. Bài kiểm tra Tốt nghiệp Khóa học (Final Test)' : '2. Course Final Test (Graduation Test)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVi
                  ? 'Upload đề thi tốt nghiệp cuối khóa từ file Excel (.xlsx).'
                  : 'Upload graduation final exam from Excel file (.xlsx).'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {finalQuestionsCount > 0
                  ? `✅ Đã có ${finalQuestionsCount} câu hỏi trong đề thi Final Test`
                  : '⚠️ Chưa nạp câu hỏi cho bài thi Final Test'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isVi
                  ? 'Đề thi Final Test dùng để đo lường mức độ tiến bộ vượt bậc so với Baseline ban đầu.'
                  : 'Final test measures student score growth compared to their baseline.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Upload File Excel (.xlsx)</span>
              </button>

              {finalQuestionsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsViewerModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Eye className="h-4 w-4 text-indigo-500" />
                  <span>Xem/Sửa câu hỏi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ExcelQuizImporterModal
        key="final-test-excel-modal"
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onApplyQuestions={(q, mode = 'append') => {
          const existing = formData.final_test_questions || []
          const combined = mode === 'append' ? [...existing, ...q] : q
          onChange({ final_test_questions: combined })
        }}
        moduleTitle={`Final Test Khóa Học: ${formData.title || 'Khóa học'}`}
        existingQuestionsCount={formData.final_test_questions?.length || 0}
      />

      <ModuleQuestionViewerModal
        key="final-test-viewer-modal"
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        questions={formData.final_test_questions || []}
        onSaveQuestions={(q) => onChange({ final_test_questions: q })}
        moduleTitle={formData.title || 'Khóa học'}
        testTitle={`Bài Kiểm Tra Tốt Nghiệp Final Test`}
      />

      {previewAvatarModal && formData.author_avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setPreviewAvatarModal(false)}
        >
          <div
            className="relative max-w-md max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 truncate">
                {formData.author_name || (isVi ? 'Ảnh đại diện Giảng viên' : 'Instructor Avatar')}
              </span>
              <button
                type="button"
                onClick={() => setPreviewAvatarModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/40 rounded-2xl mt-1">
              <img
                src={formData.author_avatar}
                alt={formData.author_name || 'Avatar'}
                className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
