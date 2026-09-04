/**
 * @file ExcelQuizImporterModal.tsx
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
  Trash2,
  Music,
  Volume2,
  Loader2,
  PlusCircle,
  RefreshCcw,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import type { QuizQuestionItem } from '@/services/ai.service'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast-store'

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

interface ColumnValidationResult {
  isValid: boolean
  missingColumns: string[]
  foundHeaders: string[]
  totalRows: number
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
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

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'STT': 1,
        'Câu hỏi': 'Where is the conversation most likely taking place?',
        'Lựa chọn A': 'At a train station',
        'Lựa chọn B': 'In an airport terminal',
        'Lựa chọn C': 'Inside a hotel lobby',
        'Lựa chọn D': 'At a grocery store',
        'Đáp án đúng': 'B',
        'Giải thích': 'Người phụ nữ nhắc đến chuyến bay số 402 và cửa khởi hành, cho thấy địa điểm là sân bay.',
        'File Nghe (URL)': '',
      },
      {
        'STT': 2,
        'Câu hỏi': 'Ms. Henderson will be responsible for _______ the new training program for interns.',
        'Lựa chọn A': 'organize',
        'Lựa chọn B': 'organizing',
        'Lựa chọn C': 'organized',
        'Lựa chọn D': 'organization',
        'Đáp án đúng': 'B',
        'Giải thích': 'Sau giới từ for cần một danh động từ (V-ing), chọn organizing.',
        'File Nghe (URL)': '',
      },
      {
        'STT': 3,
        'Câu hỏi': 'All employees must submit their travel expense reports _______ Friday afternoon.',
        'Lựa chọn A': 'by',
        'Lựa chọn B': 'until',
        'Lựa chọn C': 'in',
        'Lựa chọn D': 'at',
        'Đáp án đúng': 'A',
        'Giải thích': 'By dùng để chỉ hạn chót (trước hoặc muộn nhất vào thời điểm nào).',
        'File Nghe (URL)': '',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    ws['!cols'] = [
      { wch: 6 },
      { wch: 50 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
      { wch: 50 },
      { wch: 30 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'QuizTemplate')
    XLSX.writeFile(wb, 'LingoSphere_Quiz_Template.xlsx')
  }

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
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]

        const rawRows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
        if (!rawRows || rawRows.length < 2) {
          setError('File Excel không có dữ liệu câu hỏi hoặc chỉ có dòng tiêu đề.')
          return
        }

        const rawHeaders = (rawRows[0] || []).map((h) => String(h || '').trim())
        const cleanHeaderMap: Record<string, string> = {}

        rawHeaders.forEach((origHeader) => {
          const norm = normalizeKey(origHeader)
          if (norm) cleanHeaderMap[norm] = origHeader
        })

        const findHeader = (candidates: string[]): string | null => {
          for (const cand of candidates) {
            const normCand = normalizeKey(cand)
            if (cleanHeaderMap[normCand]) {
              return cleanHeaderMap[normCand]
            }
          }
          return null
        }

        const questionCol = findHeader(['Câu hỏi', 'cau hoi', 'question', 'question_text', 'nội dung', 'noi dung'])
        const optACol = findHeader(['Lựa chọn A', 'lua chon a', 'đáp án a', 'dap an a', 'option a', 'opt a', 'a'])
        const optBCol = findHeader(['Lựa chọn B', 'lua chon b', 'đáp án b', 'dap an b', 'option b', 'opt b', 'b'])
        const optCCol = findHeader(['Lựa chọn C', 'lua chon c', 'đáp án c', 'dap an c', 'option c', 'opt c', 'c'])
        const optDCol = findHeader(['Lựa chọn D', 'lua chon d', 'đáp án d', 'dap an d', 'option d', 'opt d', 'd'])
        const answerCol = findHeader(['Đáp án đúng', 'dap an dung', 'đáp án', 'dap an', 'correct', 'correct answer', 'correct_answer', 'key', 'kết quả', 'ket qua'])
        const explanationCol = findHeader(['Giải thích', 'giai thich', 'explanation', 'ghi chú', 'ghi chu', 'lý do', 'ly do'])
        const audioCol = findHeader(['File Nghe (URL)', 'File Nghe', 'file nghe', 'audio', 'audio_url', 'media_url', 'nghe', 'sound'])

        const missingCols: string[] = []
        if (!questionCol) missingCols.push('Câu hỏi')
        if (!optACol) missingCols.push('Lựa chọn A')
        if (!optBCol) missingCols.push('Lựa chọn B')
        if (!optCCol) missingCols.push('Lựa chọn C')
        if (!optDCol) missingCols.push('Lựa chọn D')
        if (!answerCol) missingCols.push('Đáp án đúng')

        if (missingCols.length > 0) {
          setValidationResult({
            isValid: false,
            missingColumns: missingCols,
            foundHeaders: rawHeaders.filter(Boolean),
            totalRows: rawRows.length - 1,
          })
          setError(`File Excel thiếu ${missingCols.length} cột bắt buộc: ${missingCols.join(', ')}. Vui lòng kiểm tra lại cấu trúc theo file mẫu.`)
          setParsedQuestions([])
          return
        }

        const dataObjects = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
        const validQuestions: QuizQuestionItem[] = []

        dataObjects.forEach((row) => {
          const questionText = String(questionCol ? row[questionCol] || '' : '').trim()
          const optA = String(optACol ? row[optACol] || '' : '').trim()
          const optB = String(optBCol ? row[optBCol] || '' : '').trim()
          const optC = String(optCCol ? row[optCCol] || '' : '').trim()
          const optD = String(optDCol ? row[optDCol] || '' : '').trim()

          const correctAnswerRaw = String(answerCol ? row[answerCol] || '' : 'A')
            .trim()
            .toUpperCase()
            .replace(/[^ABCD]/g, '')

          const explanation = String(explanationCol ? row[explanationCol] || '' : '').trim()
          const rowMediaUrl = String(audioCol ? row[audioCol] || '' : '').trim()

          if (questionText && optA && optB) {
            validQuestions.push({
              question_text: questionText,
              options: [optA, optB, optC || 'N/A', optD || 'N/A'],
              correct_answer: ['A', 'B', 'C', 'D'].includes(correctAnswerRaw) ? correctAnswerRaw : 'A',
              explanation,
              media_url: rowMediaUrl || undefined,
            })
          }
        })

        if (validQuestions.length === 0) {
          setError('Không trích xuất được câu hỏi hợp lệ nào từ file. Đảm bảo các hàng đều có nội dung câu hỏi và các phương án lựa chọn.')
          setValidationResult({
            isValid: false,
            missingColumns: [],
            foundHeaders: rawHeaders.filter(Boolean),
            totalRows: dataObjects.length,
          })
          setParsedQuestions([])
        } else {
          setValidationResult({
            isValid: true,
            missingColumns: [],
            foundHeaders: rawHeaders.filter(Boolean),
            totalRows: dataObjects.length,
          })
          setParsedQuestions(validQuestions)
          toast.success(`Nhận diện thành công ${validQuestions.length} câu hỏi hợp lệ!`)
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
                onClick={handleDownloadTemplate}
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
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 pt-1">
                    👉 Vui lòng mở file Excel và đặt đúng tên các cột: <strong>Câu hỏi</strong>, <strong>Lựa chọn A</strong>, <strong>Lựa chọn B</strong>, <strong>Lựa chọn C</strong>, <strong>Lựa chọn D</strong>, <strong>Đáp án đúng</strong> (hoặc tải file mẫu chuẩn ở Bước 1).
                  </p>
                </div>
              )}

              {validationResult.foundHeaders.length > 0 && (
                <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="font-medium">Các cột nhận diện trong file: </span>
                  <span className="italic">{validationResult.foundHeaders.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Music className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    File Nghe Audio (.mp3, .wav) cho Bộ Đề Này
                  </h4>
                  <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                    File âm thanh bài nghe được gắn trực tiếp vào toàn bộ đề này (phát chung cho bài test).
                  </p>
                </div>
              </div>

              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleAudioUpload}
                onClick={(e) => {
                  ;(e.target as HTMLInputElement).value = ''
                }}
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploadingAudio}
                onClick={() => audioInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploadingAudio ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang upload...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{audioFileName || audioUrl ? (audioFileName ? `Đổi audio (${audioFileName})` : 'Đổi file audio') : 'Upload File Nghe'}</span>
                  </>
                )}
              </button>
            </div>

            {audioUrl && (
              <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <audio controls src={audioUrl} className="w-full h-8" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioUrl(null)
                      setAudioFileName(null)
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Xóa file audio khỏi bộ đề"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                  ✓ File nghe được gắn vào toàn bộ đề này (không gắn lặp lại từng câu hỏi).
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsedQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Danh sách {parsedQuestions.length} câu hỏi hợp lệ:
                </h3>
              </div>

              <div className="space-y-3">
                {parsedQuestions.map((q, qIdx) => {
                  const letters = ['A', 'B', 'C', 'D']

                  return (
                    <div
                      key={qIdx}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {qIdx + 1}
                          </span>
                          <div className="flex-1 space-y-1.5">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                              {q.question_text}
                            </p>
                            {q.media_url && !q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) && (
                              <div className="mt-1 max-w-xs rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                                <img src={q.media_url} alt={`Câu ${qIdx + 1}`} className="w-full h-auto max-h-40 object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setParsedQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors shrink-0"
                          title="Xóa câu này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((opt, optIdx) => {
                          const letter = letters[optIdx]
                          const isCorrect = q.correct_answer === letter

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs ${
                                isCorrect
                                  ? 'border-emerald-500/60 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-bold ring-1 ring-emerald-500/30'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                                  isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                          )
                        })}
                      </div>

                      {q.explanation && (
                        <div className="rounded-xl bg-slate-100/80 p-2.5 text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">💡 Giải thích: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {parsedQuestions.length > 0
              ? `Sẵn sàng nạp ${parsedQuestions.length} câu hỏi vào chương.${audioUrl ? ' (Kèm file Audio nghe)' : ''}`
              : 'Tải file Excel lên để tiếp tục.'}
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            {existingQuestionsCount > 0 && parsedQuestions.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => handleApply('append')}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer"
                  title="Thêm nối tiếp vào danh sách câu hỏi đang có"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Thêm vào danh sách (+{parsedQuestions.length} câu)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApply('replace')}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition-all cursor-pointer"
                  title="Ghi đè và thay thế toàn bộ câu hỏi cũ"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  <span>Ghi đè ({parsedQuestions.length} câu)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleApply('replace')}
                disabled={parsedQuestions.length === 0}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Thêm {parsedQuestions.length} câu hỏi vào bài Test</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
