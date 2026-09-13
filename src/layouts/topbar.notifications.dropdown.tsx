// Topbar notifications popover list with mark-as-read and navigation actions.
import type { RefObject } from 'react'
import { Bell } from 'lucide-react'
import type { AppNotification } from '@/types/api.types'
import { formatRelativeTime } from '@/lib/format'

interface TopbarNotificationsDropdownProps {
  notificationRef: RefObject<HTMLDivElement | null>
  notificationOpen: boolean
  onToggleOpen: () => void
  notifications: AppNotification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onGoToNotifications: () => void
  isVietnamese: boolean
}

export function TopbarNotificationsDropdown({
  notificationRef,
  notificationOpen,
  onToggleOpen,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onGoToNotifications,
  isVietnamese,
}: TopbarNotificationsDropdownProps) {
  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors relative cursor-pointer"
        onClick={onToggleOpen}
        type="button"
        aria-label="Thông báo"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>{isVietnamese ? 'Thông báo hệ thống' : 'System Notifications'}</span>
            </h3>
            {unreadCount > 0 && (
              <button
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors cursor-pointer"
                onClick={onMarkAllAsRead}
                type="button"
              >
                {isVietnamese ? 'Đọc tất cả' : 'Mark all as read'}
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2 max-h-72 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                {isVietnamese ? 'Không có thông báo mới nào' : 'No new notifications'}
              </p>
            ) : (
              notifications.map((notif) => {
                const notifId = notif._id || ''
                const createdAt = notif.created_at || ''
                const title = isVietnamese && notif.title_vi ? notif.title_vi : notif.title
                const content =
                  isVietnamese && (notif as { content_vi?: string }).content_vi
                    ? (notif as { content_vi?: string }).content_vi
                    : (notif as { content?: string }).content

                return (
                  <div
                    key={notifId}
                    className={`pt-2 first:pt-0 cursor-pointer p-2.5 rounded-xl transition-colors ${
                      !notif.is_read
                        ? 'bg-indigo-50 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                    onClick={() => onMarkAsRead(notifId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 line-clamp-1">
                        {title}
                      </span>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{content}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {formatRelativeTime(createdAt, isVietnamese)}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              className="w-full py-2 rounded-xl text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={onGoToNotifications}
              type="button"
            >
              {isVietnamese ? 'Xem tất cả thông báo →' : 'View all notifications →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
