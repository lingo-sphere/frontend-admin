/**
 * @file ai.quiz.generator.form.tsx
 * @description Component giao diện AiQuizGeneratorForm phục vụ khu vực Quản trị Admin
 */

import { useTranslation } from 'react-i18next'
import { Brain, Sparkles } from 'lucide-react'
import { CustomSelect } from '@/components/common/custom.select'

interface AiQuizGeneratorFormProps {
  topic: string
  questionCount: number
  difficulty: string
  isGenerating: boolean
  onTopicChange: (val: string) => void
  onQuestionCountChange: (val: number) => void
  onDifficultyChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function AiQuizGeneratorForm({
  topic,
  questionCount,
  difficulty,
  isGenerating,
  onTopicChange,
  onQuestionCountChange,
  onDifficultyChange,
  onSubmit,
}: AiQuizGeneratorFormProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {isVi ? 'Tạo câu hỏi trắc nghiệm tự động (AI)' : 'Generate AI Quiz Questions'}
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {isVi
          ? 'Nhập chủ đề bất kỳ để AI tự động biên soạn câu hỏi 4 lựa chọn kèm đáp án đúng và giải thích chi tiết.'
          : 'Enter any topic for AI to automatically compose 4-choice questions with answers and detailed explanations.'}
      </p>

      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            {isVi ? 'Chủ đề / Ngữ cảnh bài tập' : 'Topic / Context'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder={isVi ? 'VD: TOEIC Part 5 Incomplete Sentences, Customer Service Email...' : 'e.g. TOEIC Part 5 Incomplete Sentences...'}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isVi ? 'Số lượng câu hỏi' : 'Number of Questions'}
            </label>
            <CustomSelect
              value={String(questionCount)}
              onChange={(val) => onQuestionCountChange(Number(val))}
              options={[
                { value: '2', label: isVi ? '2 câu hỏi' : '2 questions' },
                { value: '3', label: isVi ? '3 câu hỏi' : '3 questions', badge: isVi ? 'Khuyên dùng' : 'Recommended' },
                { value: '5', label: isVi ? '5 câu hỏi' : '5 questions' },
                { value: '10', label: isVi ? '10 câu hỏi' : '10 questions' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isVi ? 'Độ khó' : 'Target Difficulty'}
            </label>
            <CustomSelect
              value={difficulty}
              onChange={onDifficultyChange}
              options={[
                { value: 'EASY', label: isVi ? 'Cơ bản (350 - 500)' : 'Beginner (350 - 500)', badge: '350-500' },
                { value: 'MEDIUM', label: isVi ? 'Trung cấp (550 - 750)' : 'Intermediate (550 - 750)', badge: '550-750' },
                { value: 'HARD', label: isVi ? 'Nâng cao (800 - 990)' : 'Advanced (800 - 990)', badge: '800-990' },
              ]}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center gap-2 h-11 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'AI Đang Soạn Câu Hỏi...' : 'Bắt Đầu Sinh Câu Hỏi'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
