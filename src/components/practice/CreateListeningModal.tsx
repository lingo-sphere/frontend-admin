import { X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface CreateListeningModalProps {
  isOpen: boolean
  title: string
  type: string
  audioUrl: string
  totalQuestions: number
  onTitleChange: (val: string) => void
  onTypeChange: (val: string) => void
  onAudioUrlChange: (val: string) => void
  onTotalQuestionsChange: (val: number) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreateListeningModal({
  isOpen,
  title,
  type,
  audioUrl,
  totalQuestions,
  onTitleChange,
  onTypeChange,
  onAudioUrlChange,
  onTotalQuestionsChange,
  onClose,
  onSubmit,
}: CreateListeningModalProps) {
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
            Tạo Bài Luyện Nghe TOEIC Mới
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tiêu đề bài luyện nghe <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="VD: Part 3 - Hội thoại kinh doanh tại sân bay"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dạng bài nghe
              </label>
              <CustomSelect
                value={type}
                onChange={onTypeChange}
                options={[
                  { value: 'PHOTO_DESCRIPTION', label: 'Part 1 - Mô tả tranh' },
                  { value: 'QUESTION_RESPONSE', label: 'Part 2 - Hỏi & Đáp' },
                  { value: 'SHORT_CONVERSATION', label: 'Part 3 - Đoạn hội thoại' },
                  { value: 'SHORT_TALK', label: 'Part 4 - Bài nói ngắn' },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Số câu hỏi
              </label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => onTotalQuestionsChange(Number(e.target.value))}
                min={1}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Đường dẫn Audio Cloudflare R2 URL
            </label>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => onAudioUrlChange(e.target.value)}
              placeholder="https://r2.../listening_part3_test01.mp3"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
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
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Tạo bài luyện nghe
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
