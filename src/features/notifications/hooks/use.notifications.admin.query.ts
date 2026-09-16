// Hook quản lý truy vấn và thao tác dữ liệu thông báo toàn sàn trong quản trị
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  notificationService,
  type CreateNotificationPayload,
} from '@/features/notifications/services/notification.service'
import { notificationsAdminKeys } from '@/features/notifications/keys/notifications.admin.keys'
import type { Notification } from '@/features/notifications/data/notifications.data'
import type { AppNotification } from '@/types/api.types'

export function useNotificationsAdminQuery() {
  return useQuery<Notification[]>({
    queryKey: notificationsAdminKeys.list(),
    queryFn: async () => {
      const list = await notificationService.getMyNotifications()
      if (!Array.isArray(list)) return []
      return list.map((n: AppNotification) => ({
        id: n._id || '',
        recipient_id: n.recipient_id || 'ALL_USERS',
        recipient_type: (n.recipient_type as Notification['recipient_type']) || 'USER',
        notification_type: n.notification_type || 'SYSTEM_ALERT',
        notification_category:
          (n.notification_category as Notification['notification_category']) ||
          (n.category as Notification['notification_category']) ||
          'SYSTEM',
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
    },
    staleTime: 0,
  })
}

export function useNotificationAdminMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: notificationsAdminKeys.list() })
  }

  const markAsRead = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      notificationService.markAsRead(id, isRead),
    onSuccess: invalidate,
  })

  const togglePin = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      notificationService.togglePin(id, isPinned),
    onSuccess: invalidate,
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: invalidate,
  })

  const deleteNotification = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: invalidate,
  })

  const clearAllNotifications = useMutation({
    mutationFn: () => notificationService.clearAllNotifications(),
    onSuccess: invalidate,
  })

  const createNotification = useMutation({
    mutationFn: (payload: CreateNotificationPayload) =>
      notificationService.createNotification(payload),
    onSuccess: invalidate,
  })

  const triggerDailyReminders = useMutation({
    mutationFn: (userIds?: string[]) =>
      notificationService.triggerDailyReminders(userIds),
    onSuccess: invalidate,
  })

  return {
    markAsRead,
    togglePin,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification,
    triggerDailyReminders,
  }
}
