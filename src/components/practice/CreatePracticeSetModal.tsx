import { X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface CreatePracticeSetModalProps {
  isOpen: boolean
  title: string
  description: string
  category: string
  difficulty: string
  totalQuestions: number
  duration: number
  onTitleChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onCategoryChange: (val: string) => void
  onDifficultyChange: (val: string) => void
  onTotalQuestionsChange: (val: number) => void
  onDurationChange: (val: number) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreatePracticeSetModal({
  isOpen,
  title,
  description,
  category,
  difficulty,
  totalQuestions,
  duration,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onDifficultyChange,
  onTotalQuestionsChange,
  onDurationChange,
  onClose,
  onSubmit,
}: CreatePracticeSetModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Tạo Bộ Bài Tập Luyện Thi Mới
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tiêu đề bộ bài tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="VD: Chuyên đề Mệnh đề quan hệ & Đại từ quan hệ"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Phân loại
              </label>
              <CustomSelect
                value={category}
                onChange={onCategoryChange}
                options={[
                  { value: 'GRAMMAR', label: 'Ngữ pháp (Grammar)' },
                  { value: 'VOCABULARY', label: 'Từ vựng (Vocabulary)' },
                  { value: 'TOEIC_READING', label: 'TOEIC Reading (Part 5-7)' },
                  { value: 'MINI_TEST', label: 'Mini Practice Test' },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Độ khó
              </label>
              <CustomSelect
                value={difficulty}
                onChange={onDifficultyChange}
                options={[
                  { value: 'BEGINNER', label: 'Cơ bản (350 - 500)', badge: '350-500' },
                  { value: 'INTERMEDIATE', label: 'Trung cấp (550 - 750)', badge: '550-750' },
                  { value: 'ADVANCED', label: 'Nâng cao (800+)', badge: '800+' },
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Số câu hỏi
              </label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => onTotalQuestionsChange(Number(e.target.value))}
                min={5}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => onDurationChange(Number(e.target.value))}
                min={5}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Mô tả nội dung trọng tâm và kỹ năng cần rèn luyện..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Tạo bộ bài tập
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
