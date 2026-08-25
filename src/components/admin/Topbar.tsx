// Updated: 2026-08-22
// Topbar cho admin dashboard
// - Search box
// - Language toggle
// - Theme toggle
// - Notifications dropdown
// - Admin info

import { useState, useRef, useEffect } from 'react'
import { Search, Moon, Sun, Bell, Menu } from 'lucide-react'

import { useAdminStore } from '@/store/admin-store'
import { useTranslation } from 'react-i18next'
import { mockNotifications, type Notification } from '@/data/notifications-data'

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

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications.slice(0, 5))
  const notificationRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const toggleLanguage = () => {
    i18n.changeLanguage(isVietnamese ? 'en' : 'vi')
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const goToNotifications = () => {
    setActiveNavItem('notifications')
    setNotificationOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu"
          onClick={() => setMobileSidebarOpen(true)}
          type="button"
          aria-label="Mở menu"
        >
          <Menu className="icon" />
        </button>

        {/* Search Box */}
        <div className="search-box" role="search">
          <Search className="icon" />
          <span className="search-placeholder">{t('header.search')}</span>
          <span className="search-kbd">⌘ K</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Learners Pill */}
        <span className="utility-pill info">
          <UsersIcon />
          <span className="utility-text">12.4k {t('header.learnersCount')}</span>
        </span>

        {/* System Status Pill */}
        <span className="utility-pill success">
          <span className="status-dot" />
          <span className="utility-text">{t('header.systemStable')}</span>
        </span>

        {/* Language Toggle */}
        <button
          className="icon-button lang-button"
          onClick={toggleLanguage}
          type="button"
          aria-label={`Ngôn ngữ hiện tại: ${isVietnamese ? 'Tiếng Việt' : 'English'}`}
        >
          {isVietnamese ? 'VI' : 'EN'}
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-button"
          onClick={toggleTheme}
          type="button"
          aria-label={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
        >
          {theme === 'dark' ? <Sun className="icon" /> : <Moon className="icon" />}
        </button>

        {/* Notifications */}
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

          {/* Notification Dropdown */}
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
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`notification-item${!notif.is_read ? ' unread' : ''}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="notification-content">
                        <div className="notification-title-row">
                          <span className="notification-title">
                            {isVietnamese && notif.title_vi ? notif.title_vi : notif.title}
                          </span>
                          {!notif.is_read && <span className="unread-dot" />}
                        </div>
                        <p className="notification-body">
                          {isVietnamese && notif.content_vi ? notif.content_vi : notif.content}
                        </p>
                        <span className="notification-time">
                          {formatTimeAgo(notif.created_at, isVietnamese)}
                        </span>
                      </div>
                    </div>
                  ))
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
      </div>
    </header>
  )
}

// Inline icon component for pill
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
