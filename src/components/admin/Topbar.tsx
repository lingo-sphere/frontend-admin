import { useState, useRef, useEffect } from 'react'
import { Search, Moon, Sun, Bell, Menu, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react'
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
    // Load real notifications from backend
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

    // Load total user stats
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
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="mobile-menu"
            onClick={() => setMobileSidebarOpen(true)}
            type="button"
            aria-label="Mở menu"
          >
            <Menu className="icon" />
          </button>

          <div className="search-box" role="search">
            <Search className="icon" />
            <span className="search-placeholder">{t('header.search')}</span>
            <span className="search-kbd">⌘ K</span>
          </div>
        </div>

        <div className="header-actions">
          <span className="utility-pill info">
            <UsersIcon />
            <span className="utility-text">
              {totalLearnersCount !== null ? `${totalLearnersCount} ` : '12.4k '}
              {t('header.learnersCount')}
            </span>
          </span>

          <span className="utility-pill success">
            <span className="status-dot" />
            <span className="utility-text">{t('header.systemStable')}</span>
          </span>

          <button
            className="icon-button lang-button"
            onClick={toggleLanguage}
            type="button"
            aria-label={`Ngôn ngữ hiện tại: ${isVietnamese ? 'Tiếng Việt' : 'English'}`}
          >
            {isVietnamese ? 'VI' : 'EN'}
          </button>

          <button
            className="icon-button"
            onClick={toggleTheme}
            type="button"
            aria-label={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
          >
            {theme === 'dark' ? <Sun className="icon" /> : <Moon className="icon" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="notification-wrapper" ref={notificationRef}>
            <button
              className="icon-button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              type="button"
              aria-label={t('header.notifications')}
            >
              <Bell className="icon" />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {notificationOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>{t('header.notifications')}</h3>
                  {unreadCount > 0 && (
                    <button className="mark-all-btn" onClick={markAllAsRead}>
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <Bell className="empty-icon" />
                      <p>Không có thông báo</p>
                    </div>
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
                          className={`notification-item${!notif.is_read ? ' unread' : ''}`}
                          onClick={() => markAsRead(notifId)}
                        >
                          <div className="notification-content">
                            <div className="notification-title-row">
                              <span className="notification-title">{title}</span>
                              {!notif.is_read && <span className="unread-dot" />}
                            </div>
                            <p className="notification-body">{content}</p>
                            <span className="notification-time">
                              {formatTimeAgo(createdAt, isVietnamese)}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="notification-footer">
                  <button className="view-all-btn" onClick={goToNotifications}>
                    Xem tất cả thông báo →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/60"
              type="button"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
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
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role || 'Admin'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {profile?.full_name || 'Admin Console'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@lingosphere.local'}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveNavItem(`admin-profile:${user?.user_id || 'me'}`)
                    setUserDropdownOpen(false)
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Hồ sơ cá nhân</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNavItem('settings')
                    setUserDropdownOpen(false)
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-violet-400" />
                  <span>Cài đặt hệ thống</span>
                </button>

                <div className="my-1 border-t border-slate-800/80" />

                <button
                  onClick={() => {
                    setUserDropdownOpen(false)
                    setShowLogoutConfirm(true)
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Đăng xuất khỏi hệ thống?"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục quản trị hệ thống LingoSphere."
        confirmText="Đăng xuất"
        cancelText="Hủy bỏ"
        variant="danger"
      />
    </>
  )
}

function UsersIcon() {
  return (
    <svg
      className="icon"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
