export interface SubscriptionPlan {
  id: string
  name_en: string
  name_vi: string
  slug: string
  plan_type: 'FREE' | 'BASIC' | 'PREMIUM' | 'PREMIUM_PLUS' | 'ENTERPRISE'
  tier: number
  price_monthly: number
  price_quarterly: number
  price_yearly: number
  currency: string
  ai_evaluation_quota_monthly: number
  ai_translation_quota_monthly: number
  ai_chat_quota_monthly: number
  max_flashcard_decks: number
  max_notes_limit: number
  max_custom_vocabulary: number
  has_ai_evaluation: boolean
  has_ai_translation: boolean
  has_ai_chat: boolean
  has_ai_tutor: boolean
  has_full_toeic_access: boolean
  has_full_topic_access: boolean
  has_full_deck_access: boolean
  has_full_grammar_access: boolean
  has_priority_support: boolean
  has_ad_free: boolean
  is_active: boolean
  is_featured: boolean
  display_order: number
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
  role: 'ADMIN' | 'TEACHER'
  avatar?: string
  last_active: string
  is_active: boolean
  created_at?: string
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name_en: 'Free Plan',
    name_vi: 'Gói Miễn Phí',
    slug: 'free',
    plan_type: 'FREE',
    tier: 0,
    price_monthly: 0,
    price_quarterly: 0,
    price_yearly: 0,
    currency: 'VND',
    ai_evaluation_quota_monthly: 0,
    ai_translation_quota_monthly: 10,
    ai_chat_quota_monthly: 5,
    max_flashcard_decks: 3,
    max_notes_limit: 50,
    max_custom_vocabulary: 100,
    has_ai_evaluation: false,
    has_ai_translation: true,
    has_ai_chat: false,
    has_ai_tutor: false,
    has_full_toeic_access: false,
    has_full_topic_access: false,
    has_full_deck_access: false,
    has_full_grammar_access: false,
    has_priority_support: false,
    has_ad_free: false,
    is_active: true,
    is_featured: false,
    display_order: 0,
  },
  {
    id: 'plan-premium',
    name_en: 'Premium Plan',
    name_vi: 'Gói Premium (Trả Phí)',
    slug: 'premium',
    plan_type: 'PREMIUM',
    tier: 1,
    price_monthly: 199000,
    price_quarterly: 537300,
    price_yearly: 1900000,
    currency: 'VND',
    ai_evaluation_quota_monthly: 200,
    ai_translation_quota_monthly: 1000,
    ai_chat_quota_monthly: 500,
    max_flashcard_decks: 999999,
    max_notes_limit: 999999,
    max_custom_vocabulary: 999999,
    has_ai_evaluation: true,
    has_ai_translation: true,
    has_ai_chat: true,
    has_ai_tutor: true,
    has_full_toeic_access: true,
    has_full_topic_access: true,
    has_full_deck_access: true,
    has_full_grammar_access: true,
    has_priority_support: true,
    has_ad_free: true,
    is_active: true,
    is_featured: true,
    display_order: 1,
  },
]

export const systemSettings: SystemSetting[] = [

  {
    id: 'setting-01',
    category: 'GENERAL',
    key: 'maintenance_mode',
    label_en: 'Maintenance Mode',
    label_vi: 'Chế độ bảo trì',
    value: false,
    type: 'boolean',
    description_en: 'Enable to put the platform in maintenance mode',
    description_vi: 'Bật để đưa nền tảng vào chế độ bảo trì',
  },
  {
    id: 'setting-02',
    category: 'GENERAL',
    key: 'registration_enabled',
    label_en: 'User Registration',
    label_vi: 'Cho phép đăng ký',
    value: true,
    type: 'boolean',
    description_en: 'Allow new users to register',
    description_vi: 'Cho phép người dùng mới đăng ký',
  },

  {
    id: 'setting-03',
    category: 'NOTIFICATION',
    key: 'email_verification_required',
    label_en: 'Email Verification Required',
    label_vi: 'Yêu cầu xác thực email',
    value: true,
    type: 'boolean',
    description_en: 'Require email verification before account activation',
    description_vi: 'Yêu cầu xác thực email trước khi kích hoạt tài khoản',
  },
  {
    id: 'setting-04',
    category: 'NOTIFICATION',
    key: 'default_language',
    label_en: 'Default Language',
    label_vi: 'Ngôn ngữ mặc định',
    value: 'vi',
    type: 'select',
    options: [
      { value: 'vi', label_en: 'Tiếng Việt', label_vi: 'Tiếng Việt' },
      { value: 'en', label_en: 'English', label_vi: 'English' },
    ],
  },

  {
    id: 'setting-05',
    category: 'SECURITY',
    key: 'max_login_attempts',
    label_en: 'Max Login Attempts',
    label_vi: 'Số lần đăng nhập tối đa',
    value: 5,
    type: 'number',
    description_en: 'Number of failed login attempts before lockout',
    description_vi: 'Số lần đăng nhập thất bại trước khi bị khóa',
  },
  {
    id: 'setting-06',
    category: 'SECURITY',
    key: 'password_min_length',
    label_en: 'Min Password Length',
    label_vi: 'Độ dài mật khẩu tối thiểu',
    value: 8,
    type: 'number',
  },
  {
    id: 'setting-07',
    category: 'SECURITY',
    key: 'session_timeout_hours',
    label_en: 'Session Timeout (hours)',
    label_vi: 'Hết hạn phiên (giờ)',
    value: 24,
    type: 'number',
  },

  {
    id: 'setting-08',
    category: 'AI',
    key: 'ai_evaluation_enabled',
    label_en: 'AI Evaluation',
    label_vi: 'Đánh giá AI',
    value: true,
    type: 'boolean',
    description_en: 'Enable AI-powered speaking and writing evaluation',
    description_vi: 'Bật đánh giá speaking và writing bằng AI',
  },
  {
    id: 'setting-09',
    category: 'AI',
    key: 'ai_chat_enabled',
    label_en: 'AI Chat/Tutor',
    label_vi: 'AI Chat/Tutor',
    value: true,
    type: 'boolean',
  },
  {
    id: 'setting-10',
    category: 'AI',
    key: 'ai_content_filtering',
    label_en: 'AI Content Filtering',
    label_vi: 'Lọc nội dung AI',
    value: true,
    type: 'boolean',
    description_en: 'Filter inappropriate content in AI responses',
    description_vi: 'Lọc nội dung không phù hợp trong câu trả lời AI',
  },
]

export const adminUsers: AdminUser[] = [
  {
    id: 'admin-001',
    name: 'Vân Anh',
    email: 'vananh@lingosphere.edu.vn',
    role: 'ADMIN',
    last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    id: 'admin-002',
    name: 'Minh Tuấn',
    email: 'minhtuan@lingosphere.edu.vn',
    role: 'ADMIN',
    last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    id: 'admin-003',
    name: 'Thanh Hà',
    email: 'thanhha@lingosphere.edu.vn',
    role: 'ADMIN',
    last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    id: 'admin-004',
    name: 'Hoàng Nam',
    email: 'hoangnam@lingosphere.edu.vn',
    role: 'ADMIN',
    last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_active: false,
  },
  {
    id: 'teacher-001',
    name: 'Lan Chi',
    email: 'lanchi@lingosphere.edu.vn',
    role: 'TEACHER',
    last_active: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    id: 'teacher-002',
    name: 'Đức Minh',
    email: 'ducminh@lingosphere.edu.vn',
    role: 'TEACHER',
    last_active: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    id: 'teacher-003',
    name: 'Thu Phương',
    email: 'thuphuong@lingosphere.edu.vn',
    role: 'TEACHER',
    last_active: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: false,
  },
]

export const roleLabels: Record<string, { vi: string; en: string }> = {
  ADMIN: { vi: 'Quản trị viên', en: 'Admin' },
  TEACHER: { vi: 'Giáo viên', en: 'Teacher' },
}

export const roleColors: Record<string, string> = {
  ADMIN: 'var(--primary)',
  TEACHER: 'var(--success)',
}
