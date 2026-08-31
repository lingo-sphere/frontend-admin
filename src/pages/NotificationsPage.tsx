import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  CheckCheck,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { notificationService } from '@/services/notification.service'
import { toast } from '@/store/toast-store'
import type { Notification } from '@/data/notifications-data'
import type { AppNotification } from '@/types/api.types'
import { Pagination } from '@/components/common/Pagination'
import { NotificationFilterBar } from '@/components/notifications/NotificationFilterBar'
import { NotificationListItem } from '@/components/notifications/NotificationListItem'
import { Popconfirm } from '@/components/common/Popconfirm'
import type {
  FilterCategory,
  FilterPriority,
  FilterStatus,
} from '@/helpers/notification.helper'

export function NotificationsPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<FilterPriority>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const list = await notificationService.getMyNotifications()
      if (list && list.length > 0) {
        const mapped: Notification[] = list.map((n: AppNotification) => ({
          id: n._id || '',
          recipient_id: 'admin',
          recipient_type: 'ADMIN',
          notification_type: 'SYSTEM_ALERT',
          notification_category:
            (n.category as Notification['notification_category']) || 'SYSTEM',
          channels: ['IN_APP'],
          title: n.title,
          title_vi: n.title_vi || n.title,
          content: n.content || '',
          content_vi: n.content_vi || n.content || '',
          priority: (n.priority as Notification['priority']) || 'NORMAL',
          is_read: Boolean(n.is_read),
          is_pinned: Boolean(n.is_pinned),
          created_at: n.created_at || new Date().toISOString(),
          read_at: undefined,
          action_url: n.action_url,
        }))
        setNotifications(mapped)
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ thông báo')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleToggleRead = async (id: string, current: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !current } : n))
    )
    try {
      if (!current) {
        await notificationService.markAsRead(id)
      }
    } catch {

    }
  }

  const handleTogglePin = (id: string, current: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_pinned: !current } : n))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success('Đã xóa thông báo')
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await notificationService.markAllAsRead()
      toast.success('Đã đánh dấu đọc tất cả thông báo!')
    } catch {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleDeleteAll = () => {
    setNotifications([])
    toast.success('Đã xóa toàn bộ thông báo!')
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const titleVi = n.title_vi || ''
      const contentVi = n.content_vi || ''
      const matchSearch =
        searchTerm === '' ||
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contentVi.toLowerCase().includes(searchTerm.toLowerCase())

      const matchCategory =
        selectedCategory === 'ALL' || n.notification_category === selectedCategory
      const matchPriority =
        selectedPriority === 'ALL' || n.priority === selectedPriority
      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'UNREAD' && !n.is_read) ||
        (selectedStatus === 'READ' && n.is_read) ||
        (selectedStatus === 'PINNED' && n.is_pinned)

      return matchSearch && matchCategory && matchPriority && matchStatus
    })
  }, [notifications, searchTerm, selectedCategory, selectedPriority, selectedStatus])

  const totalPages = Math.ceil(filteredNotifications.length / pageSize)
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredNotifications.slice(start, start + pageSize)
  }, [filteredNotifications, currentPage, pageSize])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Trung Tâm Thông Báo Hệ Thống</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                {unreadCount} mới
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý nhật ký thông báo tự động, cảnh báo hệ thống và tin nhắn in-app gửi tới học viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Làm mới thông báo"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>Đọc tất cả</span>
          </button>
          <Popconfirm
            title="Xóa tất cả thông báo?"
            description="Toàn bộ thông báo trong hòm thư sẽ bị dọn dẹp vĩnh viễn."
            okText="Xóa tất cả"
            cancelText="Hủy"
            okType="danger"
            placement="bottomRight"
            onConfirm={handleDeleteAll}
          >
            <button
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa tất cả</span>
            </button>
          </Popconfirm>
        </div>
      </div>

      <NotificationFilterBar
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedPriority={selectedPriority}
        selectedStatus={selectedStatus}
        isVietnamese={isVietnamese}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onPriorityChange={setSelectedPriority}
        onStatusChange={setSelectedStatus}
      />

      <div className="space-y-3">
        {paginatedNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Không có thông báo nào phù hợp với bộ lọc hiện tại
          </div>
        ) : (
          paginatedNotifications.map((notif) => (
            <NotificationListItem
              key={notif.id}
              notification={notif}
              isVietnamese={isVietnamese}
              onToggleRead={handleToggleRead}
              onTogglePin={handleTogglePin}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredNotifications.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  )
}
