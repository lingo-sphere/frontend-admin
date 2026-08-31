import { useState, useMemo, useEffect } from 'react'
import { Sparkles, FileSpreadsheet, Eye, Award } from 'lucide-react'
import { categoryLabels, levelLabels } from '@/data/courses-data'
import { R2MediaUploader } from '@/components/admin/R2MediaUploader'
import { CustomSelect, type SelectOption } from '@/components/common/CustomSelect'
import { examService, type ToeicExamItem } from '@/services/exam.service'
import { AiQuizGeneratorModal } from '@/components/admin/AiQuizGeneratorModal'
import { ExcelQuizImporterModal } from '@/components/admin/ExcelQuizImporterModal'
import { ModuleQuestionViewerModal } from '@/components/admin/ModuleQuestionViewerModal'
import type { QuizQuestionItem } from '@/services/ai.service'
import { generateSlug } from '@/helpers/course.helper'

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
  const [exams, setExams] = useState<ToeicExamItem[]>([])
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)

  useEffect(() => {
    examService.getExams().then((res) => {
      if (Array.isArray(res)) setExams(res)
    })
  }, [])

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

  const examOptions: SelectOption[] = useMemo(() => {
    const defaultOpt: SelectOption = {
      value: '',
      label: isVi ? '-- Soạn trực tiếp bằng AI / Excel --' : '-- Direct AI / Excel quiz --',
    }
    const list = exams.map((ex) => ({
      value: ex.id || ex._id || '',
      label: `${ex.title} (${ex.type || 'EXAM'})`,
    }))
    return [defaultOpt, ...list]
  }, [exams, isVi])

  const finalQuestionsCount = formData.final_test_questions?.length || 0
  const finalPassingScore = formData.final_test_passing_score || 70

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          {isVi ? '1. Thông tin cơ bản khóa học' : '1. Basic Course Information'}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
                  slug: formData.slug || generateSlug(newTitle),
                })
              }}
              placeholder={isVi ? 'VD: Khóa học TOEIC 4 Kỹ Năng 750+ Bứt Phá' : 'Enter course title...'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Đường dẫn tĩnh (Slug)' : 'URL Slug'} <span className="text-rose-500">*</span>
              </label>
              {onGenerateSlug && (
                <button
                  type="button"
                  onClick={onGenerateSlug}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                >
                  {isVi ? 'Tự động tạo từ tiêu đề' : 'Generate from Title'}
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder="toeic-4-ky-nang-750-but-pha"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Danh mục khóa học' : 'Category'} <span className="text-rose-500">*</span>
            </label>
            <CustomSelect
              options={categoryOptions}
              value={formData.category}
              onChange={(val) => onChange({ category: val })}
              placeholder={isVi ? 'Chọn danh mục...' : 'Select category...'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Trình độ phù hợp' : 'Level'}
            </label>
            <CustomSelect
              options={levelOptions}
              value={formData.level}
              onChange={(val) => onChange({ level: val })}
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
              onChange={(e) =>
                onChange({
                  target_score: Math.max(0, Math.min(990, Number(e.target.value) || 0)),
                })
              }
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

      {}
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
                  ? 'Upload đề thi từ file Excel (.xlsx), dùng AI tạo tự động hoặc liên kết đề thi có sẵn.'
                  : 'Upload exam from Excel (.xlsx), generate with AI, or link existing exam.'}
              </p>
            </div>
          </div>

          {}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              {isVi ? 'Ngưỡng tốt nghiệp:' : 'Pass score:'}
            </span>
            <input
              type="number"
              min={10}
              max={100}
              value={finalPassingScore}
              onChange={(e) =>
                onChange({
                  final_test_passing_score: Math.max(10, Math.min(100, Number(e.target.value) || 70)),
                })
              }
              className="w-12 h-7 text-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-indigo-600 dark:bg-slate-900 dark:border-slate-700 dark:text-indigo-400"
            />
            <span className="text-[11px] font-bold text-slate-500">%</span>
          </div>
        </div>

        {}
        <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-4 sm:p-5 space-y-4">
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
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Upload File Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Sinh Đề Tự Động</span>
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

          <div className="pt-3 border-t border-indigo-500/10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isVi ? 'Hoặc liên kết đề thi có sẵn từ kho Exam (Tùy chọn):' : 'Or link existing exam from bank:'}
              </label>
              <CustomSelect
                options={examOptions}
                value={formData.final_test_exam_id || ''}
                onChange={(val) => onChange({ final_test_exam_id: val })}
                placeholder={isVi ? 'Chọn bài Final Test...' : 'Select Final Test...'}
              />
            </div>

            <div className="flex items-center rounded-xl bg-indigo-50/70 p-3 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                💡 <strong>{isVi ? 'Mẹo giảng dạy:' : 'Teaching Tip:'}</strong>{' '}
                {isVi
                  ? 'Bạn có thể upload file Excel đề thi tốt nghiệp 20 - 50 câu hoặc để AI đọc tên khóa học & mục tiêu điểm để tự động sinh trọn bộ đề thi.'
                  : 'Upload an Excel exam file or use AI to generate 20-50 questions matching target score.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {}
      <AiQuizGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyQuestions={(q) => onChange({ final_test_questions: q })}
        moduleTitle={`Đề Thi Tốt Nghiệp Final Test - ${formData.title || 'Khóa học'}`}
        moduleDescription={`Mục tiêu: ${formData.target_score} điểm. ${formData.description || ''}`}
      />

      {}
      <ExcelQuizImporterModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onApplyQuestions={(q) => onChange({ final_test_questions: q })}
        moduleTitle={`Final Test Khóa Học: ${formData.title || 'Khóa học'}`}
      />

      {}
      <ModuleQuestionViewerModal
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        questions={formData.final_test_questions || []}
        onSaveQuestions={(q) => onChange({ final_test_questions: q })}
        moduleTitle={formData.title || 'Khóa học'}
        testTitle={`Bài Kiểm Tra Tốt Nghiệp Final Test`}
      />
    </div>
  )
}
