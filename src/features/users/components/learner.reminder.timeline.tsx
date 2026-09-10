// Component hiển thị dòng thời gian timeline chi tiết các email nhắc nhở, cảnh báo vắng và khóa chương gửi cho học viên.

import {
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Calendar,
  Mail,
  CheckCircle2,
  XCircle,
  Inbox,
} from 'lucide-react'
import type { ReminderTimelineItem } from '@/features/notifications/services/notification.service'
import type { ReminderFilterCategory } from '@/features/users/hooks/use.learner.reminder.history'

interface LearnerReminderTimelineProps {
  reminders: ReminderTimelineItem[]
  filterCategory: ReminderFilterCategory
  onSelectFilterCategory: (cat: ReminderFilterCategory) => void
}

function formatTimelineDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function LearnerReminderTimeline({
  reminders,
  filterCategory,
  onSelectFilterCategory,
}: LearnerReminderTimelineProps) {
  const getEventMeta = (type: string) => {
    switch (type) {
      case 'ON_TIME':
        return {
          label: 'Nhắc đúng giờ',
          icon: Clock,
          colorClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
          dotBg: 'bg-indigo-500',
        }
      case 'LATE_WARNING':
        return {
          label: 'Cảnh báo muộn 15p',
          icon: AlertTriangle,
          colorClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          dotBg: 'bg-amber-500',
        }
      case 'CHAPTER_LOCKED':
        return {
          label: 'Khóa chương học',
          icon: Lock,
          colorClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
          dotBg: 'bg-rose-500',
        }
      case 'CHAPTER_UNLOCKED':
        return {
          label: 'Mở khóa chương',
          icon: Unlock,
          colorClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          dotBg: 'bg-emerald-500',
        }
      case 'WEEKLY_INACTIVE':
        return {
          label: 'Nhắc cuối tuần',
          icon: Calendar,
          colorClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
          dotBg: 'bg-sky-500',
        }
      default:
        return {
          label: 'Nhắc nhở học tập',
          icon: Mail,
          colorClass: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
          dotBg: 'bg-slate-400',
        }
    }
  }

  const tabs: { key: ReminderFilterCategory; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'ON_TIME', label: 'Nhắc đúng giờ' },
    { key: 'LATE_WARNING', label: 'Cảnh báo muộn 15p' },
    { key: 'LOCK_UNLOCK', label: 'Khóa / Mở khóa' },
    { key: 'WEEKLY', label: 'Nhắc cuối tuần' },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Lịch sử Email Nhắc Nhở & Cảnh Báo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi từng nhịp gửi email tự động và biến động trạng thái học tập của học viên
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectFilterCategory(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có lịch sử email nào
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Học viên chưa nhận email nhắc nhở nào thuộc phân loại này. Khi hệ thống kích hoạt cron gửi mail nhắc học, các mốc thời gian sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {reminders.map((item) => {
            const meta = getEventMeta(item.event_type)
            const Icon = meta.icon
            const isDelivered = item.status === 'DELIVERED'

            return (
              <div key={item.id} className="relative group">
                <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 border-white dark:border-slate-900 ${meta.colorClass} flex items-center justify-center shadow-xs`}>
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${meta.colorClass}`}>
                        {meta.label}
                      </span>
                      {item.violation_count !== undefined && item.violation_count > 0 && (
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          Vi phạm {item.violation_count}/5
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <Mail className="w-3 h-3" />
                        {item.channel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        isDelivered
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {formatTimelineDate(item.sent_at)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {item.recipient_email && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Địa chỉ nhận: <strong className="text-slate-600 dark:text-slate-300 font-medium">{item.recipient_email}</strong></span>
                      <span className="font-mono text-[10px] text-slate-400">ID: {item.id.slice(-8)}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
