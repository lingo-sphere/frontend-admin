// Component hiển thị tiêu đề và các thao tác tác vụ nhanh trên trang lịch sử nhắc nhở của học viên.

import { ArrowLeft, RotateCw, Unlock, BookOpen, ShieldAlert } from 'lucide-react'

interface LearnerReminderHeaderProps {
  displayName: string
  displayEmail: string
  avatarUrl?: string
  courseTitle: string
  isLocked: boolean
  lockedChapterOrder?: number
  consecutiveMissedSessions: number
  isLoading: boolean
  isUnlocking: boolean
  onBack: () => void
  onRefresh: () => void
  onManualUnlock: () => void
}

export function LearnerReminderHeader({
  displayName,
  displayEmail,
  avatarUrl,
  courseTitle,
  isLocked,
  lockedChapterOrder,
  consecutiveMissedSessions,
  isLoading,
  isUnlocking,
  onBack,
  onRefresh,
  onManualUnlock,
}: LearnerReminderHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer shrink-0"
            title="Quay lại danh sách học viên"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0)
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {displayName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                <BookOpen className="w-3.5 h-3.5" />
                {courseTitle}
              </span>
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Đang khóa Chương {lockedChapterOrder || ''}
                </span>
              ) : consecutiveMissedSessions > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Cảnh báo {consecutiveMissedSessions}/5 lần
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Học đúng tiến độ
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{displayEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end lg:self-center w-full lg:w-auto justify-end">
          {isLocked && (
            <button
              type="button"
              disabled={isUnlocking}
              onClick={onManualUnlock}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>{isUnlocking ? 'Đang mở khóa...' : 'Mở khóa chương thủ công'}</span>
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={onRefresh}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>
    </div>
  )
}
