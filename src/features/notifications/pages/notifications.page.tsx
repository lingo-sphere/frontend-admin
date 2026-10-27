// Trang quản trị trung tâm thông báo và phát thông báo in-app trong giao diện Admin
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  CheckCheck,
  Trash2,
  RotateCcw,
  Send,
  CalendarCheck,
  Bookmark,
  Flame,
  AlertCircle,
} from 'lucide-react'
import { StatCard } from '@/components/stat.card'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { toast } from '@/store/toast.store'
import { Pagination } from '@/components/pagination'
import { NotificationFilterBar } from '@/features/notifications/components/notification.filter.bar'
import { NotificationListItem } from '@/features/notifications/components/notification.list.item'
import { Popconfirm } from '@/components/popconfirm'
import { CreateNotificationModal } from '@/features/notifications/components/create.notification.modal'
import {
  useNotificationsAdminQuery,
  useNotificationAdminMutations,
} from '@/features/notifications/hooks/use.notifications.admin.query'
import type {
  FilterCategory,
  FilterPriority,
  FilterStatus,
} from '@/features/notifications/helpers/notification.helper'

export function NotificationsPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const { data: notifications = [], isLoading, refetch } = useNotificationsAdminQuery()
  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(refetch)
  const {
    markAsRead,
    togglePin,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    triggerDailyReminders,
  } = useNotificationAdminMutations()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<FilterPriority>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleToggleRead = (id: string, current: boolean) => {
    markAsRead.mutate(
      { id, isRead: !current },
      {
        onError: () => toast.error('Không thể cập nhật trạng thái đã đọc'),
      }
    )
  }

  const handleTogglePin = (id: string, current: boolean) => {
    togglePin.mutate(
      { id, isPinned: !current },
      {
        onError: () => toast.error('Không thể cập nhật trạng thái ghim'),
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id, {
      onSuccess: () => toast.success('Đã xóa thông báo'),
      onError: () => toast.error('Không thể xóa thông báo'),
    })
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu đọc tất cả thông báo!'),
      onError: () => toast.error('Có lỗi xảy ra'),
    })
  }

  const handleDeleteAll = () => {
    clearAllNotifications.mutate(undefined, {
      onSuccess: () => toast.success('Đã dọn dẹp toàn bộ thông báo!'),
      onError: () => toast.error('Không thể xóa thông báo trên máy chủ'),
    })
  }

  const handleTriggerDailyReminders = () => {
    triggerDailyReminders.mutate(undefined, {
      onSuccess: (res) => {
        const msg = res?.message || 'Đã quét và phát thông báo nhắc nhở học tập thành công!'
        toast.success(msg)
      },
      onError: () => toast.error('Không thể kích hoạt tiến trình gửi thông báo'),
    })
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
        contentVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.recipient_id.toLowerCase().includes(searchTerm.toLowerCase())

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

  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter((n) => !n.is_read).length
    const pinned = notifications.filter((n) => n.is_pinned).length
    const highPriority = notifications.filter((n) => n.priority === 'HIGH' || n.priority === 'URGENT').length
    return { total, unread, pinned, highPriority }
  }, [notifications])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Trung Tâm Thông Báo Hệ Thống</span>
            {stats.unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                {stats.unread} mới
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý nhật ký thông báo tự động, cảnh báo hệ thống và phát tin nhắn in-app gửi tới học viên
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Phát Thông Báo Mới</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerDailyReminders}
            disabled={triggerDailyReminders.isPending}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
            title="Quét và gửi thông báo nhắc học viên"
          >
            <CalendarCheck className={`w-4 h-4 ${triggerDailyReminders.isPending ? 'animate-bounce' : ''}`} />
            <span>Nhắc Học Tập</span>
          </button>

          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-60"
            title="Làm mới thông báo"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>Đọc tất cả</span>
          </button>

          <Popconfirm
            title="Xóa tất cả thông báo?"
            description="Toàn bộ thông báo trong hòm thư sẽ bị dọn dẹp vĩnh viễn trên hệ thống."
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isVietnamese ? 'Tổng Thông Báo' : 'Total Notifications'}
          value={stats.total.toLocaleString()}
          subtitle={isVietnamese ? 'Thông báo đã phát trong hệ thống' : 'Total notifications sent'}
          icon={Bell}
          color="indigo"
          trend={stats.total > 0 ? `${stats.total}` : undefined}
          trendType="neutral"
        />

        <StatCard
          title={isVietnamese ? 'Chưa Đọc' : 'Unread'}
          value={stats.unread.toLocaleString()}
          subtitle={isVietnamese ? 'Chờ học viên mở xem' : 'Pending learner view'}
          icon={AlertCircle}
          color="rose"
          trend={stats.unread > 0 ? `${stats.unread}` : undefined}
          trendType={stats.unread > 0 ? 'down' : 'neutral'}
        />

        <StatCard
          title={isVietnamese ? 'Được Ghim' : 'Pinned'}
          value={stats.pinned.toLocaleString()}
          subtitle={isVietnamese ? 'Thông báo ưu tiên cao nhất' : 'High priority pinned'}
          icon={Bookmark}
          color="amber"
          trend={stats.pinned > 0 ? `${stats.pinned}` : undefined}
          trendType="neutral"
        />

        <StatCard
          title={isVietnamese ? 'Khẩn Cấp / Quan Trọng' : 'High Priority'}
          value={stats.highPriority.toLocaleString()}
          subtitle={isVietnamese ? 'Cảnh báo và sự kiện quan trọng' : 'Urgent alerts and updates'}
          icon={Flame}
          color="teal"
          trend={stats.highPriority > 0 ? `${stats.highPriority}` : undefined}
          trendType="neutral"
        />
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

      {filteredNotifications.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredNotifications.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
