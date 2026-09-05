/**
 * @file exam.question.editor.modal.tsx
 * @description Modal biên soạn và quản lý ngân hàng câu hỏi đề thi (hỗ trợ nhập thủ công, audio/hình ảnh, import gói ZIP)
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  Trash2,
  Volume2,
  Save,
  Search,
  BookOpen,
  Archive,
  Loader2,
  Plus,
  Mic,
  PenTool,
  Download,
} from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'
import { examAdminService } from '@/services/exam.service'
import { mediaAdminService } from '@/services/media.service'
import { parseAndUploadZipExam, downloadSampleZip } from '@/components/exams/zip.exam.helper'
import { toast } from '@/store/toast-store'
import { ExamQuestionCard } from '@/components/exams/exam.question.card'
import { ExamZipDropzone } from '@/components/exams/exam.zip.dropzone'

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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
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

          <div className="flex items-center gap-2 justify-end flex-wrap">
            {isSystemPlacement ? (
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

        <div 
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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
                onDrop={handleDropZip}
                onOpenZipPicker={() => zipFileInputRef.current?.click()}
                onDownloadSampleZip={() => downloadSampleZip(isVi)}
              />
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

              return (
                <ExamQuestionCard
                  key={q.id || qIndex}
                  question={q}
                  index={qIndex}
                  isVi={isVi}
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
