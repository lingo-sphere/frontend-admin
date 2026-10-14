// Modal tạo và phát thông báo in-app cho học viên toàn sàn hoặc theo đối tượng chỉ định.

import { useEffect } from 'react'
import { X, Send, Megaphone, Tag, ShieldAlert } from 'lucide-react'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import { useCreateNotificationForm } from '@/features/notifications/hooks/use.create.notification.form'
import { CreateNotificationAudienceCards } from '@/features/notifications/components/create.notification.audience.cards'
import { CreateNotificationLearnerPicker } from '@/features/notifications/components/create.notification.learner.picker'

interface CreateNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const categoryOptions: SelectOption[] = [
  { value: 'SYSTEM', label: 'Hệ Thống / Nâng Cấp Bảo Trì' },
  { value: 'PROMOTION', label: 'Ưu Đãi & Khuyến Mãi Gói VIP' },
  { value: 'COURSE', label: 'Cập Nhật Khóa Học & Bài Giảng' },
  { value: 'EXAM', label: 'Ngân Hàng Đề Thi Thử TOEIC' },
  { value: 'REMINDER', label: 'Nhắc Nhở Học Tập & Chuỗi Streak' },
  { value: 'AI', label: 'Tính Năng Trí Tuệ Nhân Tạo (AI)' },
]

const priorityOptions: SelectOption[] = [
  { value: 'NORMAL', label: 'Bình thường (Tiêu chuẩn)' },
  { value: 'HIGH', label: 'Quan trọng (Được chú ý)' },
  { value: 'URGENT', label: 'Khẩn cấp (Cảnh báo đỏ)' },
]

export function CreateNotificationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateNotificationModalProps) {
  const {
    targetAudience,
    setTargetAudience,
    selectedLearnerIds,
    isLoadingLearners,
    learnerSearchTerm,
    setLearnerSearchTerm,
    category,
    setCategory,
    priority,
    setPriority,
    titleVi,
    setTitleVi,
    titleEn,
    setTitleEn,
    contentVi,
    setContentVi,
    contentEn,
    setContentEn,
    actionUrl,
    setActionUrl,
    isSubmitting,
    filteredLearners,
    isAllFilteredSelected,
    handleToggleSelectAll,
    handleToggleSelectLearner,
    handleSubmit,
  } = useCreateNotificationForm({ isOpen, onClose, onSuccess })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tạo & Phát Thông Báo Học Viên
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gửi thông báo trực tiếp đến hộp thư và chuông thông báo trên nền tảng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <CreateNotificationAudienceCards
            targetAudience={targetAudience}
            onChange={setTargetAudience}
          />

          {targetAudience === 'SPECIFIC_USER' && (
            <CreateNotificationLearnerPicker
              filteredLearners={filteredLearners}
              selectedLearnerIds={selectedLearnerIds}
              learnerSearchTerm={learnerSearchTerm}
              isLoadingLearners={isLoadingLearners}
              isAllFilteredSelected={isAllFilteredSelected}
              onSearchChange={setLearnerSearchTerm}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectLearner={handleToggleSelectLearner}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                <span>Phân Loại Thông Báo</span>
              </label>
              <CustomSelect
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>Mức Độ Ưu Tiên</span>
              </label>
              <CustomSelect
                value={priority}
                onChange={setPriority}
                options={priorityOptions}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Tiêu Đề Thông Báo (Tiếng Việt) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 🎉 Ra mắt tính năng luyện thi TOEIC cùng Gia sư AI!"
                value={titleVi}
                onChange={(e) => setTitleVi(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Nội Dung Thông Báo (Tiếng Việt) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: LingoSphere vừa cập nhật bộ đề thi TOEIC mới nhất với giải thích đáp án thông minh từ AI. Hãy vào làm thử ngay hôm nay!"
                value={contentVi}
                onChange={(e) => setContentVi(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Tiêu Đề Tiếng Anh (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: New TOEIC AI Tutor feature is now live!"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Nội Dung Tiếng Anh (Tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="English description..."
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Đường Dẫn Điều Hướng Khi Nhấp (Action URL)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: /courses hoặc /toeic hoặc /settings/vip"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Phát Thông Báo Ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
