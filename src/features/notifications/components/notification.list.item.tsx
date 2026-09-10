/**
 * @file notification.list.item.tsx
 * @description Component giao diện hiển thị từng dòng thông báo chi tiết trong trung tâm thông báo admin
 */

import { Bell, Pin, PinOff, Check, CheckCheck, Trash2, Users, Sparkles, Crown, User, ExternalLink, AlertTriangle } from 'lucide-react'
import type { Notification } from '@/features/notifications/data/notifications.data'
import { formatTimeAgo } from '@/features/notifications/helpers/notification.helper'
import { Popconfirm } from '@/components/popconfirm'

interface NotificationListItemProps {
  notification: Notification
  isVietnamese: boolean
  onToggleRead: (id: string, current: boolean) => void
  onTogglePin: (id: string, current: boolean) => void
  onDelete: (id: string) => Promise<void> | void
}

function renderAudienceBadge(recipientId?: string) {
  if (!recipientId || recipientId === 'ALL' || recipientId === 'ALL_USERS') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
        <Users className="w-3 h-3" />
        <span>Toàn sàn</span>
      </span>
    )
  }
  if (recipientId === 'FREE_USERS') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Sparkles className="w-3 h-3" />
        <span>Gói Miễn phí</span>
      </span>
    )
  }
  if (recipientId === 'PREMIUM_USERS') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Crown className="w-3 h-3" />
        <span>VIP Premium</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <User className="w-3 h-3" />
      <span>{recipientId}</span>
    </span>
  )
}

function renderPriorityBadge(priority?: string) {
  if (priority === 'URGENT' || priority === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <AlertTriangle className="w-3 h-3" />
        <span>Khẩn cấp</span>
      </span>
    )
  }
  if (priority === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <span>Quan trọng</span>
      </span>
    )
  }
  return null
}

export function NotificationListItem({
  notification,
  isVietnamese,
  onToggleRead,
  onTogglePin,
  onDelete,
}: NotificationListItemProps) {
  const isRead = notification.is_read
  const isPinned = notification.is_pinned

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
        isPinned
          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
          : isRead
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isPinned
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
              : isRead
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                : 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
          }`}
        >
          <Bell className="w-4 h-4" />
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4
              className={`text-xs font-bold truncate max-w-md ${
                isRead
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {isVietnamese ? notification.title_vi || notification.title : notification.title}
            </h4>
            {isPinned && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Ghim
              </span>
            )}
            {renderAudienceBadge(notification.recipient_id)}
            {renderPriorityBadge(notification.priority)}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {notification.notification_category}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            {isVietnamese ? notification.content_vi || notification.content : notification.content}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <span className="text-[11px] text-slate-400 font-medium">
              {formatTimeAgo(notification.created_at, isVietnamese)}
            </span>
            {notification.action_url && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <ExternalLink className="w-3 h-3" />
                <span className="truncate max-w-xs">{notification.action_url}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onTogglePin(notification.id, isPinned)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isPinned
              ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isPinned ? 'Bỏ ghim thông báo' : 'Ghim thông báo'}
        >
          {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onToggleRead(notification.id, isRead)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isRead
              ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
          }`}
          title={isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
        >
          {isRead ? <Check className="w-3.5 h-3.5" /> : <CheckCheck className="w-3.5 h-3.5" />}
        </button>

        <Popconfirm
          title="Xóa thông báo này?"
          description="Hành động này không thể hoàn tác."
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
          placement="topRight"
          onConfirm={() => onDelete(notification.id)}
        >
          <button
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Xóa thông báo"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </Popconfirm>
      </div>
    </div>
  )
}
