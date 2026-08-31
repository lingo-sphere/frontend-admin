import { Brain, Sparkles } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

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
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Công Cụ Sinh Câu Hỏi Trắc Nghiệm Tự Động (AI Quiz Generator)
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Nhập chủ đề bất kỳ để AI tự động biên soạn câu hỏi 4 lựa chọn (A, B, C, D) kèm đáp án đúng và giải thích sư phạm chi tiết bằng tiếng Việt.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Chủ đề / Ngữ cảnh bài tập <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="VD: TOEIC Part 5 Incomplete Sentences, Customer Service Email..."
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Số lượng câu hỏi
            </label>
            <CustomSelect
              value={String(questionCount)}
              onChange={(val) => onQuestionCountChange(Number(val))}
              options={[
                { value: '2', label: '2 câu hỏi' },
                { value: '3', label: '3 câu hỏi (Khuyến nghị)', badge: 'Recommended' },
                { value: '5', label: '5 câu hỏi' },
                { value: '10', label: '10 câu hỏi' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Độ khó (Target Level)
            </label>
            <CustomSelect
              value={difficulty}
              onChange={onDifficultyChange}
              options={[
                { value: 'EASY', label: 'Cơ bản (TOEIC 350 - 500)', badge: '350-500' },
                { value: 'MEDIUM', label: 'Trung cấp (TOEIC 550 - 750)', badge: '550-750' },
                { value: 'HARD', label: 'Nâng cao (TOEIC 800 - 990)', badge: '800-990' },
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
