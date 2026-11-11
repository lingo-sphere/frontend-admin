// Danh sách thông báo dạng popover trên thanh điều hướng topbar theo phong cách hiện đại.
import { useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  BellRing,
  CheckCheck,
  Check,
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Inbox,
  UserPlus,
  CreditCard,
  AlertTriangle,
  Target,
  Cpu,
  Trophy,
} from 'lucide-react'
import type { AppNotification } from '@/types/api.types'
import { formatRelativeTime } from '@/lib/format'
import { usePreventScrollChain } from '@/hooks/use.prevent.scroll.chain'

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

function getNotificationMeta(notif: AppNotification, isVi: boolean) {
  const type = (notif.notification_type || '').toUpperCase()
  const cat = (notif.notification_category || notif.category || '').toString().toUpperCase()
  const title = (notif.title || '').toLowerCase()

  if (
    cat === 'USER' ||
    type.includes('USER') ||
    type.includes('REGISTER') ||
    title.includes('đăng ký') ||
    title.includes('học viên mới')
  ) {
    return {
      icon: UserPlus,
      colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/25',
      tagClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
      tagLabel: isVi ? 'Học viên' : 'Learner',
    }
  }

  if (
    cat === 'SUBSCRIPTION' ||
    type.includes('PAYMENT') ||
    type.includes('ORDER') ||
    type.includes('BUY') ||
    title.includes('mua') ||
    title.includes('thanh toán')
  ) {
    return {
      icon: CreditCard,
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
      tagClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
      tagLabel: isVi ? 'Thanh toán' : 'Payment',
    }
  }

  if (cat === 'COURSE' || type.includes('COURSE') || type.includes('LESSON')) {
    return {
      icon: BookOpen,
      colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/25',
      tagClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
      tagLabel: isVi ? 'Khóa học' : 'Course',
    }
  }

  if (cat === 'EXAM' || type.includes('EXAM') || type.includes('TEST') || type.includes('TOEIC')) {
    return {
      icon: GraduationCap,
      colorClass: 'text-violet-500 bg-violet-500/10 border-violet-500/25',
      tagClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/25',
      tagLabel: isVi ? 'Khảo thí' : 'Exam',
    }
  }

  if (cat === 'PRACTICE' || type.includes('PRACTICE') || type.includes('SPEAKING') || type.includes('WRITING')) {
    return {
      icon: Target,
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
      tagClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
      tagLabel: isVi ? 'Luyện tập' : 'Practice',
    }
  }

  if (cat === 'VOCABULARY' || type.includes('VOCAB') || type.includes('SRS')) {
    return {
      icon: Sparkles,
      colorClass: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/25',
      tagClass: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/25',
      tagLabel: isVi ? 'Từ vựng' : 'Vocabulary',
    }
  }

  if (cat === 'AI' || type.includes('AI') || type.includes('MODEL')) {
    return {
      icon: Cpu,
      colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/25',
      tagClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25',
      tagLabel: isVi ? 'Trí tuệ AI' : 'AI Service',
    }
  }

  if (
    cat === 'AUTH' ||
    type.includes('AUTH') ||
    type.includes('LOGIN') ||
    type.includes('SECURITY') ||
    type.includes('PASSWORD')
  ) {
    return {
      icon: ShieldCheck,
      colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/25',
      tagClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
      tagLabel: isVi ? 'Bảo mật' : 'Security',
    }
  }

  if (cat === 'GAMIFICATION' || type.includes('STREAK') || type.includes('ACHIEVEMENT') || type.includes('LEVEL_UP')) {
    return {
      icon: Trophy,
      colorClass: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
      tagClass: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/25',
      tagLabel: isVi ? 'Thành tích' : 'Achievement',
    }
  }

  return {
    icon: Bell,
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/25',
    tagClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25',
    tagLabel: isVi ? 'Hệ thống' : 'System',
  }
}

function getPriorityBadge(priority?: string, isVi?: boolean) {
  if (priority === 'URGENT' || priority === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
        <AlertTriangle size={10} className="stroke-[2.5]" />
        <span>{isVi ? 'Khẩn cấp' : 'Urgent'}</span>
      </span>
    )
  }
  if (priority === 'HIGH') {
    return (
      <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
        {isVi ? 'Quan trọng' : 'High'}
      </span>
    )
  }
  return null
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  usePreventScrollChain(notificationRef, notificationOpen)

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all relative cursor-pointer ${
          notificationOpen
            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
        }`}
        onClick={onToggleOpen}
        type="button"
        aria-label={t('header.notifications')}
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute right-0 top-full pt-2.5 z-50 transition-all duration-200 ease-out origin-top-right">
          <div className="w-[380px] sm:w-[420px] rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/50 overflow-hidden text-left ring-1 ring-black/5 dark:ring-white/10 overscroll-contain animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="border-b border-slate-100 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-950/40 px-4.5 pt-3.5 pb-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <BellRing size={15} />
                  </div>
                  <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                    {t('header.systemNotifications')}
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10.5px] font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                      {unreadCount} {isVietnamese ? 'mới' : 'new'}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-indigo-500/10"
                    title={t('header.markAllAsRead')}
                  >
                    <CheckCheck size={14} className="stroke-[2.2]" />
                    <span>{t('header.markAllAsRead')}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-white dark:bg-slate-800 shadow-2xs text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {isVietnamese ? 'Tất cả' : 'All'} ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filter === 'unread'
                      ? 'bg-white dark:bg-slate-800 shadow-2xs text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {isVietnamese ? 'Chưa đọc' : 'Unread'} ({unreadCount})
                </button>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto overscroll-contain p-0 divide-y divide-slate-100 dark:divide-slate-800/50 scrollbar-thin">
              {displayedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Inbox size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {filter === 'unread'
                      ? isVietnamese
                        ? 'Đã đọc tất cả thông báo!'
                        : 'All caught up!'
                      : t('header.noNewNotifications')}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-[220px]">
                    {filter === 'unread'
                      ? isVietnamese
                        ? 'Bạn không có thông báo chưa đọc nào.'
                        : 'You have no unread notifications.'
                      : isVietnamese
                        ? 'Các thông báo hệ thống mới sẽ xuất hiện tại đây.'
                        : 'System alerts and updates will appear here.'}
                  </p>
                </div>
              ) : (
                displayedNotifications.map((notif) => {
                  const notifId = notif._id
                  const createdAt = notif.created_at
                  const title = isVietnamese && notif.title_vi ? notif.title_vi : notif.title
                  const content = isVietnamese && notif.content_vi ? notif.content_vi : notif.content
                  const meta = getNotificationMeta(notif, isVietnamese)
                  const priorityBadge = getPriorityBadge(notif.priority, isVietnamese)
                  const IconComponent = meta.icon

                  return (
                    <div
                      key={notifId}
                      className={`group relative flex cursor-pointer items-start gap-3 p-3.5 transition-all duration-200 ${
                        !notif.is_read
                          ? 'bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] hover:bg-indigo-500/[0.08]'
                          : 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                      onClick={() => {
                        onMarkAsRead(notifId)
                        if (notif.action_url) {
                          navigate(notif.action_url)
                          onToggleOpen()
                        }
                      }}
                    >
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.colorClass} shadow-2xs transition-transform duration-200 group-hover:scale-105`}>
                        <IconComponent size={16} strokeWidth={2.2} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold border ${meta.tagClass}`}>
                              {meta.tagLabel}
                            </span>
                            {priorityBadge}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              {formatRelativeTime(createdAt, isVietnamese)}
                            </span>
                            {!notif.is_read && (
                              <span
                                className="h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20 shrink-0"
                                title={isVietnamese ? 'Chưa đọc' : 'Unread'}
                              />
                            )}
                          </div>
                        </div>

                        <h4 className={`text-[12.5px] leading-snug line-clamp-2 ${notif.is_read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-extrabold text-slate-900 dark:text-white'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
                          {title}
                        </h4>

                        <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {content}
                        </p>
                      </div>

                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkAsRead(notifId)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 self-center cursor-pointer"
                          title={isVietnamese ? 'Đánh dấu đã đọc' : 'Mark as read'}
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                className="group/btn w-full flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-500/10 rounded-xl py-2 cursor-pointer transition-all"
                onClick={onGoToNotifications}
              >
                <span>{t('header.viewAllNotifications').replace('→', '').trim()}</span>
                <ArrowRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
