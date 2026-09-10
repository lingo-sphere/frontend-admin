// Hook xử lý lưu và hủy phiên biên tập đề thi kỳ thi khóa học và placement test
import { useState, useMemo, type MutableRefObject } from 'react'
import { courseService } from '@/features/courses/services/course.service'
import { examAdminService, type ToeicExamItem, type CreateExamDto } from '@/features/exams/services/exam.service'
import { mediaAdminService } from '@/features/media/services/media.service'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'

export interface UseCourseExamSaveParams {
  initialExam: ToeicExamItem
  isCreateMode: boolean
  isVi: boolean
  isSystemPlacement: boolean
  formTitle: string
  formPlacementSkills: '2SKILLS' | '4SKILLS'
  formDuration: number
  formPassingScore: number
  formDescription: string
  formIsPublished: boolean
  currentActiveConflict: ToeicExamItem | undefined
  questions: ExamQuestionItem[]
  globalAudioUrl: string
  sessionUploadedUrlsRef: MutableRefObject<Set<string>>
  cleanupSessionMedia: () => Promise<void>
  isDirty: boolean
  setIsConfigExpanded: (val: boolean) => void
  onBack: () => void
}

export function useCourseExamSave({
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
  setIsConfigExpanded,
  onBack,
}: UseCourseExamSaveParams) {
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false)
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
      storage.session.remove(STORAGE_KEYS.ACTIVE_EXAM)
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
        storage.session.remove(STORAGE_KEYS.ACTIVE_EXAM)
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

  return {
    isSavingAll,
    isCanceling,
    showDiscardConfirm,
    setShowDiscardConfirm,
    hasUnsavedData,
    handleSaveUnifiedExam,
    handleCancelExam,
    handleRequestCancel,
  }
}
