// Custom hook quan ly trang thai bien soan cau hoi va don dep media khi huy.

import { useState, useEffect, useRef, useMemo } from 'react'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { examAdminService } from '@/features/exams/services/exam.service'
import { mediaAdminService } from '@/features/media/services/media.service'
import { parseAndUploadZipExam } from '@/features/exams/helpers/zip.exam.helper'
import { toast } from '@/store/toast.store'

import type {
  ExamQuestionItem,
  RawExamQuestion,
  UseExamQuestionEditorParams,
} from '@/features/courses/types/exam.question.types'
import {
  normalizeQuestions,
  getQuestionsSnapshot,
  computeInitialBundle,
} from '@/features/courses/utils/exam.question.utils'

export type { ExamQuestionItem, RawExamQuestion, UseExamQuestionEditorParams }

export function useExamQuestionEditor({
  isOpen,
  exam,
  is4Skills,
  isLessonMode = false,
  initialQuestions,
  initialGlobalAudioUrl,
  isVi,
  onExamUpdated,
  onExamMetaLoaded,
  onSkillsAutoSwitched,
  onSave,
  onClose,
}: UseExamQuestionEditorParams) {
  const effectiveIs4Skills =
    is4Skills !== undefined
      ? is4Skills
      : exam?.placement_type === '4SKILLS' ||
        exam?.skills_enabled === 'ALL' ||
        exam?.skills_enabled === 'FULL' ||
        false

  const examIdKey = exam?._id || exam?.id || 'new'

  const initialBundle = useMemo(
    () => computeInitialBundle(exam, initialQuestions, initialGlobalAudioUrl),
    [examIdKey, initialQuestions, initialGlobalAudioUrl]
  )

  const [questions, setQuestions] = useState<ExamQuestionItem[]>(() => initialBundle.qs)
  const [globalAudioUrl, setGlobalAudioUrl] = useState<string>(() => initialBundle.audio)
  const [importedExamMeta, setImportedExamMeta] = useState<{
    title?: string
    duration_minutes?: number
    passing_score?: number
    description?: string
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [partFilter, setPartFilter] = useState<string>('ALL')

  const [isProcessingZip, setIsProcessingZip] = useState<boolean>(false)
  const [zipProcessStatus, setZipProcessStatus] = useState<string>('')
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null)
  const [isDragOverZip, setIsDragOverZip] = useState<boolean>(false)

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [uploadingGlobalAudio, setUploadingGlobalAudio] = useState<boolean>(false)
  const [uploadingQuestionAudioIdx, setUploadingQuestionAudioIdx] = useState<number | null>(null)
  const [uploadingQuestionImageIdx, setUploadingQuestionImageIdx] = useState<number | null>(null)

  const zipFileInputRef = useRef<HTMLInputElement>(null)
  const globalAudioInputRef = useRef<HTMLInputElement>(null)
  const questionAudioInputRef = useRef<HTMLInputElement>(null)
  const questionImageInputRef = useRef<HTMLInputElement>(null)
  const activeQuestionIdxRef = useRef<number | null>(null)
  const sessionUploadedUrlsRef = useRef<Set<string>>(new Set())
  const initialMediaUrlsRef = useRef<Set<string>>(new Set(initialBundle.initialMedia))
  const initialSnapshotRef = useRef<string | null>(initialBundle.snap)
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(() => initialBundle.snap)

  const safeCleanupTempMedia = (url: string | undefined | null) => {
    if (!url) return
    if (sessionUploadedUrlsRef.current.has(url) && !initialMediaUrlsRef.current.has(url)) {
      mediaAdminService.cleanupTempMedia([url]).catch(() => {})
      sessionUploadedUrlsRef.current.delete(url)
    }
  }

  const syncSavedState = (qs: ExamQuestionItem[], audio: string) => {
    const snap = getQuestionsSnapshot(qs, audio)
    initialSnapshotRef.current = snap
    setInitialSnapshot(snap)
    sessionUploadedUrlsRef.current.clear()
    if (audio) initialMediaUrlsRef.current.add(audio)
    qs.forEach((q) => {
      if (q.media_url) initialMediaUrlsRef.current.add(q.media_url)
      if (q.audio_url) initialMediaUrlsRef.current.add(q.audio_url)
      if (q.image_url) initialMediaUrlsRef.current.add(q.image_url)
    })
  }

  const prevExamKeyRef = useRef<string | null>(null)
  const currentExamKey = `${examIdKey}_${isOpen}`

  useEffect(() => {
    if (!isOpen) {
      prevExamKeyRef.current = null
      initialSnapshotRef.current = null
      setInitialSnapshot(null)
      sessionUploadedUrlsRef.current.clear()
      return
    }

    if (prevExamKeyRef.current !== currentExamKey) {
      prevExamKeyRef.current = currentExamKey
      setQuestions(initialBundle.qs)
      setGlobalAudioUrl(initialBundle.audio)
      setInitialSnapshot(initialBundle.snap)
      initialSnapshotRef.current = initialBundle.snap
      initialMediaUrlsRef.current = new Set(initialBundle.initialMedia)
      sessionUploadedUrlsRef.current.clear()
      setSearchQuery('')
      setPartFilter('ALL')
    }
  }, [isOpen, currentExamKey, initialBundle])

  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false
    return getQuestionsSnapshot(questions, globalAudioUrl) !== initialSnapshot
  }, [questions, globalAudioUrl, initialSnapshot])

  const filteredQuestions = questions.filter((q, index) => {
    const matchesFilter =
      partFilter === 'ALL' ||
      q.skill_type === partFilter ||
      String(q.part_number) === partFilter ||
      (partFilter === 'LISTENING' && q.skill_type === 'LISTENING') ||
      (partFilter === 'READING' && q.skill_type === 'READING') ||
      (partFilter === 'SPEAKING' && (q.skill_type === 'SPEAKING' || q.question_type === 'SPEAKING')) ||
      (partFilter === 'WRITING' && (q.skill_type === 'WRITING' || q.question_type === 'WRITING')) ||
      (partFilter === 'speaking' && (q.skill_type === 'SPEAKING' || q.question_type === 'SPEAKING')) ||
      (partFilter === 'writing' && (q.skill_type === 'WRITING' || q.question_type === 'WRITING'))

    const qSearch = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !qSearch ||
      `câu ${index + 1}`.includes(qSearch) ||
      q.question_text.toLowerCase().includes(qSearch) ||
      q.options.some((opt) => opt.toLowerCase().includes(qSearch)) ||
      (q.explanation || '').toLowerCase().includes(qSearch)

    return matchesFilter && matchesSearch
  })

  const handleAddQuestion = (targetSkill: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' | number | string = 'READING') => {
    const skill: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' =
      targetSkill === 'SPEAKING' || targetSkill === 'speaking'
        ? 'SPEAKING'
        : targetSkill === 'WRITING' || targetSkill === 'writing'
          ? 'WRITING'
          : targetSkill === 'LISTENING' || (typeof targetSkill === 'number' && targetSkill <= 4)
            ? 'LISTENING'
            : 'READING'

    const isSpeaking = skill === 'SPEAKING'
    const isWriting = skill === 'WRITING'
    const isListening = skill === 'LISTENING'

    const newQuestion: ExamQuestionItem = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      skill_type: skill,
      part_number: isSpeaking ? 'speaking' : isWriting ? 'writing' : undefined,
      question_type: isSpeaking ? 'SPEAKING' : isWriting ? 'WRITING' : 'MULTIPLE_CHOICE',
      question_text: isSpeaking
        ? 'Describe the picture in detail using as much vocabulary as possible.'
        : isWriting
          ? 'Write an email responding to the customer request (at least 100 words).'
          : isListening
            ? 'Listen to the audio and select the best answer.'
            : '',
      options: isSpeaking || isWriting ? [] : ['', '', '', ''],
      correct_answer: 'A',
      explanation: '',
      prep_time_seconds: isSpeaking ? 45 : undefined,
      response_time_seconds: isSpeaking ? 60 : undefined,
      min_words: isWriting ? 100 : undefined,
    }

    setQuestions((prev) => [...prev, newQuestion])
    toast.success(isVi ? 'Đã thêm 1 câu hỏi mới!' : 'Added 1 new question!')
  }

  const handleUploadGlobalAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(mp3|wav|m4a|ogg)$/i.test(file.name)) {
      toast.error(
        isVi
          ? 'Vui lòng chọn file âm thanh (.mp3, .wav, .m4a)'
          : 'Please select an audio file (.mp3, .wav)'
      )
      return
    }

    const oldUrl = globalAudioUrl
    setUploadingGlobalAudio(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'exam-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        if (oldUrl && oldUrl !== uploadedUrl) {
          safeCleanupTempMedia(oldUrl)
        }
        sessionUploadedUrlsRef.current.add(uploadedUrl)
        setGlobalAudioUrl(uploadedUrl)
        toast.success(
          isVi ? `Đã tải file nghe đề thi: ${file.name}` : `Uploaded exam audio: ${file.name}`
        )
      } else {
        toast.error('Không nhận được đường dẫn file âm thanh từ máy chủ.')
      }
    } catch {
      toast.error('Lỗi khi tải file nghe lên hệ thống.')
    } finally {
      setUploadingGlobalAudio(false)
      if (globalAudioInputRef.current) globalAudioInputRef.current.value = ''
    }
  }

  const handleRemoveGlobalAudio = () => {
    if (globalAudioUrl) {
      safeCleanupTempMedia(globalAudioUrl)
      setGlobalAudioUrl('')
      toast.success(isVi ? 'Đã xóa file nghe toàn bài thi!' : 'Removed global exam audio!')
    }
  }

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index]
    if (!target) return
    const cloned: ExamQuestionItem = {
      ...target,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question_text: `${target.question_text} (Bản sao)`,
      options: [...target.options],
    }
    setQuestions((prev) => {
      const next = [...prev]
      next.splice(index + 1, 0, cloned)
      return next
    })
    toast.success(isVi ? 'Đã nhân bản câu hỏi!' : 'Duplicated question!')
  }

  const handleDeleteQuestion = (index: number) => {
    const target = questions[index]
    if (target) {
      safeCleanupTempMedia(target.media_url)
      safeCleanupTempMedia(target.image_url)
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateQuestion = (index: number, updates: Partial<ExamQuestionItem>) => {
    const currentQ = questions[index]
    if ('media_url' in updates) {
      const newMedia = updates.media_url || ''
      if (currentQ?.media_url && currentQ.media_url !== newMedia) {
        safeCleanupTempMedia(currentQ.media_url)
      }
    }
    if ('image_url' in updates) {
      const newImg = updates.image_url || ''
      if (currentQ?.image_url && currentQ.image_url !== newImg) {
        safeCleanupTempMedia(currentQ.image_url)
      }
    }
    setQuestions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const handleOptionChange = (questionIdx: number, optionIdx: number, val: string) => {
    setQuestions((prev) => {
      const next = [...prev]
      const current = { ...next[questionIdx] }
      const newOpts = [...current.options]
      newOpts[optionIdx] = val
      current.options = newOpts
      next[questionIdx] = current
      return next
    })
  }

  const handleUploadQuestionAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const qIdx = activeQuestionIdxRef.current
    if (!file || qIdx === null) return

    const oldUrl = questions[qIdx]?.media_url
    setUploadingQuestionAudioIdx(qIdx)
    try {
      const res = await mediaAdminService.uploadFile(file, 'exam-question-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        if (oldUrl && oldUrl !== uploadedUrl) {
          safeCleanupTempMedia(oldUrl)
        }
        sessionUploadedUrlsRef.current.add(uploadedUrl)
        handleUpdateQuestion(qIdx, { media_url: uploadedUrl })
        toast.success(
          isVi ? `Đã gắn file nghe vào câu ${qIdx + 1}` : `Attached audio to question ${qIdx + 1}`
        )
      }
    } catch {
      toast.error('Lỗi khi tải file nghe của câu hỏi.')
    } finally {
      setUploadingQuestionAudioIdx(null)
      activeQuestionIdxRef.current = null
      if (questionAudioInputRef.current) questionAudioInputRef.current.value = ''
    }
  }

  const handleUploadQuestionImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const qIdx = activeQuestionIdxRef.current
    if (!file || qIdx === null) return

    const oldUrl = questions[qIdx]?.image_url
    setUploadingQuestionImageIdx(qIdx)
    try {
      const res = await mediaAdminService.uploadFile(file, 'exam-question-image')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        if (oldUrl && oldUrl !== uploadedUrl) {
          safeCleanupTempMedia(oldUrl)
        }
        sessionUploadedUrlsRef.current.add(uploadedUrl)
        handleUpdateQuestion(qIdx, { image_url: uploadedUrl })
        toast.success(
          isVi
            ? `Đã gắn ảnh minh họa vào câu ${qIdx + 1}`
            : `Attached image to question ${qIdx + 1}`
        )
      }
    } catch {
      toast.error('Lỗi khi tải ảnh minh họa.')
    } finally {
      setUploadingQuestionImageIdx(null)
      activeQuestionIdxRef.current = null
      if (questionImageInputRef.current) questionImageInputRef.current.value = ''
    }
  }

  const handleZipFileSelected = async (file: File) => {
    if (!file) return
    setIsProcessingZip(true)
    setZipProcessStatus(isVi ? 'Đang đọc và trích xuất dữ liệu...' : 'Reading archive file...')
    setZipProgress(null)

    try {
      const result = await parseAndUploadZipExam(
        file,
        isVi,
        (status, current, total) => {
          setZipProcessStatus(status)
          if (current !== undefined && total !== undefined) {
            setZipProgress({ current, total })
          }
        },
        effectiveIs4Skills,
        isLessonMode,
        (switchedSkills) => {
          onSkillsAutoSwitched?.(switchedSkills)
        }
      )

      setQuestions(result.questions)
      if (!isLessonMode && result.globalAudioUrl) {
        sessionUploadedUrlsRef.current.add(result.globalAudioUrl)
        setGlobalAudioUrl(result.globalAudioUrl)
      }
      if (result.examInfo) {
        setImportedExamMeta(result.examInfo)
        onExamMetaLoaded?.(result.examInfo)
      }
      result.questions.forEach((q) => {
        if (q.media_url) sessionUploadedUrlsRef.current.add(q.media_url)
        if (q.image_url) sessionUploadedUrlsRef.current.add(q.image_url)
      })

      const autoSwitchedMsg =
        result.detectedSkillMode === '4SKILLS' && !effectiveIs4Skills
          ? isVi
            ? ' (Đã tự động chuyển cấu hình sang 4 Kỹ năng LRWS)'
            : ' (Auto-switched config to 4 Skills LRWS)'
          : ''

      toast.success(
        isVi
          ? `Đã nạp thành công ${result.questions.length} câu hỏi (${result.audioCount} audio, ${result.imageCount} ảnh)${autoSwitchedMsg}!`
          : `Successfully imported ${result.questions.length} questions from archive!`
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xử lý file nén.'
      toast.error(msg)
    } finally {
      setIsProcessingZip(false)
      setZipProcessStatus('')
      setZipProgress(null)
      if (zipFileInputRef.current) zipFileInputRef.current.value = ''
    }
  }

  const handleSaveQuestions = async () => {
    if (onSave) {
      setIsSaving(true)
      try {
        await onSave(questions, globalAudioUrl, importedExamMeta || undefined)
        syncSavedState(questions, globalAudioUrl)
        onClose()
      } finally {
        setIsSaving(false)
      }
      return
    }

    if (!exam) return
    const examId = exam._id
    if (!examId) {
      toast.error('Mã đề thi không hợp lệ.')
      return
    }

    setIsSaving(true)
    try {
      const isCourseTest = String(examId).startsWith('course_final_') || String(examId).startsWith('mod_challenge_')
      const updated = isCourseTest
        ? null
        : await examAdminService.saveExamQuestions(
            examId,
            questions,
            globalAudioUrl
          )
      const allMediaUrls: string[] = []
      if (globalAudioUrl) allMediaUrls.push(globalAudioUrl)
      questions.forEach((q) => {
        if (q.media_url) allMediaUrls.push(q.media_url)
        if (q.image_url) allMediaUrls.push(q.image_url)
      })
      if (allMediaUrls.length > 0) {
        mediaAdminService.confirmMedia(allMediaUrls, examId).catch(() => {})
      }

      syncSavedState(questions, globalAudioUrl)

      const mergedExam: ToeicExamItem = {
        ...exam,
        ...(updated || {}),
        questions,
        total_questions: questions.length,
        audio_url: globalAudioUrl,
      }
      onExamUpdated?.(mergedExam)
      toast.success(
        isVi
          ? `Đã lưu thành công bộ ${questions.length} câu hỏi vào đề thi!`
          : `Saved ${questions.length} questions to exam!`
      )
      onClose()
    } catch {
      syncSavedState(questions, globalAudioUrl)

      const mergedExam: ToeicExamItem = {
        ...exam,
        questions,
        total_questions: questions.length,
        audio_url: globalAudioUrl,
      }
      onExamUpdated?.(mergedExam)
      toast.success(
        isVi
          ? `Đã cập nhật ${questions.length} câu hỏi vào đề thi (Local)!`
          : `Updated ${questions.length} questions (Local)!`
      )
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return {
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
    isSaving,
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
    handleRemoveGlobalAudio,
    handleDuplicateQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
    handleOptionChange,
    handleUploadQuestionAudio,
    handleUploadQuestionImage,
    handleZipFileSelected,
    handleSaveQuestions,
    sessionUploadedUrlsRef,
    isDirty,
    cleanupSessionMedia: async () => {
      const urls = Array.from(sessionUploadedUrlsRef.current).filter(
        (url) => !initialMediaUrlsRef.current.has(url)
      )
      if (urls.length > 0) {
        await mediaAdminService.cleanupTempMedia(urls)
      }
      sessionUploadedUrlsRef.current.clear()
    },
  }
}
