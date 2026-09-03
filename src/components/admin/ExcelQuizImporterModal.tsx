/**
 * @file ExcelQuizImporterModal.tsx
 * @description Modal quản trị import câu hỏi trắc nghiệm từ Excel kèm hỗ trợ upload file nghe Audio (.mp3, .wav) cho đề thi Listening
 */

import { useState, useRef } from 'react'
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
} from 'lucide-react'
import * as XLSX from 'xlsx'
import type { QuizQuestionItem } from '@/services/ai.service'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast-store'

interface ExcelQuizImporterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyQuestions: (questions: QuizQuestionItem[]) => void
  moduleTitle: string
  testType?: string
}

export function ExcelQuizImporterModal({
  isOpen,
  onClose,
  onApplyQuestions,
  moduleTitle,
  testType,
}: ExcelQuizImporterModalProps) {
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestionItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)

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
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
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

    setIsUploadingAudio(true)
    setAudioFileName(file.name)
    try {
      const res = await mediaAdminService.uploadFile(file, 'quiz-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        setAudioUrl(uploadedUrl)
        toast.success(`Tải file nghe thành công: ${file.name}`)
      } else {
        toast.error('Không nhận được đường dẫn file âm thanh từ máy chủ.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi tải file audio lên Cloudflare R2.')
    } finally {
      setIsUploadingAudio(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

        if (!data || data.length === 0) {
          setError('File Excel rỗng hoặc không đúng định dạng.')
          return
        }

        const validQuestions: QuizQuestionItem[] = []

        data.forEach((row) => {
          const questionText = String(
            row['Câu hỏi'] || row['Question'] || row['question_text'] || ''
          ).trim()

          const optA = String(row['Lựa chọn A'] || row['Option A'] || row['A'] || '').trim()
          const optB = String(row['Lựa chọn B'] || row['Option B'] || row['B'] || '').trim()
          const optC = String(row['Lựa chọn C'] || row['Option C'] || row['C'] || '').trim()
          const optD = String(row['Lựa chọn D'] || row['Option D'] || row['D'] || '').trim()

          const correctAnswerRaw = String(
            row['Đáp án đúng'] || row['Correct Answer'] || row['correct_answer'] || 'A'
          )
            .trim()
            .toUpperCase()

          const explanation = String(
            row['Giải thích'] || row['Explanation'] || row['explanation'] || ''
          ).trim()

          const rowMediaUrl = String(
            row['File Nghe (URL)'] ||
            row['File Nghe'] ||
            row['Audio'] ||
            row['media_url'] ||
            row['audio_url'] ||
            ''
          ).trim()

          if (questionText && optA && optB) {
            validQuestions.push({
              question_text: questionText,
              options: [optA, optB, optC || 'N/A', optD || 'N/A'],
              correct_answer: ['A', 'B', 'C', 'D'].includes(correctAnswerRaw) ? correctAnswerRaw : 'A',
              explanation,
              media_url: rowMediaUrl || audioUrl || undefined,
            })
          }
        })

        if (validQuestions.length === 0) {
          setError('Không tìm thấy câu hỏi hợp lệ trong file Excel. Vui lòng kiểm tra lại các cột theo file mẫu.')
        } else {
          setParsedQuestions(validQuestions)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Lỗi đọc file Excel'
        setError(msg)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleApply = () => {
    if (parsedQuestions.length === 0) return

    const finalQuestions = parsedQuestions.map((q) => ({
      ...q,
      media_url: q.media_url || audioUrl || undefined,
    }))

    onApplyQuestions(finalQuestions)
    toast.success(`Đã áp dụng thành công ${finalQuestions.length} câu hỏi vào bài test!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
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
                  File mẫu gồm các cột chuẩn: Câu hỏi, 4 Lựa chọn A/B/C/D, Đáp án đúng, Giải thích và File Nghe.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs border border-emerald-200 hover:bg-emerald-100/60 dark:bg-slate-900 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Tải Mẫu Excel (.xlsx)</span>
              </button>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4.5 dark:border-slate-700 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-slate-100">
                  <Upload className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span>Bước 2: Tải Lên File Excel Đã Soạn</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hỗ trợ định dạng .xlsx, .xls từ Microsoft Excel, Google Sheets.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate">{fileName ? `Đổi file (${fileName})` : 'Chọn file Excel từ máy tính'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Music className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    File Nghe Audio (.mp3, .wav) cho Phần Listening
                  </h4>
                  <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                    Tải lên file âm thanh bài nghe chung cho cả bài test (hoặc ghi rõ link trong file Excel).
                  </p>
                </div>
              </div>

              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleAudioUpload}
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
                    <span>{audioFileName ? `Đổi audio (${audioFileName})` : 'Upload File Nghe'}</span>
                  </>
                )}
              </button>
            </div>

            {audioUrl && (
              <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <audio controls src={audioUrl} className="w-full h-8" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAudioUrl(null)
                    setAudioFileName(null)
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  title="Xóa file audio này"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
                  Đã đọc thành công {parsedQuestions.length} câu hỏi từ file Excel:
                </h3>
              </div>

              <div className="space-y-3">
                {parsedQuestions.map((q, qIdx) => {
                  const letters = ['A', 'B', 'C', 'D']
                  const currentMedia = q.media_url || audioUrl

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
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                              {q.question_text}
                            </p>
                            {currentMedia && (
                              <div className="pt-1">
                                <audio controls src={currentMedia} className="h-7 w-full max-w-sm" />
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setParsedQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={parsedQuestions.length === 0}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Áp dụng vào bài Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
