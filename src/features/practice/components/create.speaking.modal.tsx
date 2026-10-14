// Modal tao bai luyen noi.

import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { CustomSelect } from '@/components/custom.select'
import { NumberInput } from '@/components/number.input'

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
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Thêm bài tập luyện nói mới' : 'Add New Speaking Exercise'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isVi ? 'Tiêu đề bài luyện nói' : 'Speaking Exercise Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={isVi ? 'VD: Phỏng vấn công việc - Giới thiệu kinh nghiệm' : 'e.g. Job Interview - Experience Introduction'}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Dạng bài nói' : 'Speaking Format'}
              </label>
              <CustomSelect
                value={type}
                onChange={onTypeChange}
                options={[
                  { value: 'READ_ALOUD', label: isVi ? 'Đọc to văn bản' : 'Read Aloud' },
                  { value: 'DESCRIBE_PICTURE', label: isVi ? 'Mô tả hình ảnh' : 'Describe Picture' },
                  { value: 'RESPOND_QUESTIONS', label: isVi ? 'Trả lời câu hỏi tình huống' : 'Respond to Questions' },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Độ chính xác chuẩn (% đạt)
              </label>
              <NumberInput
                value={accuracy}
                onChange={onAccuracyChange}
                min={50}
                max={100}
                fallbackValue={70}
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
