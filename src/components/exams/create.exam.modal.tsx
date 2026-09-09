// Modal tao moi bai thi.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { CustomSelect } from '@/components/common/custom.select'
import { NumberInput } from '@/components/common/number.input'
import { ConfirmModal } from '@/components/common/confirm.modal'

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
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  if (!isOpen) return null

  const handleRequestClose = () => {
    if (title.trim()) {
      setShowDiscardConfirm(true)
    } else {
      onClose()
    }
  }

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={handleRequestClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Tạo Đề Thi Mới' : 'Create New Exam'}
          </h3>
          <button
            onClick={handleRequestClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
              <NumberInput
                value={duration}
                onChange={setDuration}
                min={10}
                max={240}
                fallbackValue={60}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleRequestClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
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
                : (isVi ? 'Tiếp tục: Soạn câu hỏi đề thi ➔' : 'Continue: Compose Questions ➔')}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false)
          setTitle('')
          onClose()
        }}
        variant="warning"
        icon="warning"
        title={isVi ? 'Cảnh báo dữ liệu chưa được lưu' : 'Unsaved Changes Warning'}
        message={
          isVi
            ? 'Bạn có thông tin đề thi đang nhập dở. Bạn có chắc chắn muốn đóng và hủy không?'
            : 'You have entered exam info. Are you sure you want to discard and exit?'
        }
        confirmText={isVi ? 'Đồng ý đóng & hủy' : 'Discard & Exit'}
        cancelText={isVi ? 'Ở lại tiếp tục' : 'Stay'}
      />
    </div>
  )
}
