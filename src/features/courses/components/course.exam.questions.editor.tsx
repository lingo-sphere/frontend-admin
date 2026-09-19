// Component biên soạn đề thi và ngân hàng câu hỏi tích hợp thanh tác vụ lưu biểu mẫu cố định.
import { useState, useMemo, useCallback } from 'react'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { downloadSampleZip } from '@/features/exams/helpers/zip.exam.helper'
import { ExamEditorHeader } from '@/features/courses/components/exam.editor.header'
import { ExamEditorGlobalAudio } from '@/features/courses/components/exam.editor.global.audio'
import { ExamConfigForm } from '@/features/courses/components/exam.config.form'
import { CourseExamQuestionsList } from '@/features/courses/components/course.exam.questions.list'
import { StickyFormActionBar } from '@/components/sticky.form.action.bar'
import { ConfirmModal } from '@/components/confirm.modal'
import { useExamQuestionEditor } from '@/features/courses/hooks/use.exam.question.editor'
import { useCourseExamSave } from '@/features/courses/hooks/use.course.exam.save'

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
  const [formDuration, setFormDuration] = useState<number>(initialExam.duration_minutes ?? 0)
  const [formPassingScore, setFormPassingScore] = useState<number>(initialExam.passing_score ?? 0)
  const [formDescription, setFormDescription] = useState<string>(initialExam.description || '')
  const [formIsPublished, setFormIsPublished] = useState<boolean>(initialExam.is_published ?? true)
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(() => {
    const savedCollapsed = storage.get<boolean>(STORAGE_KEYS.EXAM_CONFIG_COLLAPSED)
    if (savedCollapsed !== null && savedCollapsed !== undefined) {
      return !savedCollapsed
    }
    return isCreateMode
  })

  const handleSetConfigExpanded = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setIsConfigExpanded((prev) => {
      const next = typeof val === 'function' ? val(prev) : val
      storage.set(STORAGE_KEYS.EXAM_CONFIG_COLLAPSED, !next)
      return next
    })
  }, [])

  const isSystemPlacement = Boolean(
    initialExam.is_system_placement || initialExam.type === 'DIAGNOSTIC_TEST' || !initialExam.course_id
  )

  const currentEditingIds = useMemo(() => {
    return new Set([initialExam._id, initialExam.id, initialExam.code].filter(Boolean) as string[])
  }, [initialExam])

  const published2SkillsExam = useMemo(() => {
    return existingExams.find(
      (e) =>
        (e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id) &&
        (e.placement_type === '2SKILLS' || e.skills_enabled === 'LR') &&
        e.is_published &&
        (isCreateMode || (!currentEditingIds.has(e._id ?? '') && !currentEditingIds.has(e.id ?? '') && (!e.code || !currentEditingIds.has(e.code))))
    )
  }, [existingExams, currentEditingIds, isCreateMode])

  const published4SkillsExam = useMemo(() => {
    return existingExams.find(
      (e) =>
        (e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id) &&
        (e.placement_type === '4SKILLS' || e.skills_enabled === 'ALL' || e.skills_enabled === 'FULL') &&
        e.is_published &&
        (isCreateMode || (!currentEditingIds.has(e._id ?? '') && !currentEditingIds.has(e.id ?? '') && (!e.code || !currentEditingIds.has(e.code))))
    )
  }, [existingExams, currentEditingIds, isCreateMode])

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

  const handleSkillsChange = (skills: '2SKILLS' | '4SKILLS') => {
    setFormPlacementSkills(skills)
    if (skills === '2SKILLS') {
      setFormDuration((prev) => (prev <= 0 || prev === 90 || prev === 140 ? 60 : prev))
      setFormPassingScore((prev) => (prev <= 0 || prev === 650 || prev === 70 ? 500 : prev))
      if (published2SkillsExam) setFormIsPublished(false)
    } else {
      setFormDuration((prev) => (prev <= 0 || prev === 60 || prev === 120 ? 140 : prev))
      setFormPassingScore((prev) => (prev <= 0 || prev === 500 ? 70 : prev))
      if (published4SkillsExam) setFormIsPublished(false)
    }
  }

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
    exam: initialExam,
    is4Skills,
    isVi,
    onSkillsAutoSwitched: (newSkills) => {
      handleSkillsChange(newSkills)
    },
    onExamMetaLoaded: (meta) => {
      if (typeof meta.duration_minutes === 'number' && meta.duration_minutes > 0) {
        setFormDuration(meta.duration_minutes)
      }
      if (meta.title && meta.title.trim()) {
        setFormTitle(meta.title.trim())
      }
      if (typeof meta.passing_score === 'number' && meta.passing_score > 0) {
        setFormPassingScore(meta.passing_score)
      }
      if (meta.description) {
        setFormDescription(meta.description)
      }
    },
    onExamUpdated: () => {},
    onClose: () => handleRequestCancel(),
  })

  const {
    isSavingAll,
    isCanceling,
    showDiscardConfirm,
    setShowDiscardConfirm,
    handleSaveUnifiedExam,
    handleCancelExam,
    handleRequestCancel,
  } = useCourseExamSave({
    initialExam,
    isCreateMode,
    isVi,
    isSystemPlacement,
    formTitle,
    formPlacementSkills,
    formDuration,
    formPassingScore,
    formDescription,
    formIsPublished,
    currentActiveConflict,
    questions,
    globalAudioUrl,
    sessionUploadedUrlsRef,
    cleanupSessionMedia,
    isDirty,
    setIsConfigExpanded: handleSetConfigExpanded,
    onBack,
  })

  return (
    <>
      <div className="flex-1 flex flex-col justify-between space-y-5">
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

        <div className="space-y-5">
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
            setIsConfigExpanded={handleSetConfigExpanded}
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

            <CourseExamQuestionsList
              questions={questions}
              filteredQuestions={filteredQuestions}
              isVi={isVi}
              is4Skills={is4Skills}
              isSystemPlacement={isSystemPlacement}
              isProcessingZip={isProcessingZip}
              zipProcessStatus={zipProcessStatus}
              zipProgress={zipProgress}
              isDragOverZip={isDragOverZip}
              formPlacementSkills={formPlacementSkills}
              uploadingQuestionAudioIdx={uploadingQuestionAudioIdx}
              uploadingQuestionImageIdx={uploadingQuestionImageIdx}
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
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onOptionChange={handleOptionChange}
              onDuplicateQuestion={handleDuplicateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onRequestUploadAudio={(idx) => {
                activeQuestionIdxRef.current = idx
                questionAudioInputRef.current?.click()
              }}
              onRequestUploadImage={(idx) => {
                activeQuestionIdxRef.current = idx
                questionImageInputRef.current?.click()
              }}
            />
          </div>
        </div>

        <StickyFormActionBar
          title={formTitle.trim() || (isCreateMode ? (isVi ? 'Bài thi đánh giá mới' : 'New Placement Exam') : (isVi ? 'Bài thi' : 'Exam'))}
          statusText={isVi ? (isCreateMode ? 'Đang tạo bài thi:' : 'Đang chỉnh sửa:') : (isCreateMode ? 'Creating exam:' : 'Editing:')}
          badgeText={`${questions.length} ${isVi ? 'câu hỏi' : 'questions'} · ${formDuration} ${isVi ? 'phút' : 'min'}`}
          cancelText={isVi ? 'Hủy Bỏ' : 'Cancel'}
          saveText={
            isCreateMode
              ? isVi
                ? 'Tạo Bài Thi & Lưu Câu Hỏi'
                : 'Create Exam & Save Questions'
              : isVi
              ? 'Lưu Bài Thi & Ngân Hàng Câu Hỏi'
              : 'Save Exam & Question Bank'
          }
          savingText={isVi ? 'Đang lưu bài thi...' : 'Saving...'}
          isSubmitting={isSavingAll}
          onCancel={handleRequestCancel}
          onSave={handleSaveUnifiedExam}
          saveButtonType="button"
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
    </>
  )
}
