// Component hiển thị các thẻ thông số cấu hình lịch học, bộ đếm vi phạm vắng học và trạng thái khóa chương.

import { Calendar, Clock, AlertTriangle, Lock, Unlock, PlayCircle, MailCheck } from 'lucide-react'
import type { LearnerStudySchedule, LearnerLockState } from '@/features/progress/services/progress.service'

interface LearnerReminderStatusCardsProps {
  schedule?: LearnerStudySchedule
  lockState?: LearnerLockState
  lastVideoWatchedAt?: unknown
  totalEmailsSent: number
}

function formatDaysOfWeek(days: Array<number | string> = []): string {
  if (!days || days.length === 0) return 'Mặc định (20:00 Thứ Bảy)'
  const dayLabels: Record<string, string> = {
    '1': 'Thứ 2',
    '2': 'Thứ 3',
    '3': 'Thứ 4',
    '4': 'Thứ 5',
    '5': 'Thứ 6',
    '6': 'Thứ 7',
    '0': 'Chủ Nhật',
    'T2': 'Thứ 2',
    'T3': 'Thứ 3',
    'T4': 'Thứ 4',
    'T5': 'Thứ 5',
    'T6': 'Thứ 6',
    'T7': 'Thứ 7',
    'CN': 'Chủ Nhật',
  }
  return days.map((d) => dayLabels[String(d)] || String(d)).join(', ')
}

function formatDateTime(val: unknown): string {
  if (!val) return 'Chưa ghi nhận'
  try {
    const d = new Date(val as string | number | Date)
    if (isNaN(d.getTime())) return 'Chưa ghi nhận'
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return 'Chưa ghi nhận'
  }
}

export function LearnerReminderStatusCards({
  schedule,
  lockState,
  lastVideoWatchedAt,
  totalEmailsSent,
}: LearnerReminderStatusCardsProps) {
  const missedCount = schedule?.consecutive_missed_sessions || 0
  const isLocked = lockState?.is_locked || false
  const reminderTime = schedule?.reminder_time || '19:30'
  const duration = schedule?.duration_minutes || 45
  const hasCustomSchedule = !!(schedule?.days_of_week && schedule.days_of_week.length > 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Lịch học đăng ký
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>{reminderTime} ({duration} phút)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate" title={formatDaysOfWeek(schedule?.days_of_week)}>
            {formatDaysOfWeek(schedule?.days_of_week)}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Loại lịch:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {hasCustomSchedule ? 'Lịch tự chọn' : 'Mặc định hệ thống'}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Bộ đếm cảnh báo vắng
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            missedCount >= 5
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              : missedCount > 0
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${
              missedCount >= 5 ? 'text-rose-600' : missedCount > 0 ? 'text-amber-500' : 'text-emerald-600'
            }`}>
              {missedCount}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 5 lần</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {[1, 2, 3, 4, 5].map((step) => {
              const isFilled = missedCount >= step
              return (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isFilled
                      ? missedCount >= 5
                        ? 'bg-rose-500'
                        : 'bg-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />
              )
            })}
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          {missedCount >= 5
            ? 'Đã vi phạm 5 lần - Khóa chương'
            : `Còn ${5 - missedCount} lần trước khi bị khóa chương`}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Trạng thái chương
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isLocked
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <div className={`text-base font-bold ${isLocked ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isLocked ? `Đã khóa Chương ${lockState?.locked_chapter_order || ''}` : 'Bình thường (Đang mở)'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isLocked
              ? 'Yêu cầu thi lại Post-mini Test chương trước để mở khóa'
              : 'Học viên được truy cập toàn bộ bài học đã mở'}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Cập nhật:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatDateTime(lockState?.locked_at || lockState?.unlocked_at)}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tương tác & Email
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <MailCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <PlayCircle className="w-4 h-4 text-purple-500" />
            <span className="truncate">{formatDateTime(lastVideoWatchedAt)}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Xem video bài giảng gần nhất
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Tổng email đã gửi:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {totalEmailsSent} emails
          </span>
        </div>
      </div>
    </div>
  )
}
