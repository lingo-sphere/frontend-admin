// Custom hook quan ly trang thai bien soan cau hoi va don dep media khi huy.

import { useState, useEffect, useRef, useMemo } from 'react'
import type { ToeicExamItem } from '@/services/exam.service'
import { examAdminService } from '@/services/exam.service'
import { mediaAdminService } from '@/services/media.service'
import { parseAndUploadZipExam } from '@/components/exams/zip.exam.helper'
import { toast } from '@/store/toast.store'

export interface ExamQuestionItem {
  id?: string
  _id?: string
  skill_type?: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'
  part_number?: number | string
  part_name?: string
  question_type?: 'MULTIPLE_CHOICE' | 'SPEAKING' | 'WRITING'
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
  media_url?: string
  audio_url?: string
  image_url?: string
  prep_time_seconds?: number
  response_time_seconds?: number
  min_words?: number
}

interface RawExamQuestion {
  id?: string
  _id?: string
  skill_type?: string
  skillType?: string
  part_number?: number | string
  part?: number | string
  part_name?: string
  question_type?: string
  question_text?: string
  questionTextEn?: string
  question_text_en?: string
  options?: Array<string | { textEn?: string; text?: string }>
  correct_answer?: string
  correctOption?: string
  correct_option?: string
  explanation?: string
  explanation_vi?: string
  explanation_en?: string
  media_url?: string
  audio_url?: string
  image_url?: string
  image_media_id?: string
  imageMediaId?: string
  imageUrl?: string
  prep_time_seconds?: number
  response_time_seconds?: number
  min_words?: number
}

interface UseExamQuestionEditorParams {
  isOpen: boolean
  exam?: ToeicExamItem | null
  is4Skills?: boolean
  initialQuestions?: ExamQuestionItem[]
  initialGlobalAudioUrl?: string
  isVi: boolean
  onExamUpdated?: (updatedExam: ToeicExamItem) => void
  onSave?: (questions: ExamQuestionItem[], globalAudioUrl: string) => Promise<void> | void
  onClose: () => void
}

function normalizeQuestions(rawList: Array<ExamQuestionItem | RawExamQuestion>): ExamQuestionItem[] {
  return rawList.map((q, idx) => {
    const raw = q as RawExamQuestion
    const rawPart = raw.part_number ?? raw.part
    const isSpk =
      rawPart === 'speaking' ||
      raw.question_type === 'SPEAKING' ||
      raw.skill_type === 'SPEAKING' ||
      raw.skillType === 'SPEAKING'
    const isWrt =
      rawPart === 'writing' ||
      raw.question_type === 'WRITING' ||
      raw.skill_type === 'WRITING' ||
      raw.skillType === 'WRITING'
    const numPart = typeof rawPart === 'number' ? rawPart : parseInt(String(rawPart), 10)
    const hasExplicitPart = !isNaN(numPart) && numPart >= 1 && numPart <= 7
    const isListen =
      raw.skill_type === 'LISTENING' ||
      raw.skillType === 'LISTENING' ||
      (!isSpk && !isWrt && Boolean(raw.media_url || raw.audio_url)) ||
      (hasExplicitPart && numPart <= 4)

    const derivedSkill: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' = isSpk
      ? 'SPEAKING'
      : isWrt
        ? 'WRITING'
        : isListen
          ? 'LISTENING'
          : 'READING'

    return {
      id: raw.id || raw._id || `q_${idx}`,
      skill_type: derivedSkill,
      part_number: isSpk ? 'speaking' : isWrt ? 'writing' : hasExplicitPart ? numPart : undefined,
      part_name: raw.part_name || '',
      question_type: isSpk ? 'SPEAKING' : isWrt ? 'WRITING' : 'MULTIPLE_CHOICE',
      question_text: raw.question_text || raw.questionTextEn || raw.question_text_en || '',
      options: Array.isArray(raw.options)
        ? raw.options.map((opt) => (typeof opt === 'string' ? opt : opt.textEn || opt.text || ''))
        : ['', '', '', ''],
      correct_answer: (
        raw.correct_answer ||
        raw.correctOption ||
        raw.correct_option ||
        'A'
      )
        .toString()
        .toUpperCase(),
      explanation: raw.explanation || raw.explanation_vi || raw.explanation_en || '',
      media_url: raw.media_url || raw.audio_url || '',
      image_url: raw.image_url || raw.image_media_id || raw.imageMediaId || raw.imageUrl || '',
      prep_time_seconds: raw.prep_time_seconds,
      response_time_seconds: raw.response_time_seconds,
      min_words: raw.min_words,
    }
  })
}

function getQuestionsSnapshot(qs: ExamQuestionItem[], audio: string): string {
  return JSON.stringify({
    audio: (audio || '').trim(),
    qs: (qs || []).map((q) => ({
      skill_type: q.skill_type || 'READING',
      part_number: q.part_number !== undefined ? String(q.part_number) : '',
      question_type: q.question_type || 'MULTIPLE_CHOICE',
      question_text: (q.question_text || '').trim(),
      options: Array.isArray(q.options) ? q.options.map((opt) => (opt || '').trim()) : [],
      correct_answer: (q.correct_answer || 'A').toString().trim().toUpperCase(),
      explanation: (q.explanation || '').trim(),
      media_url: (q.media_url || q.audio_url || '').trim(),
      image_url: (q.image_url || '').trim(),
      prep_time_seconds: q.prep_time_seconds ?? null,
      response_time_seconds: q.response_time_seconds ?? null,
      min_words: q.min_words ?? null,
    })),
  })
}

function computeInitialBundle(
  exam: ToeicExamItem | null | undefined,
  initialQuestions: ExamQuestionItem[] | undefined,
  initialGlobalAudioUrl: string | undefined
) {
  const rawQs = exam?.questions || initialQuestions || []
  const qs = normalizeQuestions(Array.isArray(rawQs) ? rawQs : [])
  const audio = (exam?.audio_url || initialGlobalAudioUrl || '').trim()
  const snap = getQuestionsSnapshot(qs, audio)
  const initialMedia = new Set<string>()
  if (audio) initialMedia.add(audio)
  qs.forEach((q) => {
    if (q.media_url) initialMedia.add(q.media_url)
    if (q.audio_url) initialMedia.add(q.audio_url)
    if (q.image_url) initialMedia.add(q.image_url)
  })
  return { qs, audio, snap, initialMedia }
}

export function useExamQuestionEditor({
  isOpen,
  exam,
  is4Skills,
  initialQuestions,
  initialGlobalAudioUrl,
  isVi,
  onExamUpdated,
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

  const initialBundle = useMemo(
    () => computeInitialBundle(exam, initialQuestions, initialGlobalAudioUrl),
    [exam, initialQuestions, initialGlobalAudioUrl]
  )

  const [questions, setQuestions] = useState<ExamQuestionItem[]>(() => initialBundle.qs)
  const [globalAudioUrl, setGlobalAudioUrl] = useState<string>(() => initialBundle.audio)
  const [globalAudioFile, setGlobalAudioFile] = useState<File | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [partFilter, setPartFilter] = useState<string>('ALL')
  const [selectedIdx, setSelectedIdx] = useState<number>(0)

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

  useEffect(() => {
    if (isOpen) {
      setQuestions(initialBundle.qs)
      setGlobalAudioUrl(initialBundle.audio)
      setInitialSnapshot(initialBundle.snap)
      initialSnapshotRef.current = initialBundle.snap
      initialMediaUrlsRef.current = new Set(initialBundle.initialMedia)
      sessionUploadedUrlsRef.current.clear()
      setSearchQuery('')
      setPartFilter('ALL')
    } else {
      initialSnapshotRef.current = null
      setInitialSnapshot(null)
      sessionUploadedUrlsRef.current.clear()
    }
  }, [isOpen, initialBundle])

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
        effectiveIs4Skills
      )

      setQuestions(result.questions)
      if (result.globalAudioUrl) {
        sessionUploadedUrlsRef.current.add(result.globalAudioUrl)
        setGlobalAudioUrl(result.globalAudioUrl)
      }
      result.questions.forEach((q) => {
        if (q.media_url) sessionUploadedUrlsRef.current.add(q.media_url)
        if (q.image_url) sessionUploadedUrlsRef.current.add(q.image_url)
      })

      toast.success(
        isVi
          ? `Đã nạp thành công ${result.questions.length} câu hỏi (${result.audioCount} audio, ${result.imageCount} ảnh) từ file nén!`
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
        await onSave(questions, globalAudioUrl)
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
