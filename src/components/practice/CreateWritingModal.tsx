import { X } from 'lucide-react'

interface CreateWritingModalProps {
  isOpen: boolean
  title: string
  type: string
  prompt: string
  minWords: number
  maxWords: number
  onTitleChange: (val: string) => void
  onTypeChange: (val: string) => void
  onPromptChange: (val: string) => void
  onMinWordsChange: (val: number) => void
  onMaxWordsChange: (val: number) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreateWritingModal({
  isOpen,
  title,
  type,
  prompt,
  minWords,
  maxWords,
  onTitleChange,
  onTypeChange,
  onPromptChange,
  onMinWordsChange,
  onMaxWordsChange,
  onClose,
  onSubmit,
}: CreateWritingModalProps) {
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
            Tạo Đề Luyện Viết TOEIC Writing Mới
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tiêu đề đề bài viết <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="VD: Viết Email giải trình sự cố kỹ thuật hệ thống"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dạng bài viết
              </label>
              <select
                value={type}
                onChange={(e) => onTypeChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="EMAIL_REPLY">Viết Email phản hồi</option>
                <option value="OPINION_ESSAY">Viết bài luận quan điểm</option>
                <option value="PICTURE_SENTENCE">Viết câu theo tranh</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tối thiểu (từ)
              </label>
              <input
                type="number"
                value={minWords}
                onChange={(e) => onMinWordsChange(Number(e.target.value))}
                min={10}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tối đa (từ)
              </label>
              <input
                type="number"
                value={maxWords}
                onChange={(e) => onMaxWordsChange(Number(e.target.value))}
                min={20}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Yêu cầu đề bài (Prompt) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Nhập đề bài chi tiết..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Tạo đề luyện viết
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
