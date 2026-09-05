/**
 * @file CourseExamModal.tsx
 * @description Modal tạo mới và chỉnh sửa thông tin bài thi (Challenge, Final Test hoặc Đầu vào hệ thống)
 */

import { useState, useEffect, useMemo } from 'react'
import { FileCheck2, X, Sparkles, AlertTriangle, Lock } from 'lucide-react'
import type { ToeicExamItem, CreateExamDto } from '@/services/exam.service'
import { toast } from '@/store/toast-store'
import type { CourseSelectItem } from './CourseExamHeaderActions'

interface CourseExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: CreateExamDto, isEdit: boolean, editingExamId?: string) => Promise<void>
  editingExam: ToeicExamItem | null
  courses: CourseSelectItem[]
  exams: ToeicExamItem[]
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
  exams,
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

  const editingId = editingExam?.id || editingExam?._id

  // Kiểm tra xem đã có bài thi Toàn hệ thống nào đang Public (cho 2 kỹ năng và 4 kỹ năng) chưa
  const published2SkillsExam = useMemo(() => {
    return exams.find(
      (e) =>
        (e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id) &&
        (e.placement_type === '2SKILLS' || e.skills_enabled === 'LR') &&
        e.is_published &&
        (e.id || e._id) !== editingId
    )
  }, [exams, editingId])

  const published4SkillsExam = useMemo(() => {
    return exams.find(
      (e) =>
        (e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id) &&
        (e.placement_type === '4SKILLS' || e.skills_enabled === 'ALL') &&
        e.is_published &&
        (e.id || e._id) !== editingId
    )
  }, [exams, editingId])

  const isSystemPlacement = formCourseId === 'GLOBAL_SYSTEM_PLACEMENT'
  const currentActiveConflict = isSystemPlacement
    ? formPlacementSkills === '2SKILLS'
      ? published2SkillsExam
      : published4SkillsExam
    : undefined

  useEffect(() => {
    if (!isOpen) return

    if (editingExam) {
      const isGlobal =
        editingExam.is_system_placement ||
        editingExam.type === 'DIAGNOSTIC_TEST' ||
        !editingExam.course_id
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
      // Khi ấn tạo bài thi: luôn tạo cho Toàn Hệ Thống (bài thi khóa học được tạo tại giao diện quản lý khóa học)
      setFormCourseId('GLOBAL_SYSTEM_PLACEMENT')
      setFormTitle('')
      setFormType('DIAGNOSTIC_TEST')
      setFormDuration(60)
      setFormQuestions(100)
      setFormPassingScore(500)
      setFormDescription('')

      // Nếu 2 kỹ năng đã có bài public mà 4 kỹ năng chưa có, ưu tiên chọn 4 kỹ năng
      if (published2SkillsExam && !published4SkillsExam) {
        setFormPlacementSkills('4SKILLS')
        setFormDuration(90)
        setFormQuestions(120)
        setFormPassingScore(650)
        setFormIsPublished(true)
      } else if (published2SkillsExam && published4SkillsExam) {
        setFormPlacementSkills('2SKILLS')
        setFormIsPublished(false) // Bắt buộc private nếu cả 2 đều đã có bài public
      } else {
        setFormPlacementSkills('2SKILLS')
        setFormIsPublished(true)
      }
    }
  }, [isOpen, editingExam, published2SkillsExam, published4SkillsExam])

  // Khi người dùng chuyển kỹ năng, nếu cấu hình đó đã có bài public thì tự động tắt xuất bản
  const handlePlacementSkillsChange = (skills: '2SKILLS' | '4SKILLS') => {
    setFormPlacementSkills(skills)
    if (skills === '2SKILLS') {
      setFormDuration(60)
      setFormQuestions(100)
      setFormPassingScore(500)
      if (published2SkillsExam) {
        setFormIsPublished(false)
      }
    } else {
      setFormDuration(90)
      setFormQuestions(120)
      setFormPassingScore(650)
      if (published4SkillsExam) {
        setFormIsPublished(false)
      }
    }
  }

  if (!isOpen) return null

  const handleFormCourseChange = (val: string) => {
    setFormCourseId(val)
    if (val === 'GLOBAL_SYSTEM_PLACEMENT') {
      setFormType('DIAGNOSTIC_TEST')
      setFormPlacementSkills('2SKILLS')
      setFormDuration(60)
      setFormQuestions(100)
      setFormPassingScore(500)
      if (published2SkillsExam) {
        setFormIsPublished(false)
      }
    } else if (formType === 'DIAGNOSTIC_TEST') {
      setFormType('CHALLENGE_TEST')
      setFormDuration(30)
      setFormQuestions(30)
      setFormPassingScore(70)
      setFormIsPublished(true)
    }
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast.error(isVi ? 'Vui lòng nhập tiêu đề bài thi.' : 'Please enter exam title.')
      return
    }

    if (isSystemPlacement && formIsPublished && currentActiveConflict) {
      toast.error(
        isVi
          ? `Đã có bài thi "${currentActiveConflict.title}" đang Public toàn hệ thống. Bạn chỉ có thể tạo bài mới ở chế độ Private (Bản nháp), hoặc chuyển bài thi trước về Private trước!`
          : `System placement test for this skill set is already public. New test must be Private (Draft), or make the previous test private first!`
      )
      return
    }

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
        is_published: isSystemPlacement && currentActiveConflict ? false : formIsPublished,
        author_id: currentUserId,
      }

      await onSave(payload, Boolean(editingExam), editingExam?.id || editingExam?._id)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-4 animate-in zoom-in-95 duration-150 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            <span>
              {editingExam
                ? isVi
                  ? 'Chỉnh Sửa Bài Thi'
                  : 'Edit Exam'
                : isVi
                ? 'Tạo Bài Thi Đánh Giá Mới (Toàn Hệ Thống)'
                : 'Create New System Placement Exam'}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Phạm vi bài thi */}
          {!editingExam || formCourseId === 'GLOBAL_SYSTEM_PLACEMENT' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Phạm vi áp dụng bài thi:' : 'Applied Scope:'}
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 rounded-2xl text-xs font-bold text-violet-800 dark:text-violet-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse"></span>
                  <span>🌐 [TOÀN HỆ THỐNG] - Bài thi đầu vào phân loại trình độ (Placement Test)</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 shrink-0">
                  {isVi ? 'Đề thi tổng hợp' : 'System Wide'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                {isVi
                  ? '* Lưu ý: Bài kiểm tra riêng theo từng khóa học (Challenge, Final Test) được tạo trực tiếp tại giao diện Quản lý khóa học.'
                  : '* Note: Course-specific exams (Challenge, Final Test) are created in the Course Management interface.'}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Khóa học áp dụng:' : 'Applied Course:'}
              </label>
              <select
                value={formCourseId}
                onChange={(e) => handleFormCourseChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                  ? isVi
                    ? 'Ví dụ: Bài Test Đầu Vào Hệ Thống - TOEIC 2 Kỹ Năng (LR Baseline)...'
                    : 'e.g. System Placement Test - TOEIC 2 Skills...'
                  : isVi
                  ? 'Ví dụ: Challenge Test: Kiểm tra cột mốc Chương 1...'
                  : 'e.g. Challenge Test: Chapter 1 Milestone...'
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
          </div>

          {isSystemPlacement ? (
            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-800 dark:text-violet-300">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>
                  {isVi
                    ? 'Bài Thi Đầu Vào Phân Loại Trình Độ Hệ Thống'
                    : 'System Placement Test Configuration'}
                </span>
              </div>
              <p className="text-[11px] text-violet-600 dark:text-violet-400 leading-relaxed">
                {isVi
                  ? 'Toàn hệ thống chỉ được phép tồn tại tối đa 2 bài thi Public (1 bài 2 Kỹ năng và 1 bài 4 Kỹ năng). Nếu đã có bài Public, bài mới chỉ được lưu dạng Private (Bản nháp), hoặc Admin phải chuyển bài cũ về Private trước.'
                  : 'The system only allows at most 2 public placement tests (1 for 2 Skills and 1 for 4 Skills). If a public test already exists, any new test must be Private (Draft), or make the previous test private.'}
              </p>

              {currentActiveConflict && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isVi
                        ? `Đã có bài thi ${formPlacementSkills === '2SKILLS' ? '2 Kỹ Năng' : '4 Kỹ Năng'} đang hoạt động Public:`
                        : `Active public test already exists for ${formPlacementSkills === '2SKILLS' ? '2 Skills' : '4 Skills'}:`}
                    </span>
                  </div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100 pl-5">
                    "{currentActiveConflict.title}"
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 pl-5 leading-relaxed">
                    {isVi
                      ? 'Bài thi mới này bắt buộc phải tạo ở chế độ Private (Bản nháp). Nếu muốn bài này là bài chính thức Public, bạn cần chuyển bài thi trước về Private trước.'
                      : 'This test will be created as Private (Draft). To make it Public, make the existing test Private first.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {isVi ? 'Chọn cấu hình kỹ năng đánh giá:' : 'Evaluation Skills:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePlacementSkillsChange('2SKILLS')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formPlacementSkills === '2SKILLS'
                        ? 'bg-white dark:bg-slate-900 border-violet-500 ring-2 ring-violet-500/20 text-violet-900 dark:text-violet-200 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">🎧 📖 2 Kỹ Năng</span>
                      {published2SkillsExam && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                          {isVi ? 'Đã có Public' : 'Public Active'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Listening & Reading (10 - 990)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlacementSkillsChange('4SKILLS')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formPlacementSkills === '4SKILLS'
                        ? 'bg-white dark:bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-200 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">🎧 📖 🗣️ ✍️ 4 Kỹ Năng</span>
                      {published4SkillsExam && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                          {isVi ? 'Đã có Public' : 'Public Active'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">LR + Speaking & Writing</div>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
              />
            </div>

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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Điểm đạt yêu cầu:' : 'Passing Score:'}
              </label>
              <input
                type="number"
                min={0}
                max={isSystemPlacement ? 990 : 100}
                value={formPassingScore}
                onChange={(e) => setFormPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Mô tả / Hướng dẫn học viên:' : 'Description / Instructions:'}
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={isVi ? 'Ghi chú hướng dẫn bài thi...' : 'Exam notes or instructions...'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="formIsPublishedModal"
              checked={isSystemPlacement && currentActiveConflict ? false : formIsPublished}
              disabled={Boolean(isSystemPlacement && currentActiveConflict)}
              onChange={(e) => {
                if (isSystemPlacement && currentActiveConflict && e.target.checked) {
                  toast.error(
                    isVi
                      ? 'Đã có 1 bài thi cùng loại kỹ năng đang Public. Bạn chỉ có thể tạo ở chế độ Private (Bản nháp) hoặc chuyển bài thi cũ về Private trước!'
                      : 'An active public test exists. You can only create as Private (Draft) or make the previous test private first!'
                  )
                  return
                }
                setFormIsPublished(e.target.checked)
              }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div>
              <label
                htmlFor="formIsPublishedModal"
                className={`text-xs font-semibold ${
                  isSystemPlacement && currentActiveConflict
                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'text-slate-700 dark:text-slate-300 cursor-pointer'
                }`}
              >
                {isVi ? 'Xuất bản ngay cho học viên làm bài (Public)' : 'Publish immediately for learners (Public)'}
              </label>
              {isSystemPlacement && currentActiveConflict && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium mt-0.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>
                    {isVi
                      ? 'Khóa xuất bản: Đã có 1 bài thi đang Public. Bài này sẽ được lưu ở chế độ Private (Bản nháp).'
                      : 'Locked: Public test already exists. This will be saved as Private (Draft).'}
                  </span>
                </p>
              )}
            </div>
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
              ? isVi
                ? 'Đang lưu...'
                : 'Saving...'
              : editingExam
              ? isVi
                ? 'Lưu cập nhật'
                : 'Save Changes'
              : isVi
              ? 'Tiếp tục: Soạn câu hỏi đề thi ➔'
              : 'Continue: Compose Questions ➔'}
          </button>
        </div>
      </div>
    </div>
  )
}
