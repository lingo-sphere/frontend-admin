/**
 * @file ExamQuestionEditorModal.tsx
 * @description Modal chuyên sâu cho Quản trị viên (Admin) biên soạn và quản lý ngân hàng câu hỏi của đề thi (hỗ trợ nhập thủ công, upload Audio/Ảnh từng câu hoặc toàn bài, import hàng loạt từ Excel).
 * Tuyệt đối không có tính năng AI sinh câu hỏi theo yêu cầu của hệ thống.
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  Trash2,
  Copy,
  Volume2,
  Image as ImageIcon,
  Save,
  Search,
  BookOpen,
  Archive,
  Loader2,
  Plus,
  Mic,
  PenTool,
  Download,
  FolderArchive,
} from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'
import { examAdminService } from '@/services/exam.service'
import { mediaAdminService } from '@/services/media.service'
import { parseAndUploadZipExam, downloadSampleZip } from '@/components/exams/zipExamHelper'
import { toast } from '@/store/toast-store'
import { Popconfirm } from '@/components/common/Popconfirm'

export interface ExamQuestionItem {
  id?: string
  part_number?: number | string
  part_name?: string
  question_type?: 'MULTIPLE_CHOICE' | 'SPEAKING' | 'WRITING'
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
  media_url?: string
  image_url?: string
  // For Speaking / Writing prompts
  prep_time_seconds?: number
  response_time_seconds?: number
  min_words?: number
}

interface ExamQuestionEditorModalProps {
  isOpen: boolean
  onClose: () => void
  exam: ToeicExamItem | null
  onExamUpdated: (updatedExam: ToeicExamItem) => void
}

const PART_OPTIONS = [
  { value: 1, label: 'Part 1: Mô tả hình ảnh (Photographs)' },
  { value: 2, label: 'Part 2: Hỏi & Đáp (Question - Response)' },
  { value: 3, label: 'Part 3: Đoạn hội thoại (Conversations)' },
  { value: 4, label: 'Part 4: Bài nói ngắn (Short Talks)' },
  { value: 5, label: 'Part 5: Hoàn thành câu (Incomplete Sentences)' },
  { value: 6, label: 'Part 6: Hoàn thành đoạn văn (Text Completion)' },
  { value: 7, label: 'Part 7: Đọc hiểu văn bản (Reading Comprehension)' },
  { value: 'speaking', label: 'Speaking: Bài thi Nói TOEIC (11 câu hỏi)' },
  { value: 'writing', label: 'Writing: Bài thi Viết TOEIC (8 câu hỏi)' },
]

export function ExamQuestionEditorModal({
  isOpen,
  onClose,
  exam,
  onExamUpdated,
}: ExamQuestionEditorModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [questions, setQuestions] = useState<ExamQuestionItem[]>([])
  const [globalAudioUrl, setGlobalAudioUrl] = useState<string>('')
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

  // Initialize or reset questions whenever exam changes
  useEffect(() => {
    if (isOpen && exam) {
      const existingQs: ExamQuestionItem[] = Array.isArray(exam.questions)
        ? exam.questions.map((q: any, idx: number) => ({
            id: q.id || `q_${idx}_${Date.now()}`,
            part_number: q.part_number || q.part || 5,
            part_name: q.part_name || '',
            question_type: q.question_type || (q.part_number === 'speaking' ? 'SPEAKING' : q.part_number === 'writing' ? 'WRITING' : 'MULTIPLE_CHOICE'),
            question_text: q.question_text || q.questionTextEn || q.question_text_en || '',
            options: Array.isArray(q.options)
              ? q.options.map((opt: any) => (typeof opt === 'string' ? opt : opt.textEn || opt.text || ''))
              : ['', '', '', ''],
            correct_answer: (q.correct_answer || q.correctOption || q.correct_option || 'A').toString().toUpperCase(),
            explanation: q.explanation || q.explanation_vi || q.explanation_en || '',
            media_url: q.media_url || q.audio_url || '',
            image_url: q.image_url || '',
            prep_time_seconds: q.prep_time_seconds,
            response_time_seconds: q.response_time_seconds,
            min_words: q.min_words,
          }))
        : []

      setQuestions(existingQs)
      setGlobalAudioUrl(exam.audio_url || '')
      setSearchQuery('')
      setPartFilter('ALL')
    }
  }, [isOpen, exam])

  if (!isOpen || !exam) return null

  const is4Skills = exam.placement_type === '4SKILLS' || exam.skills_enabled === 'ALL'
  const isSystemPlacement = Boolean(
    exam.is_system_placement ||
    exam.type === 'DIAGNOSTIC_TEST' ||
    !exam.course_id
  )

  // Filter questions for rendering
  const filteredQuestions = questions.filter((q, index) => {
    const matchesFilter =
      partFilter === 'ALL' ||
      String(q.part_number) === partFilter ||
      (partFilter === 'speaking' && q.question_type === 'SPEAKING') ||
      (partFilter === 'writing' && q.question_type === 'WRITING')

    const qSearch = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !qSearch ||
      `câu ${index + 1}`.includes(qSearch) ||
      q.question_text.toLowerCase().includes(qSearch) ||
      q.options.some((opt) => opt.toLowerCase().includes(qSearch)) ||
      (q.explanation || '').toLowerCase().includes(qSearch)

    return matchesFilter && matchesSearch
  })

  // Handlers for Question Editing (dành cho các bài kiểm tra khóa học thêm thủ công)
  const handleAddQuestion = (partNum: number | string = 5) => {
    const isSpeaking = partNum === 'speaking'
    const isWriting = partNum === 'writing'
    const newQuestion: ExamQuestionItem = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      part_number: partNum,
      question_type: isSpeaking ? 'SPEAKING' : isWriting ? 'WRITING' : 'MULTIPLE_CHOICE',
      question_text: isSpeaking
        ? 'Describe the picture in detail using as much vocabulary as possible.'
        : isWriting
        ? 'Write an email responding to the customer request (at least 100 words).'
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

  // Upload Audio for Whole Exam
  const handleUploadGlobalAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(mp3|wav|m4a|ogg)$/i.test(file.name)) {
      toast.error(isVi ? 'Vui lòng chọn file âm thanh (.mp3, .wav, .m4a)' : 'Please select an audio file (.mp3, .wav)')
      return
    }

    setUploadingGlobalAudio(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'exam-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        setGlobalAudioUrl(uploadedUrl)
        toast.success(isVi ? `Đã tải file nghe đề thi: ${file.name}` : `Uploaded exam audio: ${file.name}`)
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
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateQuestion = (index: number, updates: Partial<ExamQuestionItem>) => {
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



  // Upload Audio for Specific Question
  const handleUploadQuestionAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const qIdx = activeQuestionIdxRef.current
    if (!file || qIdx === null) return

    setUploadingQuestionAudioIdx(qIdx)
    try {
      const res = await mediaAdminService.uploadFile(file, 'exam-question-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        handleUpdateQuestion(qIdx, { media_url: uploadedUrl })
        toast.success(isVi ? `Đã gắn file nghe vào câu ${qIdx + 1}` : `Attached audio to question ${qIdx + 1}`)
      }
    } catch {
      toast.error('Lỗi khi tải file nghe của câu hỏi.')
    } finally {
      setUploadingQuestionAudioIdx(null)
      activeQuestionIdxRef.current = null
      if (questionAudioInputRef.current) questionAudioInputRef.current.value = ''
    }
  }

  // Upload Image for Specific Question
  const handleUploadQuestionImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const qIdx = activeQuestionIdxRef.current
    if (!file || qIdx === null) return

    setUploadingQuestionImageIdx(qIdx)
    try {
      const res = await mediaAdminService.uploadFile(file, 'exam-question-image')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        handleUpdateQuestion(qIdx, { image_url: uploadedUrl })
        toast.success(isVi ? `Đã gắn ảnh minh họa vào câu ${qIdx + 1}` : `Attached image to question ${qIdx + 1}`)
      }
    } catch {
      toast.error('Lỗi khi tải ảnh minh họa.')
    } finally {
      setUploadingQuestionImageIdx(null)
      activeQuestionIdxRef.current = null
      if (questionImageInputRef.current) questionImageInputRef.current.value = ''
    }
  }



  // Handle direct ZIP file selection and processing
  const handleZipFileSelected = async (file: File) => {
    if (!file) return
    setIsProcessingZip(true)
    setZipProcessStatus(isVi ? 'Đang đọc và giải nén file ZIP...' : 'Reading ZIP file...')
    setZipProgress(null)

    try {
      const result = await parseAndUploadZipExam(file, isVi, (status, current, total) => {
        setZipProcessStatus(status)
        if (current !== undefined && total !== undefined) {
          setZipProgress({ current, total })
        }
      })

      setQuestions(result.questions)
      if (result.globalAudioUrl && !globalAudioUrl) {
        setGlobalAudioUrl(result.globalAudioUrl)
      }

      toast.success(
        isVi
          ? `Đã nạp thành công ${result.questions.length} câu hỏi (${result.audioCount} audio, ${result.imageCount} ảnh) từ file ZIP!`
          : `Successfully imported ${result.questions.length} questions from ZIP!`
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xử lý file ZIP.'
      toast.error(msg)
    } finally {
      setIsProcessingZip(false)
      setZipProcessStatus('')
      setZipProgress(null)
      if (zipFileInputRef.current) zipFileInputRef.current.value = ''
    }
  }

  const handleZipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleZipFileSelected(file)
  }

  const handleDropZip = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOverZip(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleZipFileSelected(file)
  }

  // Save All Questions
  const handleSaveQuestions = async () => {
    const examId = exam.id || exam._id
    if (!examId) {
      toast.error('Mã đề thi không hợp lệ.')
      return
    }

    setIsSaving(true)
    try {
      const updated = await examAdminService.saveExamQuestions(examId, questions, globalAudioUrl)
      const mergedExam: ToeicExamItem = {
        ...exam,
        ...(updated || {}),
        questions,
        total_questions: questions.length,
        audio_url: globalAudioUrl,
      }
      onExamUpdated(mergedExam)
      toast.success(isVi ? `Đã lưu thành công bộ ${questions.length} câu hỏi vào đề thi!` : `Saved ${questions.length} questions to exam!`)
      onClose()
    } catch {
      // Local fallback in case network hiccup
      const mergedExam: ToeicExamItem = {
        ...exam,
        questions,
        total_questions: questions.length,
        audio_url: globalAudioUrl,
      }
      onExamUpdated(mergedExam)
      toast.success(isVi ? `Đã cập nhật ${questions.length} câu hỏi vào đề thi (Local)!` : `Updated ${questions.length} questions (Local)!`)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-5xl max-h-[94vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">

        <input
          ref={zipFileInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={handleZipInputChange}
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

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Soạn Ngân Hàng Câu Hỏi Đề Thi' : 'Exam Question Bank Editor'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {questions.length} câu hỏi
                </span>
                {isSystemPlacement ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {isVi ? 'Đầu vào hệ thống (ZIP)' : 'System Placement (ZIP)'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {isVi ? 'Bài thi khóa học' : 'Course Exam'}
                  </span>
                )}
                {is4Skills ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    4 Kỹ năng (LRSW)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    2 Kỹ năng (LR)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
                {exam.title} {exam.course_title ? `• ${exam.course_title}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isVi ? 'Tìm kiếm theo nội dung, câu số...' : 'Search questions...'}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <select
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">{isVi ? 'Tất cả phần' : 'All Parts'}</option>
              <option value="1">Part 1 (Ảnh)</option>
              <option value="2">Part 2 (Hỏi đáp)</option>
              <option value="3">Part 3 (Hội thoại)</option>
              <option value="4">Part 4 (Bài nói)</option>
              <option value="5">Part 5 (Điền câu)</option>
              <option value="6">Part 6 (Điền đoạn)</option>
              <option value="7">Part 7 (Đọc hiểu)</option>
              {is4Skills && (
                <>
                  <option value="speaking">Speaking (Nói)</option>
                  <option value="writing">Writing (Viết)</option>
                </>
              )}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
            {isSystemPlacement ? (
              /* Chỉ duy nhất bài test đầu vào hệ thống mới cho import Gói ZIP - Mở file picker trực tiếp */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSampleZip(isVi)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title={isVi ? 'Tải xuống gói ZIP đề thi mẫu chuẩn' : 'Download sample ZIP'}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isVi ? 'Tải ZIP mẫu' : 'Sample ZIP'}</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingZip}
                  onClick={() => zipFileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs hover:shadow-purple-500/20 transition-all cursor-pointer"
                  title={isVi ? 'Mở cửa sổ chọn file ZIP đề thi' : 'Choose ZIP file'}
                >
                  {isProcessingZip ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isVi ? 'Đang nạp ZIP...' : 'Importing...'}</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      <span>{isVi ? 'Import Gói ZIP (Excel + Media)' : 'Import ZIP Package'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Các bài thi khóa học (Challenge, Final...) không cho import ZIP, cho thêm câu hỏi và gắn audio */
              <>
                <button
                  type="button"
                  onClick={() => globalAudioInputRef.current?.click()}
                  disabled={uploadingGlobalAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title={isVi ? 'Upload file nghe chung cho toàn đề thi' : 'Upload global audio file'}
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {uploadingGlobalAudio
                      ? (isVi ? 'Đang tải...' : 'Uploading...')
                      : globalAudioUrl
                      ? (isVi ? 'Đổi Audio Đề' : 'Change Audio')
                      : (isVi ? 'Gắn Audio Đề' : 'Set Audio')}
                  </span>
                </button>

                {is4Skills && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('speaking')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-teal-600" />
                      <span>+ {isVi ? 'Nói' : 'Speaking'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('writing')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5 text-blue-600" />
                      <span>+ {isVi ? 'Viết' : 'Writing'}</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleAddQuestion(partFilter !== 'ALL' && !isNaN(Number(partFilter)) ? Number(partFilter) : 5)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Thêm câu hỏi' : 'Add Question'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Global Audio Player Preview (if set) */}
        {globalAudioUrl && (
          <div className="flex items-center justify-between gap-3 px-6 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-xs">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Volume2 className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold">{isVi ? 'Audio toàn bài thi:' : 'Global Exam Audio:'}</span>
              <audio controls src={globalAudioUrl} className="h-7 max-w-xs" />
            </div>
            <button
              type="button"
              onClick={() => setGlobalAudioUrl('')}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
              title="Xóa audio toàn bài"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Questions List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {questions.length === 0 ? (
            isProcessingZip ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 space-y-4 animate-pulse">
                <div className="w-16 h-16 rounded-3xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {zipProcessStatus || (isVi ? 'Đang giải nén và nạp câu hỏi từ file ZIP...' : 'Processing ZIP package...')}
                  </h4>
                  {zipProgress && (
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {zipProgress.current} / {zipProgress.total} file
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isVi
                      ? 'Hệ thống đang tự động trích xuất bảng Excel và tải lên file âm thanh, hình ảnh. Vui lòng chờ...'
                      : 'Unpacking spreadsheet and uploading media assets...'}
                  </p>
                </div>
              </div>
            ) : isSystemPlacement ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOverZip(true)
                }}
                onDragLeave={() => setIsDragOverZip(false)}
                onDrop={handleDropZip}
                className={`flex flex-col items-center justify-center py-14 px-6 text-center rounded-3xl border-2 border-dashed transition-all bg-white dark:bg-slate-900 space-y-4 ${
                  isDragOverZip
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <FolderArchive className="w-8 h-8" />
                </div>

                <div className="max-w-md space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isVi ? 'Kéo thả hoặc chọn file ZIP đề thi' : 'Drag & drop or select Exam ZIP file'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isVi
                      ? 'Gói ZIP gồm file questions.xlsx cùng các file âm thanh (.mp3) và ảnh (.jpg/.png). Nhấn nút bên dưới để chọn file và nạp ngay vào đề thi.'
                      : 'ZIP archive contains questions.xlsx spreadsheet and audio/image media files.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isProcessingZip}
                    onClick={() => zipFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-purple-500/20"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{isVi ? 'Chọn file ZIP từ máy tính' : 'Choose ZIP File'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadSampleZip(isVi)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>{isVi ? 'Tải Gói ZIP Mẫu Chuẩn' : 'Download Sample ZIP'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isVi ? 'Đề thi khóa học hiện chưa có câu hỏi nào' : 'No questions in this course exam yet'}
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
                    onClick={() => handleAddQuestion(partFilter !== 'ALL' && !isNaN(Number(partFilter)) ? Number(partFilter) : 5)}
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
              const isSpeaking = q.question_type === 'SPEAKING' || q.part_number === 'speaking'
              const isWriting = q.question_type === 'WRITING' || q.part_number === 'writing'

              return (
                <div
                  key={q.id || qIndex}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-800"
                >
                  {/* Card Top: Question Number, Part Selector & Actions */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {qIndex + 1}
                      </span>

                      {/* Part Selector */}
                      <select
                        value={q.part_number || (isSpeaking ? 'speaking' : isWriting ? 'writing' : 5)}
                        onChange={(e) => {
                          const val = e.target.value
                          const isSp = val === 'speaking'
                          const isWr = val === 'writing'
                          handleUpdateQuestion(qIndex, {
                            part_number: isSp || isWr ? val : Number(val),
                            question_type: isSp ? 'SPEAKING' : isWr ? 'WRITING' : 'MULTIPLE_CHOICE',
                            options: isSp || isWr ? [] : q.options.length ? q.options : ['', '', '', ''],
                          })
                        }}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                      >
                        {PART_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Card Actions: Duplicate & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(qIndex)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                        title={isVi ? 'Nhân bản câu này' : 'Duplicate question'}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <Popconfirm
                        title={isVi ? 'Xóa câu hỏi này?' : 'Delete this question?'}
                        onConfirm={() => handleDeleteQuestion(qIndex)}
                      >
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                          title={isVi ? 'Xóa câu hỏi' : 'Delete question'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>

                  {/* Question Text / Prompt */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isSpeaking
                        ? 'Đề bài / Yêu cầu phần thi Nói (Prompt):'
                        : isWriting
                        ? 'Đề bài / Yêu cầu phần thi Viết (Prompt):'
                        : 'Nội dung câu hỏi:'}
                    </label>
                    <textarea
                      rows={2}
                      value={q.question_text}
                      onChange={(e) => handleUpdateQuestion(qIndex, { question_text: e.target.value })}
                      placeholder={
                        isSpeaking
                          ? 'Ví dụ: Describe what you see in the photo in as much detail as possible...'
                          : isWriting
                          ? 'Ví dụ: You received an email from your manager. Write a response addressing two points...'
                          : 'Nhập câu hỏi (ví dụ: Mr. Henderson requested that the quarterly report _____ by Friday.)...'
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Media Section: Audio & Image */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {/* Audio Upload */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingQuestionAudioIdx === qIndex}
                        onClick={() => {
                          activeQuestionIdxRef.current = qIndex
                          questionAudioInputRef.current?.click()
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      >
                        {uploadingQuestionAudioIdx === qIndex ? (
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-indigo-500" />
                        )}
                        <span>{q.media_url ? 'Đổi Audio câu' : 'Thêm Audio câu'}</span>
                      </button>
                      {q.media_url && (
                        <div className="flex items-center gap-1">
                          <audio controls src={q.media_url} className="h-6 max-w-[180px]" />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuestion(qIndex, { media_url: undefined })}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Xóa audio"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingQuestionImageIdx === qIndex}
                        onClick={() => {
                          activeQuestionIdxRef.current = qIndex
                          questionImageInputRef.current?.click()
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      >
                        {uploadingQuestionImageIdx === qIndex ? (
                          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-amber-500" />
                        )}
                        <span>{q.image_url ? 'Đổi ảnh câu' : 'Thêm Ảnh câu'}</span>
                      </button>
                      {q.image_url && (
                        <div className="flex items-center gap-1">
                          <img
                            src={q.image_url}
                            alt="minh hoa"
                            className="h-7 w-12 object-cover rounded-md border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuestion(qIndex, { image_url: undefined })}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options (Multiple Choice) OR Speaking/Writing Configuration */}
                  {!isSpeaking && !isWriting ? (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isVi ? 'Các lựa chọn đáp án (Chọn nút tròn ở đáp án ĐÚNG):' : 'Options (Mark the correct answer):'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {letters.map((letter, optIdx) => {
                          const isCorrect = (q.correct_answer || 'A').toUpperCase() === letter
                          return (
                            <div
                              key={letter}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-400/30'
                                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(qIndex, { correct_answer: letter })}
                                className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                }`}
                                title={`Đặt ${letter} làm đáp án đúng`}
                              >
                                {letter}
                              </button>
                              <input
                                type="text"
                                value={q.options[optIdx] || ''}
                                onChange={(e) => handleOptionChange(qIndex, optIdx, e.target.value)}
                                placeholder={`Lựa chọn ${letter}...`}
                                className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Speaking / Writing Configuration */
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      {isSpeaking && (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Thời gian chuẩn bị (giây):
                            </label>
                            <input
                              type="number"
                              min={10}
                              max={120}
                              value={q.prep_time_seconds || 45}
                              onChange={(e) => handleUpdateQuestion(qIndex, { prep_time_seconds: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Thời gian trả lời / nói (giây):
                            </label>
                            <input
                              type="number"
                              min={15}
                              max={180}
                              value={q.response_time_seconds || 60}
                              onChange={(e) => handleUpdateQuestion(qIndex, { response_time_seconds: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                            />
                          </div>
                        </>
                      )}
                      {isWriting && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Số từ tối thiểu (words):
                          </label>
                          <input
                            type="number"
                            min={30}
                            max={600}
                            value={q.min_words || 100}
                            onChange={(e) => handleUpdateQuestion(qIndex, { min_words: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation Section */}
                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {isVi ? 'Lời giải thích chi tiết đáp án:' : 'Answer explanation / key notes:'}
                    </label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateQuestion(qIndex, { explanation: e.target.value })}
                      placeholder={isVi ? 'Giải thích vì sao chọn đáp án này, ngữ pháp / từ vựng áp dụng...' : 'Explain why this answer is correct...'}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVi ? 'Tổng số câu hỏi:' : 'Total Questions:'}{' '}
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
              {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveQuestions}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isVi ? 'Đang lưu...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isVi ? 'Lưu bộ câu hỏi đề thi' : 'Save Question Bank'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
