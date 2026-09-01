/**
 * @file Topbar.tsx
 * @description Component giao diện Topbar phục vụ khu vực Quản trị Admin
 */

import { useState, useRef, useEffect } from 'react'
import { Search, Moon, Sun, Bell, Menu, LogOut, User as UserIcon, Shield, ChevronDown, Users } from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { useTranslation } from 'react-i18next'
import { notificationService } from '@/services/notification.service'
import { userService } from '@/services/user.service'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { GlobalSearchModal } from '@/components/admin/GlobalSearchModal'
import { toast } from '@/store/toast-store'
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
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [totalLearnersCount, setTotalLearnersCount] = useState<number | null>(null)

  const notificationRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable ||
          Boolean(activeEl.closest('input, textarea, select, [contenteditable="true"]')))

      const isModifierPressed = e.metaKey || e.ctrlKey
      const isKPressed =
        e.key?.toLowerCase() === 'k' ||
        e.code === 'KeyK'
      const isSlashPressed =
        e.key === '/' ||
        e.code === 'Slash'

      if (isModifierPressed && isKPressed) {
        e.preventDefault()
        e.stopPropagation()
        setSearchModalOpen((prev) => !prev)
        return
      }

      if (!isInputFocused && !isModifierPressed && !e.altKey && (isKPressed || isSlashPressed)) {
        e.preventDefault()
        e.stopPropagation()
        setSearchModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown, true)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true)
  }, [])

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const items = await notificationService.getMyNotifications()
        setNotifications(items || [])
      } catch {
        setNotifications([])
      }
    }

    const loadUserStats = async () => {
      try {
        const analytics = await userService.getSystemAnalytics()
        if (analytics?.overview?.total_users !== undefined) {
          setTotalLearnersCount(analytics.overview.total_users)
        }
      } catch {

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

    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await notificationService.markAllAsRead()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch {

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

  const [avatarError, setAvatarError] = useState(false)
  const avatarUrl = profile?.avatar_url
  const fullName = profile?.full_name || 'Admin Console'
  const email = profile?.email || user?.email || 'admin@lingosphere.local'
  const role = (profile?.role || user?.role || 'ADMIN').toUpperCase()

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase() || 'AD'

  return (
    <>
      <header className="sticky top-0 z-20 w-full h-17 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-7 flex items-center justify-between gap-4 transition-colors">

        <div className="flex items-center gap-3.5 flex-1 max-w-lg">
          <button
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
            type="button"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex items-center gap-3 w-full h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer text-left"
          >
            <Search className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="w-full text-slate-400 dark:text-slate-500 text-xs truncate">
              {t('header.search') || 'Tìm kiếm nhanh (Người dùng, Khóa học, Từ vựng)...'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
              ⌘K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300">
            <Users className="w-4 h-4" />
            <span>
              {totalLearnersCount !== null ? `${totalLearnersCount} ` : '12.4k '}
              {t('header.learnersCount') || 'Học viên'}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>{t('header.systemStable') || 'Hệ thống ổn định'}</span>
          </div>

          <button
            className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-extrabold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            onClick={toggleLanguage}
            type="button"
            title="Đổi ngôn ngữ Tiếng Việt / English"
          >
            {isVietnamese ? 'VI' : 'EN'}
          </button>

          <button
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            onClick={toggleTheme}
            type="button"
            title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-600" />}
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors relative cursor-pointer"
              onClick={() => setNotificationOpen(!notificationOpen)}
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
                    <span>{t('header.notifications') || 'Thông báo hệ thống'}</span>
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors cursor-pointer"
                      onClick={markAllAsRead}
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
                          className={`pt-2 first:pt-0 cursor-pointer p-2.5 rounded-xl transition-colors ${!notif.is_read
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
                    {isVietnamese ? 'Xem tất cả thông báo →' : 'View all notifications →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 cursor-pointer"
              type="button"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm ring-1 ring-white/20 overflow-hidden shrink-0">
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-tight">
                  {fullName}
                </span>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  {role === 'ADMIN' ? (isVietnamese ? 'Quản trị viên' : 'Administrator') : role}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold overflow-hidden shrink-0">
                    {avatarUrl && !avatarError ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                      {fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveNavItem(`admin-profile:${user?.user_id || 'me'}`)
                    setUserDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{isVietnamese ? 'Hồ sơ cá nhân' : 'My Profile'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNavItem('settings')
                    setUserDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                  <span>{isVietnamese ? 'Cài đặt hệ thống' : 'System Settings'}</span>
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
                  <span>{isVietnamese ? 'Đăng xuất' : 'Sign Out'}</span>
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
        title={isVietnamese ? 'Xác nhận đăng xuất' : 'Confirm Sign Out'}
        description={
          isVietnamese
            ? 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống LingoSphere Admin Console không?'
            : 'Are you sure you want to sign out of LingoSphere Admin Console?'
        }
        confirmText={isVietnamese ? 'Đăng xuất' : 'Sign Out'}
        cancelText={isVietnamese ? 'Hủy bỏ' : 'Cancel'}
        variant="danger"
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  )
}
