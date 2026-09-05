/**
 * @file CourseExamModal.tsx
 * @description Modal tạo mới và chỉnh sửa thông tin bài thi (Challenge, Final Test hoặc Đầu vào hệ thống)
 */

import { useState, useEffect } from 'react'
import { FileCheck2, X, Sparkles } from 'lucide-react'
import type { ToeicExamItem, CreateExamDto } from '@/services/exam.service'
import type { CourseSelectItem } from './CourseExamHeaderActions'

interface CourseExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: CreateExamDto, isEdit: boolean, editingExamId?: string) => Promise<void>
  editingExam: ToeicExamItem | null
  courses: CourseSelectItem[]
  selectedCourseId: string
  isTeacher: boolean
  currentUserId: string
  isVi: boolean
}

export function CourseExamModal({
  isOpen,
  onClose,
  onSave,
  editingExam,
  courses,
  selectedCourseId,
  isTeacher,
  currentUserId,
  isVi,
}: CourseExamModalProps) {
  const [formCourseId, setFormCourseId] = useState<string>('')
  const [formTitle, setFormTitle] = useState<string>('')
  const [formType, setFormType] = useState<string>('CHALLENGE_TEST')
  const [formDuration, setFormDuration] = useState<number>(30)
  const [formQuestions, setFormQuestions] = useState<number>(30)
  const [formPassingScore, setFormPassingScore] = useState<number>(70)
  const [formDescription, setFormDescription] = useState<string>('')
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true)
  const [formPlacementSkills, setFormPlacementSkills] = useState<'2SKILLS' | '4SKILLS'>('2SKILLS')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (!isOpen) return

    if (editingExam) {
      const isGlobal = editingExam.is_system_placement || editingExam.type === 'DIAGNOSTIC_TEST' || !editingExam.course_id
      setFormCourseId(isGlobal ? 'GLOBAL_SYSTEM_PLACEMENT' : editingExam.course_id || courses[0]?.id || '')
      setFormTitle(editingExam.title || '')
      setFormType(editingExam.type === 'FULL_TEST' ? 'FULL_TEST' : 'CHALLENGE_TEST')
      setFormPlacementSkills(
        (editingExam.placement_type as '2SKILLS' | '4SKILLS') ||
        (editingExam.skills_enabled === 'ALL' ? '4SKILLS' : '2SKILLS')
      )
      setFormDuration(editingExam.duration_minutes || 30)
      setFormQuestions(editingExam.total_questions || 30)
      setFormPassingScore(editingExam.passing_score || 70)
      setFormDescription(editingExam.description || '')
      setFormIsPublished(editingExam.is_published ?? true)
    } else {
      const defaultCourse = !isTeacher
        ? 'GLOBAL_SYSTEM_PLACEMENT'
        : selectedCourseId !== 'ALL' && selectedCourseId !== 'GLOBAL_SYSTEM'
        ? selectedCourseId
        : courses[0]?.id || ''

      setFormCourseId(defaultCourse)
      setFormTitle('')
      setFormType(!isTeacher ? 'DIAGNOSTIC_TEST' : 'CHALLENGE_TEST')
      setFormPlacementSkills('2SKILLS')
      setFormDuration(!isTeacher ? 60 : 30)
      setFormQuestions(!isTeacher ? 100 : 30)
      setFormPassingScore(!isTeacher ? 500 : 70)
      setFormDescription('')
      setFormIsPublished(true)
    }
  }, [isOpen, editingExam, courses, selectedCourseId, isTeacher])

  if (!isOpen) return null

  const handleFormCourseChange = (val: string) => {
    setFormCourseId(val)
    if (val === 'GLOBAL_SYSTEM_PLACEMENT') {
      setFormType('DIAGNOSTIC_TEST')
      setFormPlacementSkills('2SKILLS')
      setFormDuration(60)
      setFormQuestions(100)
      setFormPassingScore(500)
    } else if (formType === 'DIAGNOSTIC_TEST') {
      setFormType('CHALLENGE_TEST')
      setFormDuration(30)
      setFormQuestions(30)
      setFormPassingScore(70)
    }
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) return

    const isSystemPlacement = formCourseId === 'GLOBAL_SYSTEM_PLACEMENT'
    const matchedCourse = courses.find((c) => c.id === formCourseId)

    setIsSaving(true)
    try {
      const payload: CreateExamDto = {
        title: formTitle.trim(),
        course_id: isSystemPlacement ? undefined : formCourseId,
        course_title: isSystemPlacement ? 'Toàn Hệ Thống' : matchedCourse?.title || 'Khóa học',
        type: isSystemPlacement ? 'DIAGNOSTIC_TEST' : formType,
        is_system_placement: isSystemPlacement,
        skills_enabled: isSystemPlacement ? (formPlacementSkills === '4SKILLS' ? 'ALL' : 'LR') : 'LR',
        placement_type: isSystemPlacement ? formPlacementSkills : undefined,
        duration_minutes: Number(formDuration) || 30,
        total_questions: Number(formQuestions) || 30,
        passing_score: Number(formPassingScore) || 70,
        description: formDescription.trim(),
        is_published: formIsPublished,
        author_id: currentUserId,
      }

      await onSave(payload, Boolean(editingExam), editingExam?.id || editingExam?._id)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const isSystemPlacement = formCourseId === 'GLOBAL_SYSTEM_PLACEMENT'

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            <span>{editingExam ? (isVi ? 'Chỉnh Sửa Bài Thi' : 'Edit Exam') : (isVi ? 'Tạo Bài Thi Đánh Giá Mới' : 'Create New Exam')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Khóa học áp dụng:' : 'Applied Course:'}
            </label>
            <select
              value={formCourseId}
              onChange={(e) => handleFormCourseChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {!isTeacher && (
                <option value="GLOBAL_SYSTEM_PLACEMENT" className="font-bold text-violet-600 dark:text-violet-400">
                  🌐 [TOÀN HỆ THỐNG] - Bài thi đầu vào phân loại trình độ (Placement Test)
                </option>
              )}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Tiêu đề bài thi:' : 'Exam Title:'}
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={
                isSystemPlacement
                  ? (isVi ? 'Ví dụ: Bài Test Đầu Vào Hệ Thống - TOEIC 2 Kỹ Năng (LR Baseline)...' : 'e.g. System Placement Test - TOEIC 2 Skills...')
                  : (isVi ? 'Ví dụ: Challenge Test: Kiểm tra cột mốc Chương 1...' : 'e.g. Challenge Test: Chapter 1 Milestone...')
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {isSystemPlacement ? (
            <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-800 dark:text-violet-300">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>{isVi ? 'Bài Thi Đầu Vào Phân Loại Trình Độ Hệ Thống' : 'System Placement Test Configuration'}</span>
              </div>
              <p className="text-[11px] text-violet-600 dark:text-violet-400 leading-relaxed">
                {isVi
                  ? 'Chỉ Quản trị viên (Admin) mới có quyền tạo và chỉnh sửa bài thi đầu vào này. Kết quả của bài thi sẽ tự động được đồng bộ vào Hồ sơ học viên và dùng để kích hoạt bộ gợi ý khóa học phù hợp.'
                  : 'Only Administrators can configure this system-wide placement test. Results will feed into student profiles to drive automated course recommendations.'}
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {isVi ? 'Chọn cấu hình kỹ năng đánh giá:' : 'Evaluation Skills:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormPlacementSkills('2SKILLS')
                      setFormDuration(60)
                      setFormQuestions(100)
                      setFormPassingScore(500)
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formPlacementSkills === '2SKILLS'
                        ? 'bg-white dark:bg-slate-900 border-violet-500 ring-2 ring-violet-500/20 text-violet-900 dark:text-violet-200 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-violet-300'
                    }`}
                  >
                    <div className="text-xs font-bold">🎧 📖 2 Kỹ Năng</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Listening & Reading (10 - 990)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormPlacementSkills('4SKILLS')
                      setFormDuration(90)
                      setFormQuestions(120)
                      setFormPassingScore(650)
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formPlacementSkills === '4SKILLS'
                        ? 'bg-white dark:bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-200 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                    }`}
                  >
                    <div className="text-xs font-bold">🎧 📖 🗣️ ✍️ 4 Kỹ Năng</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">LR + Speaking & Writing</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Loại bài kiểm tra:' : 'Exam Type:'}
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="CHALLENGE_TEST">
                    {isVi ? 'Bài Test Thử Thách Chương (Challenge)' : 'Chapter Challenge Test'}
                  </option>
                  <option value="FULL_TEST">
                    {isVi ? 'Bài Thi Tốt Nghiệp Cuối Khóa (Final Test)' : 'Final Course Graduation Test'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isVi ? 'Thời lượng (phút):' : 'Duration (mins):'}
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Số câu hỏi dự kiến:' : 'Expected Questions:'}
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={formQuestions}
                onChange={(e) => setFormQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Điểm đạt yêu cầu (0 - 100):' : 'Passing Score (0 - 100):'}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formPassingScore}
                onChange={(e) => setFormPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Mô tả / Hướng dẫn học viên:' : 'Description / Instructions:'}
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={isVi ? 'Ghi chú hướng dẫn bài thi...' : 'Exam notes or instructions...'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="formIsPublishedModal"
              checked={formIsPublished}
              onChange={(e) => setFormIsPublished(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
            />
            <label htmlFor="formIsPublishedModal" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              {isVi ? 'Xuất bản ngay cho học viên làm bài' : 'Publish immediately for learners'}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isVi ? 'Hủy bỏ' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={isSaving || !formTitle.trim()}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {isSaving
              ? (isVi ? 'Đang lưu...' : 'Saving...')
              : editingExam
              ? (isVi ? 'Lưu cập nhật' : 'Save Changes')
              : (isVi ? 'Tiếp tục: Soạn câu hỏi đề thi ➔' : 'Continue: Compose Questions ➔')}
          </button>
        </div>
      </div>
    </div>
  )
}
