/**
 * @file module.question.view.card.tsx
 * @description Thẻ hiển thị câu hỏi trắc nghiệm ở chế độ xem (View Mode)
 */

import { Edit3, Trash2, Volume2, Upload, Loader2 } from 'lucide-react'
import type { QuizQuestionItem } from '@/services/ai.service'

interface ModuleQuestionViewCardProps {
  question: QuizQuestionItem
  qIdx: number
  letters: string[]
  uploadingAudioIdx: number | null
  onEdit: () => void
  onDelete: () => void
  onSelectCorrectAnswer: (letter: string) => void
  onRequestAudioUpload: () => void
  onRemoveAudio: () => void
}

export function ModuleQuestionViewCard({
  question,
  qIdx,
  letters,
  uploadingAudioIdx,
  onEdit,
  onDelete,
  onSelectCorrectAnswer,
  onRequestAudioUpload,
  onRemoveAudio,
}: ModuleQuestionViewCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {qIdx + 1}
          </span>
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
            {question.question_text || '(Chưa nhập nội dung câu hỏi)'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer transition-colors"
            title="Chỉnh sửa câu"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
            title="Xóa câu"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {question.options.map((opt, optIdx) => {
          const letter = letters[optIdx]
          const isCorrect = question.correct_answer === letter

          return (
            <div
              key={optIdx}
              onClick={() => onSelectCorrectAnswer(letter)}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs transition-all cursor-pointer ${
                isCorrect
                  ? 'border-emerald-500/60 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-bold ring-1 ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                  isCorrect
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {letter}
              </span>
              <span className="flex-1 truncate">{opt || `(Trống)`}</span>
            </div>
          )
        })}
      </div>

      {question.media_url ? (
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Volume2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <audio controls src={question.media_url} className="h-8 w-full max-w-sm" />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onRequestAudioUpload}
              disabled={uploadingAudioIdx === qIdx}
              className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-100/60 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
              title="Đổi file nghe cho câu này"
            >
              {uploadingAudioIdx === qIdx ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              <span>Đổi audio</span>
            </button>
            <button
              type="button"
              onClick={onRemoveAudio}
              className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
              title="Gỡ file nghe khỏi câu này"
            >
              Gỡ audio
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <Volume2 className="h-3 w-3 opacity-50" />
            <span>(Không có file nghe)</span>
          </span>
          <button
            type="button"
            onClick={onRequestAudioUpload}
            disabled={uploadingAudioIdx === qIdx}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            <Upload className="h-3 w-3" />
            <span>+ Thêm file nghe cho câu này</span>
          </button>
        </div>
      )}

      {question.explanation && (
        <div className="rounded-xl bg-slate-100/80 p-2.5 text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">💡 Giải thích: </span>
          {question.explanation}
        </div>
      )}
    </div>
  )
}
