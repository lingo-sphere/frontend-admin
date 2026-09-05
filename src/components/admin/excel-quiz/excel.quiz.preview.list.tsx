/**
 * @file excel.quiz.preview.list.tsx
 * @description Component hiển thị danh sách câu hỏi trắc nghiệm đã trích xuất từ Excel để xem trước
 */

import { CheckCircle2, Trash2 } from 'lucide-react'
import type { QuizQuestionItem } from '@/services/ai.service'

interface ExcelQuizPreviewListProps {
  questions: QuizQuestionItem[]
  onRemoveQuestion: (index: number) => void
}

export function ExcelQuizPreviewList({
  questions,
  onRemoveQuestion,
}: ExcelQuizPreviewListProps) {
  if (questions.length === 0) return null

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Danh sách {questions.length} câu hỏi hợp lệ:
        </h3>
      </div>

      <div className="space-y-3">
        {questions.map((q, qIdx) => (
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
                      <img
                        src={q.media_url}
                        alt={`Câu ${qIdx + 1}`}
                        className="w-full h-auto max-h-40 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveQuestion(qIdx)}
                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors shrink-0"
                title="Xóa câu này"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {q.options.map((opt, optIdx) => {
                const optLetter = letters[optIdx]
                const isCorrect = optLetter === q.correct_answer

                return (
                  <div
                    key={optIdx}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="truncate">{opt}</span>
                    {isCorrect && (
                      <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Đúng
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {q.explanation && (
              <div className="text-[11px] bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60">
                <span className="font-bold text-slate-700 dark:text-slate-300">💡 Giải thích: </span>
                <span>{q.explanation}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
