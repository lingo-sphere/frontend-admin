import { useState, useRef } from 'react'
import { FileSpreadsheet, Download, Upload, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { QuizQuestionItem } from '@/services/ai.service'

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

  if (!isOpen) return null

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'STT': 1,
        'Câu hỏi': 'The CEO announced that the quarterly profits had increased by 15% due to higher _______ sales.',
        'Lựa chọn A': 'overseas',
        'Lựa chọn B': 'oversea',
        'Lựa chọn C': 'overseing',
        'Lựa chọn D': 'overseen',
        'Đáp án đúng': 'A',
        'Giải thích': 'Overseas là tính từ chỉ thị trường nước ngoài. Dịch: Giám đốc điều hành thông báo lợi nhuận quý đã tăng 15% nhờ doanh số bán hàng ở nước ngoài cao hơn.',
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
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'QuizTemplate')
    XLSX.writeFile(wb, 'LingoSphere_Quiz_Template.xlsx')
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

          if (questionText && optA && optB) {
            validQuestions.push({
              question_text: questionText,
              options: [optA, optB, optC || 'N/A', optD || 'N/A'],
              correct_answer: ['A', 'B', 'C', 'D'].includes(correctAnswerRaw) ? correctAnswerRaw : 'A',
              explanation,
            })
          }
        })

        if (validQuestions.length === 0) {
          setError('Không tìm thấy câu hỏi hợp lệ trong file Excel. Vui lòng kiểm tra lại các cột theo file mẫu.')
        } else {
          setParsedQuestions(validQuestions)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi đọc file Excel'
        setError(msg)
      }
    }

    reader.readAsBinaryString(file)
  }

  const handleApply = () => {
    if (parsedQuestions.length === 0) return
    onApplyQuestions(parsedQuestions)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-backdrop">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-modal-content">
        {}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 dark:bg-slate-950/70 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Import Bài Test từ File Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Nhập hàng loạt câu hỏi cho bài kiểm tra của{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {moduleTitle}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <span className="inline-block rounded-md bg-indigo-600/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  BƯỚC 1
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Tải File Mẫu Excel Chuẩn
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  File mẫu đã được thiết lập sẵn các cột: Câu hỏi, Lựa chọn A, B, C, D, Đáp án đúng & Lời giải thích.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4 text-emerald-500" />
                <span>Tải File Mẫu (.xlsx)</span>
              </button>
            </div>

            {}
            <div className="rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-50/60 p-4 flex flex-col justify-between space-y-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
              <div>
                <span className="inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  BƯỚC 2
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Tải Lên File Excel Đã Soạn
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Hệ thống tự động đọc và hiển thị danh sách câu hỏi để bạn kiểm tra trước khi lưu.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{fileName ? `Đổi file (${fileName})` : 'Chọn file Excel từ máy tính'}</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {}
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
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{q.question_text}</p>
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

        {}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {parsedQuestions.length > 0
              ? `Sẵn sàng nạp ${parsedQuestions.length} câu hỏi vào chương.`
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
