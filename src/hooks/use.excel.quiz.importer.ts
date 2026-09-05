/**
 * @file use.excel.quiz.importer.ts
 * @description Custom hook quản lý trạng thái tải file Excel trắc nghiệm, kiểm tra cấu trúc cột, upload file âm thanh R2 và áp dụng câu hỏi
 */

import { useState, useRef, useEffect } from 'react'
import type { QuizQuestionItem } from '@/services/ai.service'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast.store'
import {
  parseQuizExcelBinary,
  type ColumnValidationResult,
} from '@/components/admin/excel-quiz/excel.quiz.parser'

interface UseExcelQuizImporterParams {
  isOpen: boolean
  moduleTitle: string
  initialAudioUrl?: string
  onApplyQuestions: (
    questions: QuizQuestionItem[],
    mode?: 'append' | 'replace',
    audioUrl?: string
  ) => void
  onClose: () => void
}

export function useExcelQuizImporter({
  isOpen,
  moduleTitle,
  initialAudioUrl,
  onApplyQuestions,
  onClose,
}: UseExcelQuizImporterParams) {
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestionItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<ColumnValidationResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setParsedQuestions([])
      setError(null)
      setValidationResult(null)
      setFileName(null)
      setAudioUrl(initialAudioUrl || null)
      setAudioFileName(null)
      setIsUploadingAudio(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }, [isOpen, moduleTitle, initialAudioUrl])

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(mp3|wav|m4a|ogg)$/i.test(file.name)) {
      toast.error('File âm thanh không đúng định dạng. Vui lòng chọn .mp3, .wav, .m4a hoặc .ogg')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file âm thanh không được vượt quá 50MB')
      return
    }

    setIsUploadingAudio(true)
    setAudioFileName(file.name)
    try {
      const res = await mediaAdminService.uploadFile(file, 'quiz-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        setAudioUrl(uploadedUrl)
        toast.success(`Tải file nghe cho bộ đề thành công: ${file.name}`)
      } else {
        toast.error('Không nhận được đường dẫn file âm thanh từ máy chủ.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file audio lên máy chủ lưu trữ.'
      toast.error(msg)
    } finally {
      setIsUploadingAudio(false)
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError('File tải lên không hợp lệ. Vui lòng chỉ chọn file Excel (.xlsx, .xls).')
      toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Dung lượng file Excel không được vượt quá 15MB.')
      toast.error('Dung lượng file vượt quá 15MB')
      return
    }

    setFileName(file.name)
    setError(null)
    setValidationResult(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result as string
        const parsed = parseQuizExcelBinary(bstr)

        setValidationResult(parsed.validation)
        if (parsed.errorMessage) {
          setError(parsed.errorMessage)
          setParsedQuestions([])
        } else {
          setParsedQuestions(parsed.questions)
          toast.success(`Nhận diện thành công ${parsed.questions.length} câu hỏi hợp lệ!`)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Lỗi đọc file Excel'
        setError(msg)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleApply = (mode: 'append' | 'replace') => {
    if (parsedQuestions.length === 0) return

    onApplyQuestions(parsedQuestions, mode, audioUrl || undefined)
    toast.success(
      mode === 'append'
        ? `Đã thêm thành công ${parsedQuestions.length} câu hỏi vào danh sách!`
        : `Đã cập nhật bài test với ${parsedQuestions.length} câu hỏi mới!`
    )
    onClose()
  }

  const removeQuestion = (idx: number) => {
    setParsedQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const removeAudio = () => {
    setAudioUrl(null)
    setAudioFileName(null)
  }

  return {
    parsedQuestions,
    error,
    validationResult,
    fileName,
    audioUrl,
    audioFileName,
    isUploadingAudio,
    fileInputRef,
    audioInputRef,
    handleAudioUpload,
    handleFileUpload,
    handleApply,
    removeQuestion,
    removeAudio,
  }
}
