import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { AppNotification } from '@/types/api.types'

export interface CreateNotificationPayload {
  title: string
  title_vi?: string
  content: string
  content_vi?: string
  category: string
  priority?: string
  user_id?: string // Omit for broadcast to all users
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
  // Lấy danh sách thông báo của tài khoản hiện tại
  async getMyNotifications(params?: { is_read?: boolean; category?: string }): Promise<AppNotification[]> {
    return api.get<AppNotification[]>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MY, params as Record<string, unknown>)
  },

  // Tạo thông báo mới (Admin)
  async createNotification(payload: CreateNotificationPayload): Promise<AppNotification> {
    return api.post<AppNotification>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CREATE, payload)
  },

  // Đánh dấu 1 thông báo đã đọc
  async markAsRead(id: string): Promise<{ message: string }> {
    return api.put<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  },

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(): Promise<{ message: string }> {
    return api.put<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },

  // Lấy danh sách templates thông báo
  async getAllTemplates(): Promise<NotificationTemplate[]> {
    return api.get<NotificationTemplate[]>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.TEMPLATES)
  },

  // Tạo template mới
  async createTemplate(payload: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    return api.post<NotificationTemplate>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.TEMPLATES, payload)
  },

  // Tạo chiến dịch thông báo
  async createCampaign(payload: { name: string; target_audience: string; template_id: string; scheduled_at?: string }): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CAMPAIGNS, payload)
  },

  // Kích hoạt gửi nhắc nhở học tập hàng ngày qua cron trigger
  async triggerDailyReminders(): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CRON_DAILY_REMINDERS)
  },
}
