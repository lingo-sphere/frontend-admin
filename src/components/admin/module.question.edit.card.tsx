/**
 * @file module.question.edit.card.tsx
 * @description Form chỉnh sửa câu hỏi trắc nghiệm, các lựa chọn, audio và giải thích đáp án
 */

import { Edit3, Trash2, Upload, Loader2 } from 'lucide-react'
import type { QuizQuestionItem } from '@/services/ai.service'

interface ModuleQuestionEditCardProps {
  question: QuizQuestionItem
  qIdx: number
  letters: string[]
  uploadingAudioIdx: number | null
  onCloseEdit: () => void
  onDelete: () => void
  onQuestionTextChange: (text: string) => void
  onOptionChange: (optIdx: number, val: string) => void
  onSelectCorrectAnswer: (letter: string) => void
  onMediaUrlChange: (url: string) => void
  onRequestAudioUpload: () => void
  onExplanationChange: (text: string) => void
}

export function ModuleQuestionEditCard({
  question,
  qIdx,
  letters,
  uploadingAudioIdx,
  onCloseEdit,
  onDelete,
  onQuestionTextChange,
  onOptionChange,
  onSelectCorrectAnswer,
  onMediaUrlChange,
  onRequestAudioUpload,
  onExplanationChange,
}: ModuleQuestionEditCardProps) {
  return (
    <div className="rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white p-4 space-y-3 shadow-xs dark:bg-slate-950 ring-1 ring-indigo-500/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {qIdx + 1}
          </span>
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => onQuestionTextChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="Nhập nội dung câu hỏi..."
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCloseEdit}
            className="rounded-lg p-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 cursor-pointer transition-colors"
            title="Đóng chỉnh sửa"
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
              <input
                type="text"
                value={opt}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onOptionChange(optIdx, e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                placeholder={`Lựa chọn ${letter}...`}
              />
            </div>
          )
        })}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
          Link file nghe Audio (URL):
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={question.media_url || ''}
            onChange={(e) => onMediaUrlChange(e.target.value)}
            placeholder="https://... hoặc tải file âm thanh lên (để trống nếu là câu Đọc)"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={onRequestAudioUpload}
            disabled={uploadingAudioIdx === qIdx}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            title="Tải file audio từ máy"
          >
            {uploadingAudioIdx === qIdx ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <span>Upload file</span>
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
          Lời giải thích chi tiết:
        </label>
        <input
          type="text"
          value={question.explanation || ''}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder="Nhập giải thích vì sao đáp án đúng..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>
    </div>
  )
}
