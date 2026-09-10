// Modal tạo và phát thông báo in-app cho học viên toàn sàn hoặc theo đối tượng chỉ định.
import { useState, useEffect } from 'react'
import { X, Send, Megaphone, Users, Crown, Sparkles, UserCheck, AlertCircle, Link2, Tag, ShieldAlert } from 'lucide-react'
import { notificationService, type CreateNotificationPayload } from '@/features/notifications/services/notification.service'
import { toast } from '@/store/toast.store'

interface CreateNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type TargetAudience = 'ALL_USERS' | 'PREMIUM_USERS' | 'FREE_USERS' | 'SPECIFIC_USER'

export function CreateNotificationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateNotificationModalProps) {
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL_USERS')
  const [specificUserId, setSpecificUserId] = useState<string>('')
  const [category, setCategory] = useState<string>('SYSTEM')
  const [priority, setPriority] = useState<string>('NORMAL')

  const [titleVi, setTitleVi] = useState<string>('')
  const [titleEn, setTitleEn] = useState<string>('')
  const [contentVi, setContentVi] = useState<string>('')
  const [contentEn, setContentEn] = useState<string>('')
  const [actionUrl, setActionUrl] = useState<string>('')

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleVi.trim() || !contentVi.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo')
      return
    }

    if (targetAudience === 'SPECIFIC_USER' && !specificUserId.trim()) {
      toast.error('Vui lòng nhập mã học viên (User ID) người nhận')
      return
    }

    setIsSubmitting(true)
    try {
      const recipientId = targetAudience === 'SPECIFIC_USER' ? specificUserId.trim() : targetAudience

      const payload: CreateNotificationPayload = {
        recipient_id: recipientId,
        recipient_type: targetAudience === 'SPECIFIC_USER' ? 'USER' : 'BROADCAST',
        title: titleEn.trim() || titleVi.trim(),
        title_vi: titleVi.trim(),
        content: contentEn.trim() || contentVi.trim(),
        content_vi: contentVi.trim(),
        notification_category: category,
        priority,
        action_url: actionUrl.trim() || undefined,
      }

      await notificationService.createNotification(payload)
      toast.success('Đã phát thông báo thành công đến học viên!', 'Phát Thông Báo')

      setTitleVi('')
      setTitleEn('')
      setContentVi('')
      setContentEn('')
      setActionUrl('')
      setSpecificUserId('')
      setTargetAudience('ALL_USERS')

      if (onSuccess) onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi thông báo.'
      toast.error(msg, 'Lỗi gửi thông báo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Đối Tượng Học Viên Nhận Thông Báo</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetAudience('ALL_USERS')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  targetAudience === 'ALL_USERS'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Toàn bộ học viên</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('FREE_USERS')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  targetAudience === 'FREE_USERS'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Gói Miễn phí</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('PREMIUM_USERS')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  targetAudience === 'PREMIUM_USERS'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Gói VIP Premium</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('SPECIFIC_USER')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  targetAudience === 'SPECIFIC_USER'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Đích danh cá nhân</span>
              </button>
            </div>

            {targetAudience === 'SPECIFIC_USER' && (
              <div className="pt-2">
                <input
                  type="text"
                  required
                  placeholder="Nhập User ID người nhận (vd: usr_learner_001 hoặc mã ID học viên)"
                  value={specificUserId}
                  onChange={(e) => setSpecificUserId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                <span>Phân Loại Thông Báo</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SYSTEM">Hệ Thống / Nâng Cấp Bảo Trì</option>
                <option value="PROMOTION">Ưu Đãi & Khuyến Mãi Gói VIP</option>
                <option value="COURSE">Cập Nhật Khóa Học & Bài Giảng</option>
                <option value="EXAM">Ngân Hàng Đề Thi Thử TOEIC</option>
                <option value="REMINDER">Nhắc Nhở Học Tập & Chuỗi Streak</option>
                <option value="AI">Tính Năng Trí Tuệ Nhân Tạo (AI)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>Mức Độ Ưu Tiên</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NORMAL">Bình thường (Tiêu chuẩn)</option>
                <option value="HIGH">Quan trọng (Được chú ý)</option>
                <option value="URGENT">Khẩn cấp (Cảnh báo đỏ)</option>
              </select>
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
                required
                rows={3}
                placeholder="Ví dụ: LingoSphere vừa cập nhật bộ đề thi TOEIC mới nhất với giải thích đáp án thông minh từ AI. Hãy vào làm thử ngay hôm nay!"
                value={contentVi}
                onChange={(e) => setContentVi(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nội Dung Tiếng Anh (Tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="English description..."
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Đường Dẫn Điều Hướng Khi Nhấp (Action URL)</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: /courses hoặc /toeic hoặc /settings/vip"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang phát thông báo...' : 'Phát Thông Báo Ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
