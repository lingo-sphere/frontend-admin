/**
 * @file settings-data.ts
 * @description Mã nguồn thành phần settings-data.ts
 */

export interface SubscriptionPlan {
  id: string
  name_en: string
  name_vi: string
  slug: string
  plan_type: 'FREE' | 'PREMIUM'
  tier: number
  price_monthly: number
  currency: string
  features?: string[]
  is_active: boolean
  is_featured: boolean
}

export interface SystemSetting {
  id: string
  category: 'GENERAL' | 'NOTIFICATION' | 'SECURITY' | 'INTEGRATION' | 'AI'
  key: string
  label_en: string
  label_vi: string
  value: string | boolean | number
  type: 'text' | 'boolean' | 'number' | 'select'
  options?: { value: string; label_en: string; label_vi: string }[]
  description_en?: string
  description_vi?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'INSTRUCTOR'
  avatar?: string
  last_active: string
  is_active: boolean
  created_at?: string
}

export const systemSettings: SystemSetting[] = [
  {
    id: 'set-01',
    category: 'GENERAL',
    key: 'site_name',
    label_en: 'Platform Name',
    label_vi: 'Tên Nền Tảng',
    value: 'LingoSphere Learning Platform',
    type: 'text',
    description_vi: 'Tên thương hiệu hiển thị trên web & app',
  },
  {
    id: 'set-02',
    category: 'GENERAL',
    key: 'maintenance_mode',
    label_en: 'Maintenance Mode',
    label_vi: 'Chế độ Bảo trì',
    value: false,
    type: 'boolean',
    description_vi: 'Tạm khóa truy cập của học viên khi bảo trì hệ thống',
  },
  {
    id: 'set-03',
    category: 'AI',
    key: 'default_ai_provider',
    label_en: 'Primary AI Engine',
    label_vi: 'Engine AI Chính',
    value: 'groq',
    type: 'select',
    options: [
      { value: 'groq', label_en: 'Groq Cloud LPU (Ultra Fast)', label_vi: 'Groq Cloud LPU (Siêu tốc)' },
      { value: 'gemini', label_en: 'Google Gemini Flash', label_vi: 'Google Gemini Flash (Sư phạm)' },
    ],
    description_vi: 'Mô hình ngôn ngữ mặc định hỗ trợ giải đề và gia sư',
  },
  {
    id: 'set-04',
    category: 'SECURITY',
    key: 'jwt_access_expiry_minutes',
    label_en: 'JWT Access Token Expiry (mins)',
    label_vi: 'Thời hạn Access Token (phút)',
    value: 15,
    type: 'number',
    description_vi: 'Thời gian hiệu lực của token đăng nhập',
  },
  {
    id: 'set-05',
    category: 'NOTIFICATION',
    key: 'email_notifications_enabled',
    label_en: 'Email Dispatcher',
    label_vi: 'Gửi Email Thông Báo',
    value: true,
    type: 'boolean',
    description_vi: 'Kích hoạt hàng đợi RabbitMQ gửi email cho học viên',
  },
]
