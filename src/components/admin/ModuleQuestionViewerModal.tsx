/**
 * @file ModuleQuestionViewerModal.tsx
 * @description Component giao diện ModuleQuestionViewerModal phục vụ khu vực Quản trị Admin
 */

import { useState } from 'react'
import { CheckCircle2, Trash2, Edit3, Plus, X, Award } from 'lucide-react'
import type { QuizQuestionItem } from '@/services/ai.service'

interface ModuleQuestionViewerModalProps {
  isOpen: boolean
  onClose: () => void
  questions: QuizQuestionItem[]
  onSaveQuestions: (updated: QuizQuestionItem[]) => void
  moduleTitle: string
  testTitle: string
}

export function ModuleQuestionViewerModal({
  isOpen,
  onClose,
  questions,
  onSaveQuestions,
  moduleTitle,
  testTitle,
}: ModuleQuestionViewerModalProps) {
  const [items, setItems] = useState<QuizQuestionItem[]>(questions)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setItems((prev) => {
      const updated = [...prev]
      const current = { ...updated[qIdx] }
      const newOpts = [...current.options]
      newOpts[optIdx] = val
      current.options = newOpts
      updated[qIdx] = current
      return updated
    })
  }

  const handleCorrectAnswerChange = (qIdx: number, letter: string) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[qIdx] = { ...updated[qIdx], correct_answer: letter }
      return updated
    })
  }

  const handleDeleteQuestion = (qIdx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== qIdx))
  }

  const handleAddBlankQuestion = () => {
    setItems((prev) => [
      ...prev,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 'A',
        explanation: '',
      },
    ])
    setEditingIndex(items.length)
  }

  const handleSave = () => {
    onSaveQuestions(items)
    onClose()
  }

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-backdrop">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-modal-content">
        {}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 dark:bg-slate-950/70 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {testTitle} ({items.length} câu hỏi)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{moduleTitle}</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Bạn có thể chỉnh sửa đề bài, click chọn phương án đúng hoặc bấm nút để thêm câu hỏi mới.
            </p>
            <button
              type="button"
              onClick={handleAddBlankQuestion}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer border border-indigo-200/50 dark:border-indigo-800/50 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm câu hỏi
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 py-12 text-center space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
              <p className="text-xs text-slate-500">Chưa có câu hỏi nào trong bài test này.</p>
              <button
                type="button"
                onClick={handleAddBlankQuestion}
                className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                + Thêm câu hỏi đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((q, qIdx) => {
                const isEditing = editingIndex === qIdx

                return (
                  <div
                    key={qIdx}
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {qIdx + 1}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={q.question_text}
                            onChange={(e) => {
                              const updated = [...items]
                              updated[qIdx].question_text = e.target.value
                              setItems(updated)
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            placeholder="Nhập nội dung câu hỏi..."
                          />
                        ) : (
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                            {q.question_text || '(Chưa nhập nội dung câu hỏi)'}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(isEditing ? null : qIdx)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer transition-colors"
                          title="Chỉnh sửa câu"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          title="Xóa câu"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options.map((opt, optIdx) => {
                        const letter = letters[optIdx]
                        const isCorrect = q.correct_answer === letter

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleCorrectAnswerChange(qIdx, letter)}
                            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs transition-all cursor-pointer ${
                              isCorrect
                                ? 'border-emerald-500/60 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-bold ring-1 ring-emerald-500/30'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                                isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {letter}
                            </span>

                            {isEditing ? (
                              <input
                                type="text"
                                value={opt}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                                placeholder={`Lựa chọn ${letter}...`}
                              />
                            ) : (
                              <span className="flex-1 truncate">{opt || `(Trống)`}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {}
                    {isEditing ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          Lời giải thích chi tiết:
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const updated = [...items]
                            updated[qIdx].explanation = e.target.value
                            setItems(updated)
                          }}
                          placeholder="Nhập giải thích vì sao đáp án đúng..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                    ) : (
                      q.explanation && (
                        <div className="rounded-xl bg-slate-100/80 p-2.5 text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">💡 Giải thích: </span>
                          {q.explanation}
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Tổng cộng: <strong className="text-slate-900 dark:text-white">{items.length}</strong> câu hỏi.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Lưu danh sách câu hỏi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
