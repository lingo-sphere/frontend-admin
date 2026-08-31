import { useState } from 'react'
import { Sparkles, X, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, Edit3 } from 'lucide-react'
import { aiService, type QuizQuestionItem } from '@/services/ai.service'
import { CustomSelect, type SelectOption } from '@/components/common/CustomSelect'

interface AiQuizGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyQuestions: (questions: QuizQuestionItem[]) => void
  moduleTitle: string
  moduleDescription?: string
  testType?: 'CHALLENGE' | 'POST_MINI' | 'CHAPTER_TEST'
}

const COUNT_OPTIONS: SelectOption[] = [
  { value: '5', label: '5 câu hỏi (Ngắn gọn)' },
  { value: '10', label: '10 câu hỏi (Tiêu chuẩn)' },
  { value: '15', label: '15 câu hỏi (Chuyên sâu)' },
  { value: '20', label: '20 câu hỏi (Đầy đủ)' },
]

const LEVEL_OPTIONS: SelectOption[] = [
  { value: 'A2-B1 (TOEIC 450-600)', label: 'Cơ bản (TOEIC 450 - 600)' },
  { value: 'B1-B2 (TOEIC 650-800)', label: 'Trung cấp (TOEIC 650 - 800)' },
  { value: 'B2-C1 (TOEIC 800-990)', label: 'Nâng cao (TOEIC 800 - 990)' },
]

export function AiQuizGeneratorModal({
  isOpen,
  onClose,
  onApplyQuestions,
  moduleTitle,
  moduleDescription,
  testType = 'CHAPTER_TEST',
}: AiQuizGeneratorModalProps) {
  const [topic, setTopic] = useState<string>(
    `Chương: ${moduleTitle}. ${moduleDescription ? `Nội dung: ${moduleDescription}` : 'Ngữ pháp và từ vựng trọng tâm của chương.'}`
  )
  const [questionCount, setQuestionCount] = useState<string>('10')
  const [level, setLevel] = useState<string>('B1-B2 (TOEIC 650-800)')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestionItem[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập nội dung hoặc chủ đề chương học.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await aiService.generateQuizForTeacher({
        content_or_topic: `${topic}\nKiểm tra đánh giá toàn bộ kiến thức của chương học`,
        question_count: parseInt(questionCount, 10),
        cefr_level: level,
      })

      const questions = res.items || []
      if (questions.length === 0) {
        setError('Không thể sinh câu hỏi. Vui lòng thử lại với chủ đề chi tiết hơn.')
      } else {
        setGeneratedQuestions(questions)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi gọi AI'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    if (generatedQuestions.length === 0) return
    onApplyQuestions(generatedQuestions)
    onClose()
  }

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setGeneratedQuestions((prev) => {
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
    setGeneratedQuestions((prev) => {
      const updated = [...prev]
      updated[qIdx] = { ...updated[qIdx], correct_answer: letter }
      return updated
    })
  }

  const handleDeleteQuestion = (qIdx: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== qIdx))
  }

  const handleAddBlankQuestion = () => {
    setGeneratedQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 'A',
        explanation: '',
      },
    ])
    setEditingIndex(generatedQuestions.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-backdrop">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 dark:bg-slate-950/70 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 ring-1 ring-violet-500/30">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Sinh Đề Thi Tự Động (AI Quiz Generator)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Tự động tạo câu hỏi trắc nghiệm đánh giá kiến thức cho{' '}
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  {moduleTitle}
                </span>{' '}
                bằng Groq LPU & Gemini Flash
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="rounded-2xl border border-violet-200/80 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/20 p-5 space-y-4 shadow-xs">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-900 dark:text-slate-100">
                Chủ đề / Nội dung bài giảng cần kiểm tra:
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                placeholder="Nhập nội dung chính hoặc danh sách bài học của chương..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-900 dark:text-slate-100">
                  Số lượng câu hỏi:
                </label>
                <CustomSelect
                  options={COUNT_OPTIONS}
                  value={questionCount}
                  onChange={(val) => setQuestionCount(val)}
                  placeholder="Chọn số câu hỏi"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-900 dark:text-slate-100">
                  Cấp độ mục tiêu (CEFR / TOEIC):
                </label>
                <CustomSelect
                  options={LEVEL_OPTIONS}
                  value={level}
                  onChange={(val) => setLevel(val)}
                  placeholder="Chọn cấp độ"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI đang phân tích & sinh đề (0.5s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Sinh {questionCount} câu hỏi ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Questions Preview Section */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Danh sách câu hỏi đã sinh ({generatedQuestions.length} câu)
                </h3>
                <button
                  type="button"
                  onClick={handleAddBlankQuestion}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm câu hỏi mới
                </button>
              </div>

              <div className="space-y-3">
                {generatedQuestions.map((q, qIdx) => {
                  const isEditing = editingIndex === qIdx
                  const letters = ['A', 'B', 'C', 'D']

                  return (
                    <div
                      key={qIdx}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-xs font-bold text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                            {qIdx + 1}
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={q.question_text}
                              onChange={(e) => {
                                const updated = [...generatedQuestions]
                                updated[qIdx].question_text = e.target.value
                                setGeneratedQuestions(updated)
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />
                          ) : (
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                              {q.question_text}
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

                      {/* Options Grid */}
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
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850'
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

                              {isEditing ? (
                                <input
                                  type="text"
                                  value={opt}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                                />
                              ) : (
                                <span className="flex-1 truncate">{opt}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="rounded-xl bg-slate-100/80 p-2.5 text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold text-violet-600 dark:text-violet-400">💡 Giải thích: </span>
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

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {generatedQuestions.length > 0
              ? `Đã sẵn sàng ${generatedQuestions.length} câu hỏi để áp dụng vào bài test.`
              : 'Hãy nhập chủ đề và bấm nút Sinh câu hỏi để bắt đầu.'}
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
              disabled={generatedQuestions.length === 0}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
