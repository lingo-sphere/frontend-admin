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

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'USER_SIGNUP',
    notification_category: 'USER',
    channels: ['IN_APP', 'PUSH'],
    title: 'New user registered',
    title_vi: 'Người dùng mới đăng ký',
    content: 'A new user has registered on the platform.',
    content_vi: 'Một người dùng mới đã đăng ký trên nền tảng.',
    source_service: 'AUTH',
    source_type: 'USER',
    source_id: 'user-12345',
    priority: 'NORMAL',
    is_pinned: true,
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-002',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'CONTENT_FLAGGED',
    notification_category: 'SYSTEM',
    channels: ['IN_APP', 'EMAIL'],
    title: 'Content reported by user',
    title_vi: 'Nội dung bị báo cáo',
    content: 'User "Lê Minh" has reported inappropriate content in a public deck.',
    content_vi: 'Người dùng "Lê Minh" đã báo cáo nội dung không phù hợp trong bộ thẻ công khai.',
    action_type: 'NAVIGATE',
    action_url: '/admin/content/reports/123',
    action_label: 'Xem báo cáo',
    source_service: 'VOCABULARY',
    source_type: 'DECK',
    source_id: 'deck-456',
    priority: 'HIGH',
    is_pinned: false,
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-003',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'API_ERROR_SPIKE',
    notification_category: 'SYSTEM',
    channels: ['IN_APP', 'EMAIL'],
    title: 'API error rate increased',
    title_vi: 'Tỷ lệ lỗi API tăng cao',
    content: 'Error rate on /api/practice/submit has exceeded 5% threshold in the last 15 minutes.',
    content_vi: 'Tỷ lệ lỗi trên /api/practice/submit đã vượt ngưỡng 5% trong 15 phút qua.',
    action_type: 'NAVIGATE',
    action_url: '/admin/system/logs',
    action_label: 'Xem logs',
    source_service: 'SYSTEM',
    priority: 'URGENT',
    is_pinned: true,
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-004',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'BULK_IMPORT_COMPLETED',
    notification_category: 'SYSTEM',
    channels: ['IN_APP'],
    title: 'Bulk import completed',
    title_vi: 'Nhập dữ liệu hàng loạt hoàn tất',
    content: 'Vocabulary import job has completed successfully. 1,234 words imported.',
    content_vi: 'Công việc nhập từ vựng đã hoàn tất. 1,234 từ đã được nhập.',
    source_service: 'VOCABULARY',
    source_type: 'IMPORT_JOB',
    source_id: 'job-789',
    priority: 'NORMAL',
    is_pinned: false,
    is_read: true,
    read_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-005',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'PAYMENT_ISSUE',
    notification_category: 'SUBSCRIPTION',
    channels: ['IN_APP', 'EMAIL'],
    title: 'Payment failed for user',
    title_vi: 'Thanh toán thất bại',
    content: 'Payment for user "Ngọc Trâm" has failed. Subscription will expire in 3 days.',
    content_vi: 'Thanh toán của người dùng "Ngọc Trâm" thất bại. Đăng ký sẽ hết hạn trong 3 ngày.',
    action_type: 'NAVIGATE',
    action_url: '/admin/users/subscriptions/123',
    action_label: 'Xem chi tiết',
    source_service: 'USER',
    source_type: 'SUBSCRIPTION',
    source_id: 'sub-456',
    priority: 'HIGH',
    is_pinned: false,
    is_read: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-006',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'SUSPICIOUS_ACTIVITY',
    notification_category: 'SYSTEM',
    channels: ['IN_APP', 'EMAIL'],
    title: 'Suspicious activity detected',
    title_vi: 'Phát hiện hoạt động bất thường',
    content: 'Multiple failed login attempts detected from IP 192.168.1.100.',
    content_vi: 'Phát hiện nhiều lần đăng nhập thất bại từ IP 192.168.1.100.',
    action_type: 'NAVIGATE',
    action_url: '/admin/security/audit',
    action_label: 'Xem chi tiết',
    source_service: 'AUTH',
    source_type: 'AUDIT_LOG',
    priority: 'CRITICAL',
    is_pinned: true,
    is_read: false,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-007',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'AI_QUOTA_EXCEEDED',
    notification_category: 'AI',
    channels: ['IN_APP'],
    title: 'AI quota threshold reached',
    title_vi: 'Đạt ngưỡng quota AI',
    content: 'Platform AI evaluation quota has reached 85% of monthly limit.',
    content_vi: 'Quota đánh giá AI của nền tảng đã đạt 85% giới hạn hàng tháng.',
    source_service: 'AI',
    priority: 'NORMAL',
    is_pinned: false,
    is_read: true,
    read_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-008',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'COURSE_COMPLETED',
    notification_category: 'COURSE',
    channels: ['IN_APP'],
    title: 'Course completion milestone',
    title_vi: 'Cột mốc hoàn thành khóa học',
    content: '500 users have completed "English for Beginners" this week.',
    content_vi: '500 người dùng đã hoàn thành "Tiếng Anh cho người mới bắt đầu" tuần này.',
    source_service: 'COURSE',
    source_type: 'COURSE',
    source_id: 'course-001',
    priority: 'LOW',
    is_pinned: false,
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-009',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'USER_REPORT',
    notification_category: 'USER',
    channels: ['IN_APP', 'EMAIL'],
    title: 'User submitted report',
    title_vi: 'Người dùng gửi báo cáo',
    content: 'User "Phúc Hoàng" submitted a support request regarding subscription billing.',
    content_vi: 'Người dùng "Phúc Hoàng" gửi yêu cầu hỗ trợ về thanh toán đăng ký.',
    action_type: 'NAVIGATE',
    action_url: '/admin/support/tickets/789',
    action_label: 'Xem ticket',
    source_service: 'USER',
    source_type: 'SUPPORT_TICKET',
    source_id: 'ticket-789',
    priority: 'NORMAL',
    is_pinned: false,
    is_read: false,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-010',
    recipient_id: 'admin-001',
    recipient_type: 'ADMIN',
    notification_type: 'STREAK_MILESTONE',
    notification_category: 'GAMIFICATION',
    channels: ['IN_APP'],
    title: 'Community streak milestone',
    title_vi: 'Cột mốc streak cộng đồng',
    content: 'Average daily active streak has reached 15 days! 234 users have 30+ day streaks.',
    content_vi: 'Streak hoạt động hàng ngày trung bình đã đạt 15 ngày! 234 người dùng có streak 30+ ngày.',
    source_service: 'USER',
    priority: 'LOW',
    is_pinned: false,
    is_read: true,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

export function getNotificationStats(notifications: Notification[]): NotificationStats {
  const stats: NotificationStats = {
    total: notifications.length,
    unread: 0,
    read: 0,
    pinned: 0,
    byCategory: {},
    byPriority: {},
    byChannel: {},
  }

  notifications.forEach(n => {
    if (!n.is_read) stats.unread++
    if (n.is_read) stats.read++
    if (n.is_pinned) stats.pinned++

    stats.byCategory[n.notification_category] = (stats.byCategory[n.notification_category] || 0) + 1
    stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1
    n.channels.forEach(ch => {
      stats.byChannel[ch] = (stats.byChannel[ch] || 0) + 1
    })
  })

  return stats
}
