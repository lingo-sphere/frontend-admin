/**
 * @file notifications.data.ts
 * @description Mã nguồn thành phần notifications-data.ts
 */

export interface Notification {
  id: string
  recipient_id: string
  recipient_type: 'USER' | 'ADMIN'
  notification_type: string
  notification_category: 'AUTH' | 'USER' | 'SUBSCRIPTION' | 'VOCABULARY' | 'PRACTICE' | 'EXAM' | 'COURSE' | 'AI' | 'GAMIFICATION' | 'MARKETING' | 'SYSTEM'
  channels: string[]
  title: string
  title_vi?: string
  content: string
  content_vi?: string
  data?: Record<string, unknown>
  action_type?: 'NAVIGATE' | 'REDIRECT' | 'BUTTON' | 'DISMISS'
  action_url?: string
  action_label?: string
  source_service?: string
  source_type?: string
  source_id?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'
  is_pinned: boolean
  is_read: boolean
  read_at?: string
  created_at: string
  expires_at?: string
}

export interface NotificationTemplate {
  id: string
  name: string
  template_code: string
  notification_type: string
  notification_category: string
  recipient_type: 'USER' | 'ADMIN'
  title_template_en: string
  title_template_vi?: string
  content_template_en: string
  content_template_vi?: string
  default_channels: string[]
  default_priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'
  is_active: boolean
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
  pinned: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  byChannel: Record<string, number>
}

export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  AUTH: { bg: 'var(--info-soft)', text: 'var(--info)', border: 'rgba(77,120,184,.25)' },
  USER: { bg: 'var(--success-soft)', text: 'var(--success)', border: 'rgba(93,155,99,.25)' },
  SUBSCRIPTION: { bg: 'var(--warning-soft)', text: '#9a6d1a', border: 'rgba(217,164,65,.25)' },
  VOCABULARY: { bg: 'var(--primary-soft)', text: 'var(--primary)', border: 'rgba(47,127,120,.25)' },
  PRACTICE: { bg: 'var(--ai-soft)', text: 'var(--ai)', border: 'rgba(138,104,168,.25)' },
  EXAM: { bg: 'var(--warning-soft)', text: '#9a6d1a', border: 'rgba(217,164,65,.25)' },
  COURSE: { bg: 'var(--primary-soft)', text: 'var(--primary)', border: 'rgba(47,127,120,.25)' },
  AI: { bg: 'var(--ai-soft)', text: 'var(--ai)', border: 'rgba(138,104,168,.25)' },
  GAMIFICATION: { bg: 'var(--success-soft)', text: 'var(--success)', border: 'rgba(93,155,99,.25)' },
  MARKETING: { bg: 'var(--warning-soft)', text: '#9a6d1a', border: 'rgba(217,164,65,.25)' },
  SYSTEM: { bg: 'var(--surface-subtle)', text: 'var(--text-secondary)', border: 'var(--border)' },
}

export const priorityColors: Record<string, string> = {
  LOW: 'var(--text-tertiary)',
  NORMAL: 'var(--info)',
  HIGH: 'var(--warning)',
  URGENT: 'var(--error)',
  CRITICAL: 'var(--error)',
}

export const categoryLabels: Record<string, { vi: string; en: string }> = {
  AUTH: { vi: 'Xác thực', en: 'Authentication' },
  USER: { vi: 'Người dùng', en: 'User' },
  SUBSCRIPTION: { vi: 'Đăng ký', en: 'Subscription' },
  VOCABULARY: { vi: 'Từ vựng', en: 'Vocabulary' },
  PRACTICE: { vi: 'Luyện tập', en: 'Practice' },
  EXAM: { vi: 'Thi TOEIC', en: 'Exam' },
  COURSE: { vi: 'Khóa học', en: 'Course' },
  AI: { vi: 'AI', en: 'AI' },
  GAMIFICATION: { vi: 'Gamification', en: 'Gamification' },
  MARKETING: { vi: 'Marketing', en: 'Marketing' },
  SYSTEM: { vi: 'Hệ thống', en: 'System' },
}
