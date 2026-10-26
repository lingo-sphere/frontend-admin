// Modal nhắc nhở học tập dành cho học viên trong quản trị.

import { useState, useEffect } from 'react'
import { Bell, Send, X, Smartphone, Sparkles, Flame, Target, BookOpen } from 'lucide-react'
import type { User } from '@/features/users/types/learner.types'
import { notificationService } from '@/features/notifications/services/notification.service'
import { toast } from '@/store/toast.store'

export interface LearnerReminderModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess?: () => void
}

const PRESETS = [
  {
    id: 'streak',
    icon: Flame,
    label: '🔥 Nhắc giữ chuỗi Streak',
    title: 'Đừng để mất chuỗi Streak hôm nay! 🔥',
    content: 'Bạn đang có chuỗi học tập rất tốt! Hãy dành ra 5 phút hôm nay để giữ vững phong độ và bảo vệ chuỗi Streak nhé!',
  },
  {
    id: 'goal',
    icon: Target,
    label: '🎯 Nhắc mục tiêu TOEIC',
    title: 'Mục tiêu học tiếng Anh hôm nay đang chờ bạn! 🎯',
    content: 'Dành ra 15 phút luyện tập hôm nay để giữ vững phong độ và sớm đạt mục tiêu điểm số TOEIC nhé!',
  },
  {
    id: 'lesson',
    icon: BookOpen,
    label: '📚 Nhắc học bài mới',
    title: 'Tiếp tục bài học đang dang dở nào! 📚',
    content: 'Đã đến giờ học theo lộ trình của bạn. Hãy vào học tiếp bài giảng hôm nay để không bị trễ tiến độ nhé!',
  },
]

export function LearnerReminderModal({ isOpen, onClose, user, onSuccess }: LearnerReminderModalProps) {
  const [title, setTitle] = useState('Mục tiêu học tiếng Anh hôm nay đang chờ bạn! 🎯')
  const [content, setContent] = useState('Dành ra 15 phút luyện tập hôm nay để giữ vững phong độ và bảo vệ chuỗi ngày học nhé!')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setTitle(`⏰ [Nhắc học] ${user.full_name || 'Bạn'} ơi, vào học tiếng Anh thôi! 🎯`)
        setContent(`Chào ${user.full_name || 'bạn'}, hôm nay bạn chưa hoàn thành mục tiêu học tập. Hãy dành 15 phút ôn luyện để giữ vững phong độ nhé!`)
      } else {
        setTitle('Mục tiêu học tiếng Anh hôm nay đang chờ bạn! 🎯')
        setContent('Dành ra 15 phút luyện tập hôm nay để giữ vững phong độ và bảo vệ chuỗi ngày học nhé!')
      }
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const isAll = !user
  const targetName = user ? (user.full_name || user.email) : 'toàn bộ học viên'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo')
      return
    }

    setIsSubmitting(true)
    try {
      const userIds = user ? [user.user_id] : undefined
      const res = await notificationService.triggerDailyReminders(userIds, {
        title: title.trim(),
        content: content.trim(),
      })

      const count = res.sent_count ? ` (${res.sent_count} thông báo)` : ''
      toast.success(
        isAll
          ? `Đã gửi thông báo nhắc học đến toàn bộ học viên thành công!${count}`
          : `Đã gửi thông báo nhắc học đến ${targetName} thành công!`
      )
      onSuccess?.()
      onClose()
    } catch {
      toast.error('Gửi thông báo nhắc học thất bại, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isAll ? 'Nhắc nhở toàn bộ học viên' : `Nhắc nhở học tập: ${targetName}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAll
                  ? 'Gửi thông báo đẩy ra màn hình điện thoại và email của toàn bộ học viên'
                  : `Gửi thông báo đẩy đến điện thoại và email của học viên (${user?.email})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Gợi ý mẫu thông báo nhanh
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setTitle(preset.title)
                    setContent(preset.content)
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 transition-colors cursor-pointer"
                >
                  <preset.icon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tiêu đề thông báo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nội dung thông báo <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung nhắc nhở học viên..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Xem trước hiển thị trên màn hình điện thoại học viên</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> LingoSphere
                </span>
                <span className="text-[10px] text-slate-400">Vừa xong</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                {title || 'Tiêu đề thông báo'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                {content || 'Nội dung thông báo'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer shadow-sm shadow-indigo-500/20 disabled:opacity-60"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Đang gửi thông báo...' : (isAll ? 'Gửi cho tất cả học viên' : 'Gửi nhắc nhở ngay')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
