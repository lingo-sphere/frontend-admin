// Service API xử lý các tác vụ quản trị thông báo, tạo thông báo phát toàn sàn và mẫu chiến dịch.
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { AppNotification } from '@/types/api.types'

export interface CreateNotificationPayload {
  recipient_id?: string
  recipient_type?: string
  notification_type?: string
  notification_category?: string
  title: string
  title_vi?: string
  content: string
  content_vi?: string
  category?: string
  priority?: string
  user_id?: string
  action_url?: string
}

export interface NotificationTemplate {
  _id?: string
  name: string
  category: string
  subject: string
  template_body: string
}

export const notificationService = {
  async getMyNotifications(params?: { is_read?: boolean; category?: string }): Promise<AppNotification[]> {
    return api.get<AppNotification[]>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MY, params as Record<string, unknown>)
  },

  async createNotification(payload: CreateNotificationPayload): Promise<AppNotification> {
    const targetRecipient = payload.recipient_id || payload.user_id || 'ALL_USERS'
    const isBroadcast = targetRecipient === 'ALL' || targetRecipient === 'ALL_USERS'

    const body = {
      recipient_id: targetRecipient,
      recipient_type: payload.recipient_type || (isBroadcast ? 'BROADCAST' : 'USER'),
      notification_type: payload.notification_type || (isBroadcast ? 'SYSTEM_BROADCAST' : 'SYSTEM_ALERT'),
      notification_category: payload.notification_category || payload.category || 'SYSTEM',
      title: payload.title,
      title_vi: payload.title_vi || payload.title,
      content: payload.content,
      content_vi: payload.content_vi || payload.content,
      priority: payload.priority || 'NORMAL',
      action_url: payload.action_url,
    }
    return api.post<AppNotification>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CREATE, body)
  },

  async markAsRead(id: string, isRead = true): Promise<{ message: string }> {
    return api.put<{ message: string }>(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id)}?is_read=${isRead}`)
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return api.put<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(id))
  },

  async clearAllNotifications(): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CLEAR_ALL)
  },

  async togglePin(id: string, isPinned: boolean): Promise<{ message: string }> {
    return api.put<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.TOGGLE_PIN(id), { is_pinned: isPinned })
  },

  async getAllTemplates(): Promise<NotificationTemplate[]> {
    return api.get<NotificationTemplate[]>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.TEMPLATES)
  },

  async createTemplate(payload: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    return api.post<NotificationTemplate>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.TEMPLATES, payload)
  },

  async createCampaign(payload: { name: string; target_audience: string; template_id: string; scheduled_at?: string }): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CAMPAIGNS, payload)
  },

  async triggerDailyReminders(): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CRON_DAILY_REMINDERS)
  },
}
