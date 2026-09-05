/**
 * @file excel.quiz.importer.modal.tsx
 * @description Modal quản trị import câu hỏi trắc nghiệm từ Excel kèm kiểm tra tính hợp lệ của các cột và hỗ trợ file nghe Audio
 */

import { useState, useRef, useEffect } from 'react'
import {
  FileSpreadsheet,
  Download,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCcw,
} from 'lucide-react'
import type { QuizQuestionItem } from '@/services/ai.service'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast-store'
import {
  generateQuizExcelTemplate,
  parseQuizExcelBinary,
  type ColumnValidationResult,
} from './excel-quiz/excel.quiz.parser'
import { ExcelQuizAudioUploader } from './excel-quiz/excel.quiz.audio.uploader'
import { ExcelQuizPreviewList } from './excel-quiz/excel.quiz.preview.list'

interface ExcelQuizImporterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyQuestions: (
    questions: QuizQuestionItem[],
    mode?: 'append' | 'replace',
    audioUrl?: string
  ) => void
  moduleTitle: string
  testType?: string
  existingQuestionsCount?: number
  initialAudioUrl?: string
}

export function ExcelQuizImporterModal({
  isOpen,
  onClose,
  onApplyQuestions,
  moduleTitle,
  testType,
  existingQuestionsCount = 0,
  initialAudioUrl,
}: ExcelQuizImporterModalProps) {
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

  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 dark:bg-black/35 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Import Bài Test từ File Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chương: <span className="font-semibold text-slate-700 dark:text-slate-300">{moduleTitle}</span>
                {testType && ` • ${testType}`}
                {existingQuestionsCount > 0 && ` • Đang có ${existingQuestionsCount} câu hiện tại`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4.5 dark:border-emerald-800 dark:bg-emerald-950/20 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Bước 1: Tải File Mẫu Excel Chuẩn</span>
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  File mẫu gồm 8 cột quy chuẩn: STT, Câu hỏi, 4 Lựa chọn A/B/C/D, Đáp án đúng, Giải thích và File Nghe.
                </p>
              </div>
              <button
                type="button"
                onClick={generateQuizExcelTemplate}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs border border-emerald-200 hover:bg-emerald-100/60 dark:bg-slate-900 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Tải Mẫu Excel Chuẩn (.xlsx)</span>
              </button>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4.5 dark:border-slate-700 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-slate-100">
                  <Upload className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span>Bước 2: Tải Lên File Excel Cần Kiểm Tra</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hệ thống tự động quét và kiểm tra các tiêu đề cột theo quy chuẩn bài test.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onClick={(e) => {
                  ;(e.target as HTMLInputElement).value = ''
                }}
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = ''
                  fileInputRef.current?.click()
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate">{fileName ? `Đổi file (${fileName})` : 'Chọn file Excel từ máy tính'}</span>
              </button>
            </div>
          </div>

          {validationResult && (
            <div
              className={`p-4 rounded-2xl border ${
                validationResult.isValid
                  ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                  : 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800'
              } space-y-2.5`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs">
                  {validationResult.isValid ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-900 dark:text-emerald-200">
                        Kiểm tra cấu trúc cột: HỢP LỆ THEO QUY ĐỊNH
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      <span className="text-rose-900 dark:text-rose-200">
                        Kiểm tra cấu trúc cột: KHÔNG ĐÚNG QUY ĐỊNH
                      </span>
                    </>
                  )}
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    validationResult.isValid
                      ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                      : 'bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                  }`}
                >
                  {validationResult.isValid ? `${parsedQuestions.length} câu hợp lệ` : 'Cần sửa lại file'}
                </span>
              </div>

              {!validationResult.isValid && validationResult.missingColumns.length > 0 && (
                <div className="space-y-1 text-xs text-rose-800 dark:text-rose-300">
                  <p className="font-semibold">
                    Các cột bắt buộc bị thiếu trong file của bạn ({validationResult.missingColumns.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {validationResult.missingColumns.map((col) => (
                      <span
                        key={col}
                        className="px-2 py-0.5 bg-rose-200/80 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200 rounded-md font-bold text-[11px]"
                      >
                        ❌ {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <ExcelQuizAudioUploader
            audioUrl={audioUrl}
            audioFileName={audioFileName}
            isUploadingAudio={isUploadingAudio}
            audioInputRef={audioInputRef}
            onAudioUpload={handleAudioUpload}
            onRemoveAudio={() => {
              setAudioUrl(null)
              setAudioFileName(null)
            }}
            onTriggerFileInput={() => audioInputRef.current?.click()}
          />

          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <ExcelQuizPreviewList
            questions={parsedQuestions}
            onRemoveQuestion={(idx) => setParsedQuestions((prev) => prev.filter((_, i) => i !== idx))}
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950 flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          {parsedQuestions.length > 0 && (
            <div className="flex items-center gap-2.5">
              {existingQuestionsCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleApply('append')}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Thêm nối tiếp (+{parsedQuestions.length} câu)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleApply('replace')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>
                  {existingQuestionsCount > 0
                    ? `Thay thế toàn bộ (${parsedQuestions.length} câu mới)`
                    : `Áp dụng ${parsedQuestions.length} câu hỏi`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
