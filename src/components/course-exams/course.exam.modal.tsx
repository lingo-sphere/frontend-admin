/**
 * @file course.exam.modal.tsx
 * @description Modal dialog for creating and editing exam configurations (Challenge, Final Test, or System Placement Test)
 */

import { useState, useEffect, useMemo } from 'react'
import { FileCheck2, X } from 'lucide-react'
import type { ToeicExamItem, CreateExamDto } from '@/services/exam.service'
import { toast } from '@/store/toast.store'
import type { CourseSelectItem } from './course.exam.header.actions'
import { CourseExamFormFields } from './course.exam.form.fields'

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
  selectedCourseId: _selectedCourseId,
  isTeacher: _isTeacher,
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
      setFormCourseId('GLOBAL_SYSTEM_PLACEMENT')
      setFormTitle('')
      setFormType('DIAGNOSTIC_TEST')
      setFormDuration(60)
      setFormQuestions(100)
      setFormPassingScore(500)
      setFormDescription('')

      if (published2SkillsExam && !published4SkillsExam) {
        setFormPlacementSkills('4SKILLS')
        setFormDuration(90)
        setFormQuestions(120)
        setFormPassingScore(650)
        setFormIsPublished(true)
      } else if (published2SkillsExam && published4SkillsExam) {
        setFormPlacementSkills('2SKILLS')
        setFormIsPublished(false)
      } else {
        setFormPlacementSkills('2SKILLS')
        setFormIsPublished(true)
      }
    }
  }, [isOpen, editingExam, published2SkillsExam, published4SkillsExam, courses])

  const handlePlacementSkillsChange = (skills: '2SKILLS' | '4SKILLS') => {
    setFormPlacementSkills(skills)
    if (skills === '2SKILLS') {
      setFormDuration(60)
      setFormQuestions(100)
      setFormPassingScore(500)
      if (published2SkillsExam) setFormIsPublished(false)
    } else {
      setFormDuration(90)
      setFormQuestions(120)
      setFormPassingScore(650)
      if (published4SkillsExam) setFormIsPublished(false)
    }
  }

  const handleFormCourseChange = (val: string) => {
    setFormCourseId(val)
    if (val === 'GLOBAL_SYSTEM_PLACEMENT') {
      setFormType('DIAGNOSTIC_TEST')
      setFormPlacementSkills('2SKILLS')
      setFormDuration(60)
      setFormQuestions(100)
      setFormPassingScore(500)
      if (published2SkillsExam) setFormIsPublished(false)
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
        passing_score: isSystemPlacement ? 0 : (Number(formPassingScore) || 70),
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

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 sm:p-5.5 space-y-3 animate-in zoom-in-95 duration-150 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 shrink-0">
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

        <CourseExamFormFields
          editingExam={editingExam}
          formCourseId={formCourseId}
          onFormCourseChange={handleFormCourseChange}
          courses={courses}
          formTitle={formTitle}
          onFormTitleChange={setFormTitle}
          isSystemPlacement={isSystemPlacement}
          formPlacementSkills={formPlacementSkills}
          onPlacementSkillsChange={handlePlacementSkillsChange}
          currentActiveConflict={currentActiveConflict}
          published2SkillsExam={published2SkillsExam}
          published4SkillsExam={published4SkillsExam}
          formType={formType}
          onFormTypeChange={setFormType}
          formDuration={formDuration}
          onFormDurationChange={setFormDuration}
          formPassingScore={formPassingScore}
          onFormPassingScoreChange={setFormPassingScore}
          formDescription={formDescription}
          onFormDescriptionChange={setFormDescription}
          formIsPublished={formIsPublished}
          onFormIsPublishedChange={setFormIsPublished}
          onConflictBlocked={() => {
            toast.error(
              isVi
                ? 'Đã có 1 bài thi cùng loại kỹ năng đang Public. Bạn chỉ có thể tạo ở chế độ Private (Bản nháp) hoặc chuyển bài thi cũ về Private trước!'
                : 'An active public test exists. You can only create as Private (Draft) or make the previous test private first!'
            )
          }}
          isVi={isVi}
        />

        <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
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
