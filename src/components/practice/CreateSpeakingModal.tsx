import { X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface CreateSpeakingModalProps {
  isOpen: boolean
  title: string
  type: string
  sentence: string
  accuracy: number
  onTitleChange: (val: string) => void
  onTypeChange: (val: string) => void
  onSentenceChange: (val: string) => void
  onAccuracyChange: (val: number) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreateSpeakingModal({
  isOpen,
  title,
  type,
  sentence,
  accuracy,
  onTitleChange,
  onTypeChange,
  onSentenceChange,
  onAccuracyChange,
  onClose,
  onSubmit,
}: CreateSpeakingModalProps) {
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
            Tạo Bài Luyện Nói & Phát Âm Mới
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tiêu đề bài luyện nói <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="VD: Phỏng vấn công việc - Giới thiệu kinh nghiệm làm việc"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dạng bài nói
              </label>
              <CustomSelect
                value={type}
                onChange={onTypeChange}
                options={[
                  { value: 'READ_ALOUD', label: 'Đọc to văn bản (Read Aloud)' },
                  { value: 'DESCRIBE_PICTURE', label: 'Mô tả hình ảnh' },
                  { value: 'RESPOND_QUESTIONS', label: 'Trả lời câu hỏi tình huống' },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Độ chính xác chuẩn (% đạt)
              </label>
              <input
                type="number"
                value={accuracy}
                onChange={(e) => onAccuracyChange(Number(e.target.value))}
                min={50}
                max={100}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Câu mẫu / Đoạn văn cần phát âm <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={sentence}
              onChange={(e) => onSentenceChange(e.target.value)}
              placeholder="Nhập câu tiếng Anh học viên cần đọc to..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Tạo bài luyện nói
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
