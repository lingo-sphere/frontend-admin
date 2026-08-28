import { useState, useRef, useEffect } from 'react'
import { Search, Moon, Sun, Bell, Menu, LogOut, User as UserIcon, Shield, ChevronDown, Users, CheckCircle } from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { useTranslation } from 'react-i18next'
import { notificationService } from '@/services/notification.service'
import { userService } from '@/services/user.service'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { toast } from '@/store/toast-store'
import { mockNotifications, type Notification } from '@/data/notifications-data'
import type { AppNotification } from '@/types/api.types'

function formatTimeAgo(dateStr: string, isVietnamese: boolean): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return isVietnamese ? 'Vừa xong' : 'Just now'
  if (diffMins < 60) return isVietnamese ? `${diffMins}m trước` : `${diffMins}m ago`
  if (diffHours < 24) return isVietnamese ? `${diffHours}h trước` : `${diffHours}h ago`
  if (diffDays < 7) return isVietnamese ? `${diffDays}d trước` : `${diffDays}d ago`
  return date.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US')
}

export function Topbar() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const toggleTheme = useAdminStore((state) => state.toggleTheme)
  const theme = useAdminStore((state) => state.theme)
  const setMobileSidebarOpen = useAdminStore((state) => state.setMobileSidebarOpen)
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const logout = useAuthStore((state) => state.logout)

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [notifications, setNotifications] = useState<(Notification | AppNotification)[]>(mockNotifications.slice(0, 5))
  const [totalLearnersCount, setTotalLearnersCount] = useState<number | null>(null)

  const notificationRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const items = await notificationService.getMyNotifications()
        if (items && items.length > 0) {
          setNotifications(items.slice(0, 8))
        }
      } catch (err) {
        console.warn('Using fallback notifications:', err)
      }
    }

    const loadUserStats = async () => {
      try {
        const analytics = await userService.getSystemAnalytics()
        if (analytics?.overview?.total_users !== undefined) {
          setTotalLearnersCount(analytics.overview.total_users)
        }
      } catch (err) {
        console.warn('Using default learner count:', err)
      }
    }

    loadNotifications()
    loadUserStats()
  }, [])

  const toggleLanguage = () => {
    i18n.changeLanguage(isVietnamese ? 'en' : 'vi')
  }

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        const notifId = (n as { _id?: string })._id || (n as { id?: string }).id
        return notifId === id ? { ...n, is_read: true } : n
      }),
    )
    try {
      await notificationService.markAsRead(id)
    } catch {
      // silent
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await notificationService.markAllAsRead()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch {
      // silent
    }
  }

  const goToNotifications = () => {
    setActiveNavItem('notifications')
    setNotificationOpen(false)
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
    toast.info('Bạn đã đăng xuất khỏi hệ thống thành công')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-20 w-full h-16 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
            type="button"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2.5 w-full h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder={t('header.search') || 'Tìm kiếm nhanh (Người dùng, Khóa học, Từ vựng)...'}
              className="w-full bg-transparent border-0 outline-none text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300">
            <Users className="w-3.5 h-3.5" />
            <span>
              {totalLearnersCount !== null ? `${totalLearnersCount} ` : '12.4k '}
              {t('header.learnersCount') || 'Học viên'}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>{t('header.systemStable') || 'Hệ thống ổn định'}</span>
          </div>

          <button
            className="h-9 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            onClick={toggleLanguage}
            type="button"
            title="Đổi ngôn ngữ Tiếng Việt / English"
          >
            {isVietnamese ? 'VI' : 'EN'}
          </button>

          <button
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            onClick={toggleTheme}
            type="button"
            title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors relative cursor-pointer"
              onClick={() => setNotificationOpen(!notificationOpen)}
              type="button"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>{t('header.notifications') || 'Thông báo hệ thống'}</span>
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors cursor-pointer"
                      onClick={markAllAsRead}
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">Không có thông báo mới nào</p>
                  ) : (
                    notifications.map((notif) => {
                      const notifId = (notif as { _id?: string })._id || (notif as { id?: string }).id || ''
                      const createdAt = (notif as { created_at?: string }).created_at || new Date().toISOString()
                      const title = isVietnamese && notif.title_vi ? notif.title_vi : notif.title
                      const content =
                        isVietnamese && (notif as { content_vi?: string }).content_vi
                          ? (notif as { content_vi?: string }).content_vi
                          : (notif as { content?: string }).content

                      return (
                        <div
                          key={notifId}
                          className={`pt-2 first:pt-0 cursor-pointer p-2 rounded-xl transition-colors ${
                            !notif.is_read
                              ? 'bg-indigo-50 dark:bg-indigo-950/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                          onClick={() => markAsRead(notifId)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 line-clamp-1">{title}</span>
                            {!notif.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{content}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {formatTimeAgo(createdAt, isVietnamese)}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    className="w-full py-2 rounded-xl text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={goToNotifications}
                  >
                    Xem tất cả thông báo →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 cursor-pointer"
              type="button"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-1 ring-white/20">
                {profile?.full_name
                  ? profile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(-2)
                      .join('')
                      .toUpperCase()
                  : user?.email
                    ? user.email.substring(0, 2).toUpperCase()
                    : 'AD'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-tight">
                  {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role || 'Admin'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                    {profile?.full_name || 'Admin Console'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'admin@lingosphere.local'}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveNavItem(`admin-profile:${user?.user_id || 'me'}`)
                    setUserDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Hồ sơ cá nhân</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNavItem('settings')
                    setUserDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                  <span>Cài đặt hệ thống</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setUserDropdownOpen(false)
                    setShowLogoutConfirm(true)
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống LingoSphere Admin Console không?"
        confirmText="Đăng xuất"
        cancelText="Hủy bỏ"
        variant="danger"
      />
    </>
  )
}
