import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface CreateExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, type: string, duration: number) => Promise<void>
}

export function CreateExamModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateExamModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [title, setTitle] = useState('')
  const [type, setType] = useState('FULL_TEST')
  const [duration, setDuration] = useState(120)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit(title, type, duration)
      setTitle('')
      setType('FULL_TEST')
      setDuration(120)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Tạo Đề Thi Mới' : 'Create New Exam'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isVi ? 'Tên đề thi' : 'Exam Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isVi ? 'VD: ETS TOEIC 2024 - Test 02' : 'e.g. ETS TOEIC 2024 - Test 02'}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Loại đề thi' : 'Exam Type'}
              </label>
              <CustomSelect
                value={type}
                onChange={setType}
                options={[
                  { value: 'FULL_TEST', label: isVi ? 'Đề thi đầy đủ (200 câu)' : 'Full Test (200 questions)', badge: isVi ? '200 câu' : '200Q' },
                  { value: 'MINI_TEST', label: isVi ? 'Đề thi rút gọn' : 'Mini Test' },
                  { value: 'PRE_TEST', label: isVi ? 'Đề kiểm tra đầu vào' : 'Pre-Test' },
                  { value: 'POST_MINI_TEST', label: isVi ? 'Đề kiểm tra sau khóa' : 'Post-Mini Test' },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Thời lượng (phút)' : 'Duration (mins)'}
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={10}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {isSubmitting
                ? (isVi ? 'Đang tạo...' : 'Creating...')
                : (isVi ? 'Tạo Đề Thi' : 'Create Exam')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
