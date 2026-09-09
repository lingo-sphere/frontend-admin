// Component biên soạn đề thi và ngân hàng câu hỏi tích hợp cho kỳ thi khóa học và placement test.

import { useState, useMemo } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { courseService } from '@/services/course.service'
import { examAdminService, type ToeicExamItem, type CreateExamDto } from '@/services/exam.service'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast.store'
import { downloadSampleZip } from '@/components/exams/zip.exam.helper'
import { ExamQuestionCard } from '@/components/exams/exam.question.card'
import { ExamZipDropzone } from '@/components/exams/exam.zip.dropzone'
import { ExamEditorHeader } from '@/components/exams/editor/exam.editor.header'
import { ExamEditorGlobalAudio } from '@/components/exams/editor/exam.editor.global.audio'
import { ExamEditorFooter } from '@/components/exams/editor/exam.editor.footer'
import { ExamConfigForm } from '@/components/exams/editor/exam.config.form'
import { ConfirmModal } from '@/components/common/confirm.modal'
import { useExamQuestionEditor } from '@/hooks/use.exam.question.editor'

export interface CourseExamQuestionsEditorProps {
  initialExam: ToeicExamItem
  isCreateMode: boolean
  existingExams: ToeicExamItem[]
  isVi: boolean
  onBack: () => void
}

export function CourseExamQuestionsEditor({
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
  const is4Skills = formPlacementSkills === '4SKILLS'
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
    searchQuery,
    setSearchQuery,
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
    handleRemoveGlobalAudio,
    handleDuplicateQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
    handleOptionChange,
    handleUploadQuestionAudio,
    handleUploadQuestionImage,
    handleZipFileSelected,
    cleanupSessionMedia,
    sessionUploadedUrlsRef,
    isDirty,
  } = useExamQuestionEditor({
    isOpen: true,
    exam: activeExamConfig,
    is4Skills,
    isVi,
    onExamUpdated: () => {},
    onClose: () => handleRequestCancel(),
  })

  const [isCanceling, setIsCanceling] = useState<boolean>(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false)

  const isFormConfigDirty = useMemo(() => {
    if (isCreateMode) {
      return (
        formTitle.trim() !== (initialExam.title || '').trim() ||
        formDescription.trim().length > 0
      )
    }
    return (
      formTitle !== (initialExam.title || '') ||
      formDuration !== (initialExam.duration_minutes || 60) ||
      formPassingScore !== (initialExam.passing_score || 500) ||
      formDescription !== (initialExam.description || '') ||
      formIsPublished !== (initialExam.is_published ?? true) ||
      formPlacementSkills !== (initialExam.placement_type || (initialExam.skills_enabled === 'ALL' ? '4SKILLS' : '2SKILLS'))
    )
  }, [
    isCreateMode,
    formTitle,
    formDuration,
    formPassingScore,
    formDescription,
    formIsPublished,
    formPlacementSkills,
    initialExam,
  ])

  const hasUnsavedData = isFormConfigDirty || isDirty

  const handleCancelExam = async () => {
    setIsCanceling(true)
    try {
      await cleanupSessionMedia()
    } finally {
      setIsCanceling(false)
      sessionStorage.removeItem('lingo_admin_active_exam')
      onBack()
    }
  }

  const handleRequestCancel = () => {
    if (hasUnsavedData) {
      setShowDiscardConfirm(true)
    } else {
      handleCancelExam()
    }
  }

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

        const allMediaUrls: string[] = []
        if (globalAudioUrl) allMediaUrls.push(globalAudioUrl)
        questions.forEach((q) => {
          if (q.media_url) allMediaUrls.push(q.media_url)
          if (q.image_url) allMediaUrls.push(q.image_url)
        })
        Array.from(sessionUploadedUrlsRef.current).forEach((u) => allMediaUrls.push(u))
        await mediaAdminService.confirmMedia(allMediaUrls)

        toast.success(
          isVi
            ? `Đã tạo thành công bài thi "${trimmedTitle}" với ${questions.length} câu hỏi!`
            : `Created exam "${trimmedTitle}" with ${questions.length} questions!`
        )
        onBack()
      } else {
        const examId = initialExam._id || initialExam.id || ''
        const isCourseTest = String(examId).startsWith('course_final_')
        const isModuleChallenge = String(examId).startsWith('mod_challenge_')

        if (isCourseTest) {
          const cId = String(examId).replace('course_final_', '')
          await courseService.updateCourse(cId, {
            final_test_exam_id: examId,
            final_test_questions: questions,
            final_test_passing_score: formPassingScore,
            final_test_duration_minutes: formDuration,
            final_test_audio_url: globalAudioUrl,
          })
        } else if (isModuleChallenge && initialExam.module_id) {
          await courseService.updateModule(initialExam.module_id, {
            challenge_questions: questions,
            challenge_duration_minutes: formDuration,
            challenge_passing_score: formPassingScore,
            challenge_audio_url: globalAudioUrl,
          })
        } else {
          await examAdminService.updateExam(examId, {
            title: trimmedTitle,
            duration_minutes: formDuration,
            total_questions: questions.length,
            passing_score: formPassingScore,
            is_published: formIsPublished,
            description: formDescription.trim(),
            placement_type: formPlacementSkills,
            skills_enabled: formPlacementSkills === '4SKILLS' ? 'ALL' : 'LR',
            questions,
            audio_url: globalAudioUrl,
          })
        }

        const allMediaUrls: string[] = []
        if (globalAudioUrl) allMediaUrls.push(globalAudioUrl)
        questions.forEach((q) => {
          if (q.media_url) allMediaUrls.push(q.media_url)
          if (q.image_url) allMediaUrls.push(q.image_url)
        })
        Array.from(sessionUploadedUrlsRef.current).forEach((u) => allMediaUrls.push(u))
        await mediaAdminService.confirmMedia(allMediaUrls)

        toast.success(
          isVi
            ? `Đã lưu thành công bài thi "${trimmedTitle}" với ${questions.length} câu hỏi!`
            : `Saved exam "${trimmedTitle}" with ${questions.length} questions!`
        )
        sessionStorage.removeItem('lingo_admin_active_exam')
        onBack()
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : isVi
          ? 'Lỗi lưu bài thi. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.'
          : 'Failed to save exam.'
      toast.error(errorMsg)
    } finally {
      setIsSavingAll(false)
    }
  }

  return (
    <div className="space-y-5 pb-12">
      <input
        ref={zipFileInputRef}
        type="file"
        accept=".zip,.rar,.xlsx,.xls,.csv,application/zip,application/x-rar-compressed,application/vnd.rar"
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
        onChange={handleUploadQuestionAudio}
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

      <ExamConfigForm
        initialExam={initialExam}
        isCreateMode={isCreateMode}
        isVi={isVi}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formPlacementSkills={formPlacementSkills}
        handleSkillsChange={handleSkillsChange}
        formDuration={formDuration}
        setFormDuration={setFormDuration}
        formPassingScore={formPassingScore}
        setFormPassingScore={setFormPassingScore}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formIsPublished={formIsPublished}
        setFormIsPublished={setFormIsPublished}
        isConfigExpanded={isConfigExpanded}
        setIsConfigExpanded={setIsConfigExpanded}
        currentActiveConflict={currentActiveConflict}
        isSystemPlacement={isSystemPlacement}
        onCancelExam={handleRequestCancel}
        isCanceling={isCanceling}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <ExamEditorHeader
          exam={activeExamConfig}
          isVi={isVi}
          is4Skills={is4Skills}
          isSystemPlacement={isSystemPlacement}
          questionsCount={questions.length}
          searchQuery={searchQuery}
          uploadingGlobalAudio={uploadingGlobalAudio}
          globalAudioUrl={globalAudioUrl}
          onClose={handleRequestCancel}
          onSearchChange={setSearchQuery}
          onOpenGlobalAudioPicker={() => globalAudioInputRef.current?.click()}
          onAddQuestion={handleAddQuestion}
        />

        <ExamEditorGlobalAudio
          globalAudioUrl={globalAudioUrl}
          isVi={isVi}
          onRemove={handleRemoveGlobalAudio}
        />

        <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[400px]">
          {questions.length === 0 ? (
            isSystemPlacement || isProcessingZip ? (
              <ExamZipDropzone
                isVi={isVi}
                is4Skills={is4Skills}
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
                onDownloadSampleZip={() => downloadSampleZip(isVi, is4Skills)}
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

        <ExamEditorFooter
          questionsCount={questions.length}
          isVi={isVi}
          isSaving={isSavingAll}
          isCanceling={isCanceling}
          isCreateMode={isCreateMode}
          onClose={handleRequestCancel}
          onSave={handleSaveUnifiedExam}
        />
      </div>

      <ConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false)
          handleCancelExam()
        }}
        variant="warning"
        icon="warning"
        title={isVi ? 'Cảnh báo dữ liệu chưa được lưu' : 'Unsaved Changes Warning'}
        message={
          isVi
            ? 'Bạn có chắc chắn muốn thoát? Toàn bộ dữ liệu bài thi và câu hỏi đang biên soạn sẽ không được lưu và bị mất hoàn toàn.'
            : 'Are you sure you want to leave? All unsaved exam questions and data will be permanently lost.'
        }
        confirmText={isVi ? 'Đồng ý thoát & hủy' : 'Discard & Leave'}
        cancelText={isVi ? 'Ở lại tiếp tục' : 'Stay'}
      />
    </div>
  )
}
