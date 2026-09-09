// Danh sách câu hỏi trắc nghiệm được sinh bởi AI trong quản trị.
import { CheckCircle2, Copy, BookOpen, Lightbulb } from 'lucide-react'
import type { GenerateQuizItem } from '@/services/ai.service'

interface AiGeneratedQuizListProps {
  questions: GenerateQuizItem[]
  modelUsed: string
  onCopyToClipboard: (text: string) => void
}

export function AiGeneratedQuizList({
  questions,
  modelUsed,
  onCopyToClipboard,
}: AiGeneratedQuizListProps) {
  if (questions.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <span>Kết Quả Câu Hỏi Đã Sinh ({questions.length})</span>
        </h3>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Model: <span className="text-purple-400">{modelUsed}</span>
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {q.question_text}
                </h4>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyToClipboard(
                    `${q.question_text}\n${q.options
                      .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
                      .join('\n')}\nĐáp án: ${String.fromCharCode(65 + q.correct_index)}\nGiải thích: ${
                      q.explanation_vi || ''
                    }`
                  )
                }
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Sao chép câu hỏi"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {q.options.map((opt, optIdx) => {
                const isCorrect = optIdx === q.correct_index
                return (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                      isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/40'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                        isCorrect
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                    {isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>

            {q.explanation_vi && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200 inline-flex items-center gap-1 mr-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Giải thích chi tiết:</span>
                </strong>
                {q.explanation_vi}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
