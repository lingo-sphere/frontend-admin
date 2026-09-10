// Modal tạo và phát thông báo in-app cho học viên toàn sàn hoặc theo đối tượng chỉ định với bộ chọn checkbox.
import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Send,
  Megaphone,
  Users,
  Crown,
  Sparkles,
  UserCheck,
  Tag,
  ShieldAlert,
  Search,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react'
import { notificationService, type CreateNotificationPayload } from '@/features/notifications/services/notification.service'
import { userService } from '@/features/users/services/user.service'
import type { UserProfile } from '@/features/users/schemas/user.schema'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import { toast } from '@/store/toast.store'

interface CreateNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type TargetAudience = 'ALL_USERS' | 'PREMIUM_USERS' | 'FREE_USERS' | 'SPECIFIC_USER'

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
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL_USERS')
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([])
  const [learners, setLearners] = useState<UserProfile[]>([])
  const [isLoadingLearners, setIsLoadingLearners] = useState<boolean>(false)
  const [learnerSearchTerm, setLearnerSearchTerm] = useState<string>('')

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
      if (learners.length === 0) {
        loadLearners()
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const loadLearners = async () => {
    setIsLoadingLearners(true)
    try {
      const res = await userService.getAllUsers({ role: 'STUDENT', limit: 200 })
      const items: UserProfile[] = Array.isArray(res) ? res : (res?.result || [])
      setLearners(items)
    } catch {
      toast.error('Không thể tải danh sách học viên')
    } finally {
      setIsLoadingLearners(false)
    }
  }

  const filteredLearners = useMemo(() => {
    if (!learnerSearchTerm.trim()) return learners
    const query = learnerSearchTerm.toLowerCase()
    return learners.filter((u) => {
      const name = (u.full_name || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      const id = (u.user_id || u.id || '').toLowerCase()
      return name.includes(query) || email.includes(query) || id.includes(query)
    })
  }, [learners, learnerSearchTerm])

  const isAllFilteredSelected =
    filteredLearners.length > 0 &&
    filteredLearners.every((l) => selectedLearnerIds.includes(l.user_id || l.id || ''))

  const handleToggleSelectAll = () => {
    const filteredIds = filteredLearners
      .map((l) => l.user_id || l.id || '')
      .filter((id) => Boolean(id))

    if (isAllFilteredSelected) {
      setSelectedLearnerIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      setSelectedLearnerIds((prev) => Array.from(new Set([...prev, ...filteredIds])))
    }
  }

  const handleToggleSelectLearner = (uid: string) => {
    setSelectedLearnerIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleVi.trim() || !contentVi.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo')
      return
    }

    if (targetAudience === 'SPECIFIC_USER' && selectedLearnerIds.length === 0) {
      toast.error('Vui lòng tích chọn ít nhất một học viên nhận thông báo')
      return
    }

    setIsSubmitting(true)
    try {
      if (targetAudience === 'SPECIFIC_USER') {
        await Promise.all(
          selectedLearnerIds.map((userId) =>
            notificationService.createNotification({
              recipient_id: userId,
              recipient_type: 'USER',
              title: titleEn.trim() || titleVi.trim(),
              title_vi: titleVi.trim(),
              content: contentEn.trim() || contentVi.trim(),
              content_vi: contentVi.trim(),
              notification_category: category,
              priority,
              action_url: actionUrl.trim() || undefined,
            })
          )
        )
        toast.success(
          `Đã phát thông báo thành công đến ${selectedLearnerIds.length} học viên được chọn!`,
          'Phát Thông Báo'
        )
      } else {
        const payload: CreateNotificationPayload = {
          recipient_id: targetAudience,
          recipient_type: 'BROADCAST',
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
      }

      setTitleVi('')
      setTitleEn('')
      setContentVi('')
      setContentEn('')
      setActionUrl('')
      setSelectedLearnerIds([])
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
    >
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
              <div className="pt-3 space-y-3 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>
                        {isAllFilteredSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${filteredLearners.length})`}
                      </span>
                    </button>
                  </div>

                  {selectedLearnerIds.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Đã chọn: {selectedLearnerIds.length} học viên
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học viên, email hoặc User ID..."
                    value={learnerSearchTerm}
                    onChange={(e) => setLearnerSearchTerm(e.target.value)}
                    className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoadingLearners ? (
                    <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Đang tải danh sách học viên...</span>
                    </div>
                  ) : filteredLearners.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Không tìm thấy học viên nào phù hợp
                    </div>
                  ) : (
                    filteredLearners.map((learner) => {
                      const uid = learner.user_id || learner.id || ''
                      const isSelected = selectedLearnerIds.includes(uid)
                      return (
                        <div
                          key={uid}
                          onClick={() => handleToggleSelectLearner(uid)}
                          className={`w-full p-2.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectLearner(uid)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                            />
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                              {learner.avatar_url ? (
                                <img
                                  src={learner.avatar_url}
                                  alt={learner.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (learner.full_name || 'U').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {learner.full_name}
                                </p>
                                {learner.is_premium && (
                                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {learner.email}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {uid}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

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
