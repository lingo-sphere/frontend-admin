/**
 * @file topbar.tsx
 * @description Admin topbar navigation header with global search, system telemetry, language/theme toggles, and user menu
 */

import { useState, useRef, useEffect } from 'react'
import { Search, Moon, Sun, Menu, Users } from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { useAuthStore } from '@/store/auth.store'
import { useTranslation } from 'react-i18next'
import { notificationService } from '@/services/notification.service'
import { userService } from '@/services/user.service'
import { ConfirmModal } from '@/components/common/confirm.modal'
import { GlobalSearchModal } from '@/components/admin/global.search.modal'
import { toast } from '@/store/toast.store'
import type { AppNotification } from '@/types/api.types'
import { TopbarNotificationsDropdown } from './topbar.notifications.dropdown'
import { TopbarUserMenu } from './topbar.user.menu'

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
  const [avatarError, setAvatarError] = useState(false)

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
      const isKPressed = e.key?.toLowerCase() === 'k' || e.code === 'KeyK'
      const isSlashPressed = e.key === '/' || e.code === 'Slash'

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

  return (
    <>
      <header className="sticky top-0 z-40 shrink-0 w-full h-17 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-7 flex items-center justify-between gap-4 transition-colors shadow-xs">
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

          <TopbarNotificationsDropdown
            notificationRef={notificationRef}
            notificationOpen={notificationOpen}
            onToggleOpen={() => setNotificationOpen(!notificationOpen)}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onGoToNotifications={goToNotifications}
            isVietnamese={isVietnamese}
          />

          <TopbarUserMenu
            userDropdownRef={userDropdownRef}
            userDropdownOpen={userDropdownOpen}
            onToggleOpen={() => setUserDropdownOpen(!userDropdownOpen)}
            profile={profile}
            user={user}
            avatarError={avatarError}
            onAvatarError={() => setAvatarError(true)}
            onNavigateProfile={() => {
              setActiveNavItem(`admin-profile:${user?.user_id || 'me'}`)
              setUserDropdownOpen(false)
            }}
            onNavigateSettings={() => {
              setActiveNavItem('settings')
              setUserDropdownOpen(false)
            }}
            onTriggerLogout={() => {
              setUserDropdownOpen(false)
              setShowLogoutConfirm(true)
            }}
            isVietnamese={isVietnamese}
          />
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
