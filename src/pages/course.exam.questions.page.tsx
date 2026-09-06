/**
 * @file course.exam.questions.page.tsx
 * @description Trang studio hợp nhất cấu hình bài thi và biên soạn ngân hàng câu hỏi toàn diện
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  FileCheck2,
  Globe,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { courseService } from '@/services/course.service'
import { examAdminService, type ToeicExamItem, type CreateExamDto } from '@/services/exam.service'
import { toast } from '@/store/toast.store'
import { downloadSampleZip } from '@/components/exams/zip.exam.helper'
import { ExamQuestionCard } from '@/components/exams/exam.question.card'
import { ExamZipDropzone } from '@/components/exams/exam.zip.dropzone'
import { ExamEditorHeader } from '@/components/exams/editor/exam.editor.header'
import { ExamEditorGlobalAudio } from '@/components/exams/editor/exam.editor.global.audio'
import { useExamQuestionEditor } from '@/hooks/use.exam.question.editor'
import { CustomSelect, type SelectOption } from '@/components/common/custom.select'
import type { Course } from '@/types/api.types'

interface CourseExamQuestionsPageProps {
  examId: string
}

interface CourseExamQuestionsEditorProps {
  initialExam: ToeicExamItem
  isCreateMode: boolean
  existingExams: ToeicExamItem[]
  isVi: boolean
  onBack: () => void
}

function CourseExamQuestionsEditor({
  initialExam,
  isCreateMode,
  existingExams,
  isVi,
  onBack,
}: CourseExamQuestionsEditorProps) {
  const [formTitle, setFormTitle] = useState<string>(initialExam.title || '')
  const [formPlacementSkills, setFormPlacementSkills] = useState<'2SKILLS' | '4SKILLS'>(
    (initialExam.placement_type as '2SKILLS' | '4SKILLS') ||
      (initialExam.skills_enabled === 'ALL' ? '4SKILLS' : '2SKILLS')
  )
  const [formDuration, setFormDuration] = useState<number>(initialExam.duration_minutes || 60)
  const [formPassingScore, setFormPassingScore] = useState<number>(initialExam.passing_score || 500)
  const [formDescription, setFormDescription] = useState<string>(initialExam.description || '')
  const [formIsPublished, setFormIsPublished] = useState<boolean>(initialExam.is_published ?? true)
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(isCreateMode)
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false)

  const isSystemPlacement = Boolean(
    initialExam.is_system_placement || initialExam.type === 'DIAGNOSTIC_TEST' || !initialExam.course_id
  )

  const currentEditingId = initialExam._id || initialExam.id

  const published2SkillsExam = useMemo(() => {
    return existingExams.find(
      (e) =>
        (e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id) &&
        (e.placement_type === '2SKILLS' || e.skills_enabled === 'LR') &&
        e.is_published &&
        (e._id || e.id) !== currentEditingId
    )
  }, [existingExams, currentEditingId])

  const published4SkillsExam = useMemo(() => {
    return existingExams.find(
      (e) =>
        (e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id) &&
        (e.placement_type === '4SKILLS' || e.skills_enabled === 'ALL' || e.skills_enabled === 'FULL') &&
        e.is_published &&
        (e._id || e.id) !== currentEditingId
    )
  }, [existingExams, currentEditingId])

  const currentActiveConflict = isSystemPlacement
    ? formPlacementSkills === '2SKILLS'
      ? published2SkillsExam
      : published4SkillsExam
    : undefined

  const activeExamConfig: ToeicExamItem = useMemo(() => {
    return {
      ...initialExam,
      title: formTitle,
      duration_minutes: formDuration,
      passing_score: formPassingScore,
      description: formDescription,
      is_published: formIsPublished,
      placement_type: formPlacementSkills,
      skills_enabled: formPlacementSkills === '4SKILLS' ? 'ALL' : 'LR',
    }
  }, [
    initialExam,
    formTitle,
    formDuration,
    formPassingScore,
    formDescription,
    formIsPublished,
    formPlacementSkills,
  ])

  const {
    questions,
    globalAudioUrl,
    setGlobalAudioUrl,
    searchQuery,
    setSearchQuery,
    partFilter,
    setPartFilter,
    isProcessingZip,
    zipProcessStatus,
    zipProgress,
    isDragOverZip,
    setIsDragOverZip,
    uploadingGlobalAudio,
    uploadingQuestionAudioIdx,
    uploadingQuestionImageIdx,
    zipFileInputRef,
    globalAudioInputRef,
    questionAudioInputRef,
    questionImageInputRef,
    activeQuestionIdxRef,
    filteredQuestions,
    handleAddQuestion,
    handleUploadGlobalAudio,
    handleDuplicateQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
    handleOptionChange,
    handleUploadQuestionAudio,
    handleUploadQuestionImage,
    handleZipFileSelected,
  } = useExamQuestionEditor({
    isOpen: true,
    exam: activeExamConfig,
    isVi,
    onExamUpdated: () => {},
    onClose: onBack,
  })

  const handleSkillsChange = (skills: '2SKILLS' | '4SKILLS') => {
    setFormPlacementSkills(skills)
    if (skills === '2SKILLS') {
      setFormDuration(60)
      setFormPassingScore(500)
      if (published2SkillsExam) setFormIsPublished(false)
    } else {
      setFormDuration(90)
      setFormPassingScore(650)
      if (published4SkillsExam) setFormIsPublished(false)
    }
  }

  const handleSaveUnifiedExam = async () => {
    const trimmedTitle = formTitle.trim()
    if (!trimmedTitle) {
      toast.error(isVi ? 'Vui lòng nhập tiêu đề bài thi.' : 'Please enter exam title.')
      setIsConfigExpanded(true)
      return
    }

    if (isSystemPlacement && formIsPublished && currentActiveConflict) {
      toast.error(
        isVi
          ? `Đã có bài thi "${currentActiveConflict.title}" đang Public toàn hệ thống. Vui lòng chuyển bài thi này về Bản nháp (Private), hoặc chuyển bài thi trước về Private trước!`
          : `System placement test for this skill set is already public. New test must be Private (Draft)!`
      )
      setIsConfigExpanded(true)
      return
    }

    setIsSavingAll(true)
    try {
      if (isCreateMode) {
        const createPayload: CreateExamDto = {
          title: trimmedTitle,
          course_id: undefined,
          course_title: 'Toàn Hệ Thống',
          type: 'DIAGNOSTIC_TEST',
          is_system_placement: true,
          skills_enabled: formPlacementSkills === '4SKILLS' ? 'ALL' : 'LR',
          placement_type: formPlacementSkills,
          duration_minutes: formDuration,
          total_questions: questions.length,
          passing_score: formPassingScore,
          is_published: formIsPublished,
          description: formDescription.trim(),
          questions,
          audio_url: globalAudioUrl,
        }

        await examAdminService.createExam(createPayload)
        toast.success(
          isVi
            ? `Đã tạo thành công bài thi "${trimmedTitle}" với ${questions.length} câu hỏi!`
            : `Created exam "${trimmedTitle}" with ${questions.length} questions!`
        )
      } else {
        const examId = initialExam._id || initialExam.id || ''
        const isCourseTest = String(examId).startsWith('course_final_')
        const isModuleTest = String(examId).startsWith('mod_challenge_')

        if (isCourseTest && initialExam.course_id) {
          await courseService.updateCourse(initialExam.course_id, {
            title: trimmedTitle,
            final_test_passing_score: formPassingScore,
            final_test_audio_url: globalAudioUrl || undefined,
            final_test_questions: questions,
            is_published: formIsPublished,
          })
        } else if (isModuleTest) {
          const modId = initialExam.module_id || String(examId).replace('mod_challenge_', '')
          await courseService.updateModule(modId, {
            title: trimmedTitle,
            challenge_passing_score: formPassingScore,
            challenge_audio_url: globalAudioUrl || undefined,
            challenge_questions: questions,
            post_mini_questions: questions,
            is_published: formIsPublished,
          })
        } else {
          await examAdminService.updateExam(examId, {
            title: trimmedTitle,
            duration_minutes: formDuration,
            passing_score: formPassingScore,
            is_published: formIsPublished,
            description: formDescription.trim(),
            skills_enabled: formPlacementSkills === '4SKILLS' ? 'ALL' : 'LR',
            placement_type: formPlacementSkills,
            audio_url: globalAudioUrl,
            total_questions: questions.length,
          })
          await examAdminService.saveExamQuestions(examId, questions, globalAudioUrl)
        }

        toast.success(
          isVi
            ? `Đã cập nhật bài thi "${trimmedTitle}" và lưu ${questions.length} câu hỏi!`
            : `Updated exam "${trimmedTitle}" and saved ${questions.length} questions!`
        )
      }

      onBack()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu bài thi. Vui lòng thử lại.'
      toast.error(msg)
    } finally {
      setIsSavingAll(false)
    }
  }

  const is4Skills = formPlacementSkills === '4SKILLS'

  return (
    <div className="space-y-4 w-full pb-16 animate-in fade-in duration-200">
      <input
        ref={zipFileInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleZipFileSelected(file)
        }}
      />
      <input
        ref={globalAudioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleUploadGlobalAudio}
      />
      <input
        ref={questionAudioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleUploadQuestionAudio}
      />
      <input
        ref={questionImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadQuestionImage}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isVi ? 'Bài thi khóa học' : 'Course Exams'}</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs sm:max-w-md">
            {isCreateMode
              ? isVi
                ? 'Tạo bài thi đánh giá mới (Toàn Hệ Thống)'
                : 'Create New Placement Exam'
              : formTitle || initialExam.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCreateMode ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVi ? 'Chế độ tạo mới' : 'New Exam Mode'}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {isVi ? 'Mã đề:' : 'ID:'} {initialExam._id || initialExam.id}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Thông Tin Cấu Hình Bài Thi' : 'Exam Configuration'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {formPlacementSkills === '4SKILLS' ? '4 Kỹ năng (LRSW)' : '2 Kỹ năng (LR)'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {formDuration} {isVi ? 'phút' : 'mins'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                    formIsPublished
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {formIsPublished
                    ? isVi
                      ? 'Public (Công khai)'
                      : 'Public'
                    : isVi
                    ? 'Private (Bản nháp)'
                    : 'Private'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVi
                  ? 'Cấu hình tiêu đề, thang điểm chuẩn, thời lượng thi và bộ kỹ năng áp dụng'
                  : 'Configure exam title, passing score, duration, and target skills'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs font-semibold hidden sm:inline">
              {isConfigExpanded ? (isVi ? 'Thu gọn' : 'Collapse') : isVi ? 'Chỉnh sửa cấu hình' : 'Expand'}
            </span>
            {isConfigExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isConfigExpanded && (
          <div className="p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isVi ? 'Phạm vi áp dụng bài thi:' : 'Applied Scope:'}
              </label>
              <div className="flex items-center justify-between px-4 py-2.5 bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-bold text-violet-800 dark:text-violet-300">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-violet-600" />
                  <span>
                    🌐 {isVi ? '[TOÀN HỆ THỐNG] - Bài thi đầu vào phân loại trình độ (Placement Test)' : '[SYSTEM WIDE] - Placement Test'}
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
                  {isVi ? 'Toàn hệ thống' : 'Global System'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isVi ? 'Tiêu đề bài thi *' : 'Exam Title *'}
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={
                  isVi
                    ? 'Ví dụ: Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC (LR)'
                    : 'e.g., TOEIC Diagnostic Placement Test'
                }
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isVi ? 'Bộ kỹ năng đánh giá (Placement Type):' : 'Assessment Skills:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => handleSkillsChange('2SKILLS')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formPlacementSkills === '2SKILLS'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {isVi ? '2 Kỹ năng (LR)' : '2 Skills (LR)'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Listening & Reading
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isVi
                      ? 'Thi Trắc nghiệm Part 1-7, thời gian chuẩn 60 phút, tối đa 990 điểm.'
                      : 'Standard Multiple Choice Part 1-7, 60 mins duration.'}
                  </p>
                </div>

                <div
                  onClick={() => handleSkillsChange('4SKILLS')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formPlacementSkills === '4SKILLS'
                      ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 dark:border-teal-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {isVi ? '4 Kỹ năng (LRSW)' : '4 Skills (LRSW)'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                      Toàn diện 4 Kỹ năng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isVi
                      ? 'Gồm Trắc nghiệm Nghe/Đọc + Ghi âm Nói (Speaking) + Viết luận (Writing).'
                      : 'Comprehensive Listening, Reading, Speaking audio recording, and Writing.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isVi ? 'Thời gian thi (phút):' : 'Duration (mins):'}</span>
                  </div>
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value) || 60)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isVi ? 'Điểm chuẩn đạt:' : 'Passing Score:'}</span>
                  </div>
                </label>
                <input
                  type="number"
                  min={0}
                  max={990}
                  value={formPassingScore}
                  onChange={(e) => setFormPassingScore(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isVi ? 'Trạng thái phát hành:' : 'Publish Status:'}</span>
                  </div>
                </label>
                <CustomSelect
                  value={formIsPublished ? 'PUBLISHED' : 'DRAFT'}
                  onChange={(val) => {
                    const isPub = val === 'PUBLISHED'
                    if (isPub && currentActiveConflict) {
                      toast.error(
                        isVi
                          ? `Đã có bài thi "${currentActiveConflict.title}" đang Public. Hệ thống chỉ cho phép 1 bài thi cùng bộ kỹ năng Public cùng lúc!`
                          : `System already has a public test for this skill set!`
                      )
                      return
                    }
                    setFormIsPublished(isPub)
                  }}
                  options={[
                    {
                      value: 'PUBLISHED',
                      label: isVi ? 'Public (Công khai)' : 'Public',
                      badge: isVi ? 'Hiển thị' : 'Visible',
                      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                    },
                    {
                      value: 'DRAFT',
                      label: isVi ? 'Private (Bản nháp)' : 'Private Draft',
                      badge: isVi ? 'Ẩn' : 'Hidden',
                      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                    },
                  ]}
                  size="md"
                />
              </div>
            </div>

            {currentActiveConflict && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold">{isVi ? 'Lưu ý trùng lặp bài thi Public:' : 'Public Conflict Notice:'}</span>{' '}
                  {isVi
                    ? `Hiện đã có bài thi "${currentActiveConflict.title}" đang Public cho bộ kỹ năng ${formPlacementSkills}. Nếu lưu bài này ở chế độ Private, bạn vẫn có thể soạn câu hỏi bình thường và công khai sau khi chuyển bài cũ về Private.`
                    : `Test "${currentActiveConflict.title}" is already public. You can save this test as Private draft.`}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isVi ? 'Mô tả bài thi (tùy chọn):' : 'Description (optional):'}
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={
                  isVi
                    ? 'Nhập mô tả hướng dẫn hoặc ghi chú dành cho thí sinh làm bài...'
                    : 'Enter instructions or notes for students...'
                }
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <ExamEditorHeader
          exam={activeExamConfig}
          isVi={isVi}
          is4Skills={is4Skills}
          isSystemPlacement={isSystemPlacement}
          questionsCount={questions.length}
          searchQuery={searchQuery}
          isProcessingZip={isProcessingZip}
          uploadingGlobalAudio={uploadingGlobalAudio}
          globalAudioUrl={globalAudioUrl}
          onClose={onBack}
          onSearchChange={setSearchQuery}
          onDownloadSampleZip={() => downloadSampleZip(isVi)}
          onOpenZipPicker={() => zipFileInputRef.current?.click()}
          onOpenGlobalAudioPicker={() => globalAudioInputRef.current?.click()}
          onAddQuestion={handleAddQuestion}
        />

        <ExamEditorGlobalAudio
          globalAudioUrl={globalAudioUrl}
          isVi={isVi}
          onRemove={() => setGlobalAudioUrl('')}
        />

        <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[400px]">
          {questions.length === 0 ? (
            isSystemPlacement || isProcessingZip ? (
              <ExamZipDropzone
                isVi={isVi}
                isProcessingZip={isProcessingZip}
                zipProcessStatus={zipProcessStatus}
                zipProgress={zipProgress}
                isDragOverZip={isDragOverZip}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOverZip(true)
                }}
                onDragLeave={() => setIsDragOverZip(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOverZip(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleZipFileSelected(file)
                }}
                onOpenZipPicker={() => zipFileInputRef.current?.click()}
                onDownloadSampleZip={() => downloadSampleZip(isVi)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {isVi
                      ? 'Đề thi hiện chưa có câu hỏi nào'
                      : 'No questions in this exam yet'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isVi
                      ? 'Nhấn nút "Thêm câu hỏi" để bắt đầu soạn câu hỏi cho bài thi này.'
                      : 'Click "Add Question" to start crafting questions for this exam.'}
                  </p>
                </div>
                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('READING')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isVi ? 'Thêm câu hỏi đầu tiên' : 'Add First Question'}</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            filteredQuestions.map((q, filteredIdx) => {
              const actualIdx = questions.findIndex((item) => item.id === q.id)
              const qIndex = actualIdx !== -1 ? actualIdx : filteredIdx

              return (
                <ExamQuestionCard
                  key={q.id || qIndex}
                  question={q}
                  index={qIndex}
                  isVi={isVi}
                  skillsMode={formPlacementSkills}
                  isUploadingAudio={uploadingQuestionAudioIdx === qIndex}
                  isUploadingImage={uploadingQuestionImageIdx === qIndex}
                  onUpdate={(updates) => handleUpdateQuestion(qIndex, updates)}
                  onOptionChange={(optIdx, val) => handleOptionChange(qIndex, optIdx, val)}
                  onDuplicate={() => handleDuplicateQuestion(qIndex)}
                  onDelete={() => handleDeleteQuestion(qIndex)}
                  onRequestUploadAudio={() => {
                    activeQuestionIdxRef.current = qIndex
                    questionAudioInputRef.current?.click()
                  }}
                  onRequestUploadImage={() => {
                    activeQuestionIdxRef.current = qIndex
                    questionImageInputRef.current?.click()
                  }}
                />
              )
            })
          )}
        </div>

        <div className="sticky bottom-0 z-20 shadow-lg flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div>
              {isVi ? 'Tổng số câu hỏi:' : 'Total Questions:'}{' '}
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                {questions.length}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div>
              {isVi ? 'Thời gian:' : 'Duration:'}{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formDuration} {isVi ? 'phút' : 'mins'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>

            <button
              type="button"
              disabled={isSavingAll}
              onClick={handleSaveUnifiedExam}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSavingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isVi ? 'Đang lưu bài thi...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {isCreateMode
                      ? isVi
                        ? 'Tạo Bài Thi & Lưu Câu Hỏi'
                        : 'Create Exam & Save Questions'
                      : isVi
                      ? 'Lưu Bài Thi & Ngân Hàng Câu Hỏi'
                      : 'Save Exam & Question Bank'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CourseExamQuestionsPage({ examId }: CourseExamQuestionsPageProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const isCreateMode = examId === 'new'

  const [exam, setExam] = useState<ToeicExamItem | null>(() => {
    if (isCreateMode) {
      return {
        id: `exam_new_${Date.now()}`,
        _id: `exam_new_${Date.now()}`,
        title: 'Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC (Placement Test)',
        type: 'DIAGNOSTIC_TEST',
        is_system_placement: true,
        skills_enabled: 'LR',
        placement_type: '2SKILLS',
        duration_minutes: 60,
        total_questions: 0,
        passing_score: 500,
        total_attempts: 0,
        avg_score: 0,
        is_published: true,
        created_at: new Date().toISOString(),
        questions: [],
        audio_url: '',
      }
    }
    const cachedStr = sessionStorage.getItem('lingo_admin_active_exam')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as ToeicExamItem
        if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
          return cached
        }
      } catch {}
    }
    return null
  })

  const [existingExams, setExistingExams] = useState<ToeicExamItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (isCreateMode) return false
    const cachedStr = sessionStorage.getItem('lingo_admin_active_exam')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as ToeicExamItem
        if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
          return false
        }
      } catch {}
    }
    return true
  })

  useEffect(() => {
    let isMounted = true

    examAdminService
      .getExams()
      .then((allExams) => {
        if (isMounted && Array.isArray(allExams)) {
          setExistingExams(allExams)
        }
      })
      .catch(() => {})

    if (isCreateMode) {
      return () => {
        isMounted = false
      }
    }

    const cachedStr = sessionStorage.getItem('lingo_admin_active_exam')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as ToeicExamItem
        if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
          setExam(cached)
          setIsLoading(false)
          return
        }
      } catch {}
    }

    const loadData = async () => {
      try {
        if (examId.startsWith('course_final_')) {
          const courseId = examId.replace('course_final_', '')
          const rawRes = await courseService.getCourseById(courseId)
          const rawCourse = ((rawRes as { course?: Course }).course || rawRes) as Course
          if (rawCourse && isMounted) {
            const courseExam: ToeicExamItem = {
              id: rawCourse.final_test_exam_id || examId,
              _id: rawCourse.final_test_exam_id || examId,
              title: `Bài Thi Tốt Nghiệp: ${rawCourse.title}`,
              course_id: rawCourse._id,
              course_title: rawCourse.title,
              type: 'FULL_TEST',
              total_questions: rawCourse.final_test_questions?.length || 0,
              duration_minutes: 60,
              passing_score: rawCourse.final_test_passing_score || 70,
              is_published: rawCourse.is_published ?? true,
              questions: rawCourse.final_test_questions || [],
              audio_url: rawCourse.final_test_audio_url || '',
              author_id: rawCourse.author_id,
            }
            setExam(courseExam)
            sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(courseExam))
          }
        } else if (examId.startsWith('mod_challenge_')) {
          const modId = examId.replace('mod_challenge_', '')
          const coursesRes = await courseService.getAllCourses({ pageSize: 100 })
          const coursesList = coursesRes.result || []
          let found = false
          for (const c of coursesList) {
            try {
              const modulesList = await courseService.getModules(c._id)
              const foundMod = modulesList.find((m) => (m._id || m.id) === modId)
              if (foundMod && isMounted) {
                const qList =
                  foundMod.challenge_questions && foundMod.challenge_questions.length > 0
                    ? foundMod.challenge_questions
                    : foundMod.post_mini_questions && foundMod.post_mini_questions.length > 0
                    ? foundMod.post_mini_questions
                    : []
                const challengeExam: ToeicExamItem = {
                  id: examId,
                  _id: examId,
                  title: `Challenge Test: ${foundMod.title}`,
                  course_id: c._id,
                  course_title: c.title,
                  module_id: foundMod._id || foundMod.id,
                  module_title: foundMod.title,
                  type: 'CHALLENGE_TEST',
                  total_questions: qList.length,
                  duration_minutes: foundMod.challenge_duration_minutes || foundMod.post_mini_duration_minutes || 15,
                  passing_score: foundMod.challenge_passing_score || foundMod.post_mini_passing_score || 80,
                  is_published: true,
                  questions: qList,
                  audio_url: foundMod.challenge_audio_url || foundMod.test_audio_url || foundMod.audio_url || '',
                  author_id: c.author_id,
                }
                setExam(challengeExam)
                sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(challengeExam))
                found = true
                break
              }
            } catch {}
          }
          if (!found && isMounted) {
            toast.error(isVi ? 'Không tìm thấy bài thi chương học.' : 'Module exam not found.')
          }
        } else {
          const apiExams = await examAdminService.getExams().catch(() => [])
          const match = apiExams.find((e) => (e._id || e.id) === examId)
          if (match && isMounted) {
            setExam(match)
            sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(match))
          } else if (isMounted) {
            toast.error(isVi ? 'Không tìm thấy bài thi chỉ định.' : 'Exam not found.')
          }
        }
      } catch {
        if (isMounted) {
          toast.error(isVi ? 'Lỗi khi tải thông tin bài thi.' : 'Failed to load exam.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [examId, isCreateMode, isVi])

  const handleBack = () => {
    setActiveNavItem('course-exams')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isVi ? 'Đang nạp dữ liệu bài thi...' : 'Loading exam studio...'}
        </p>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isVi ? 'Không tìm thấy thông tin bài thi' : 'Exam not found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Bài thi không tồn tại hoặc đã bị xóa khỏi hệ thống.'
              : 'The requested exam does not exist or has been deleted.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isVi ? 'Quay lại danh sách bài thi' : 'Back to Exams'}</span>
        </button>
      </div>
    )
  }

  return (
    <CourseExamQuestionsEditor
      initialExam={exam}
      isCreateMode={isCreateMode}
      existingExams={existingExams}
      isVi={isVi}
      onBack={handleBack}
    />
  )
}
