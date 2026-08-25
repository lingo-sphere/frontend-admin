// ==========================================
// Base API Types
// ==========================================

export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data: T
  correlationId?: string
  timestamp?: string
  path?: string
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  correlationId?: string
  timestamp?: string
  path?: string
}

// ==========================================
// Auth & User Types
// ==========================================

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'LEARNER' | 'GUEST'

export interface AuthUser {
  user_id: string
  email: string
  role: UserRole | string
  full_name?: string
  avatar_url?: string
}

export interface LoginResponse {
  user: AuthUser
  access_token: string
  refresh_token?: string
}

export interface UserProfile {
  _id?: string
  user_id: string
  email: string
  full_name: string
  role?: string
  avatar_url?: string
  phone_number?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  date_of_birth?: string
  target_toeic_score?: number
  current_estimated_score?: number
  learning_goal_minutes_per_day?: number
  bio?: string
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED'
  is_premium: boolean
  current_plan_slug?: string
  total_xp?: number
  current_streak?: number
  level?: number
  gems?: number
  league?: string
  created_at?: string
  updated_at?: string
}

export interface SystemAnalyticsOverview {
  overview: {
    total_users: number
    total_vip_users: number
    active_users_today: number
    active_subscriptions: number
    total_system_xp: number
    avg_user_streak: number
    max_user_streak: number
  }
  timestamp: string
}

// ==========================================
// Role & Permission Types
// ==========================================

export interface Permission {
  _id: string
  name: string
  code: string
  module: string
  description?: string
  created_at?: string
}

export interface Role {
  _id: string
  name: string
  description?: string
  permissions: string[] | Permission[]
  is_system?: boolean
  created_at?: string
}

// ==========================================
// Course Types
// ==========================================

export type CourseCategory = 'TOEIC_LISTENING' | 'TOEIC_READING' | 'GRAMMAR' | 'VOCABULARY' | 'FULL_TEST' | 'GENERAL'
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type CourseApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT'

export interface LessonQuestion {
  _id?: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
  audio_url?: string
  image_url?: string
}

export interface Lesson {
  _id: string
  module_id: string
  title: string
  lesson_order: number
  duration_minutes: number
  video_url?: string
  content?: string
  is_preview?: boolean
  status?: string
  questions?: LessonQuestion[]
}

export interface CourseModule {
  _id: string
  course_id: string
  title: string
  module_order: number
  description?: string
  lessons?: Lesson[]
}

export interface Course {
  _id: string
  title: string
  slug?: string
  description: string
  category: CourseCategory | string
  level: CourseLevel | string
  target_score?: number
  price: number
  discount_price?: number
  thumbnail_url?: string
  author_id?: string
  approval_status: CourseApprovalStatus | string
  is_published?: boolean
  rating?: number
  students_count?: number
  skills?: string[]
  modules?: CourseModule[]
  created_at?: string
  updated_at?: string
}

// ==========================================
// Vocabulary Types
// ==========================================

export type WordType = 'NOUN' | 'VERB' | 'ADJECTIVE' | 'ADVERB' | 'PREPOSITION' | 'CONJUNCTION' | 'PRONOUN' | 'PHRASE'
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface WordMeaning {
  _id?: string
  meaning_order?: number
  part_of_speech?: string
  definition_en: string
  definition_vi: string
  short_meaning_vi?: string
  examples?: string[]
  synonyms?: string[]
  antonyms?: string[]
  collocations?: string[]
  is_primary?: boolean
}

export interface LexicalItem {
  _id: string
  word: string
  word_lowercase?: string
  slug?: string
  word_type: WordType | string
  cefr_level: CefrLevel | string
  pronunciation_us?: string
  pronunciation_uk?: string
  audio_url_us?: string
  audio_url_uk?: string
  syllables?: number
  stress_pattern?: string
  is_active: boolean
  meanings?: WordMeaning[]
  created_at?: string
  updated_at?: string
}

export interface Topic {
  _id: string
  name: string
  name_vi?: string
  slug: string
  description?: string
  icon_url?: string
  words_count?: number
  is_featured?: boolean
  status?: string
  created_at?: string
}

export interface IpaSymbol {
  _id: string
  symbol: string
  symbol_type: 'VOWEL' | 'DIPHTHONG' | 'CONSONANT' | string
  example_word: string
  audio_url?: string
  description?: string
  status?: string
}

export interface GrammarPoint {
  _id: string
  title: string
  title_vi?: string
  level: CefrLevel | string
  category?: string
  rule_explanation: string
  examples?: string[]
  created_at?: string
}

export interface FlashcardDeck {
  _id: string
  title: string
  description?: string
  creator_id?: string
  is_public: boolean
  is_system?: boolean
  total_cards: number
  rating?: number
  enrolled_count?: number
  tags?: string[]
  created_at?: string
}

// ==========================================
// Practice & Exam Types
// ==========================================

export interface PracticeQuestion {
  _id?: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
  skill_type?: string
  difficulty_level?: string
}

export interface PracticeSet {
  _id: string
  title: string
  description?: string
  category: string
  difficulty: string
  total_questions: number
  duration_minutes: number
  creator_id?: string
  is_active: boolean
  created_at?: string
}

export interface ListeningExercise {
  _id: string
  title: string
  audio_url: string
  transcript: string
  duration_seconds: number
  difficulty: string
  exercise_type: 'DICTATION' | 'MULTIPLE_CHOICE' | 'FILL_BLANK'
  created_at?: string
}

export interface SpeakingExercise {
  _id: string
  title: string
  prompt_text: string
  sample_audio_url?: string
  phonetic_guide?: string
  difficulty: string
  created_at?: string
}

export interface WritingExercise {
  _id: string
  title: string
  topic: string
  prompt: string
  min_words?: number
  sample_response?: string
  difficulty: string
  created_at?: string
}

export interface ToeicPart {
  _id: string
  part_number: number
  name: string
  description: string
  section: 'LISTENING' | 'READING'
  total_questions: number
}

export interface ToeicExam {
  _id: string
  title: string
  exam_code?: string
  exam_type: 'FULL' | 'MINI' | 'SECTION'
  duration_minutes: number
  total_questions: number
  difficulty: string
  is_free?: boolean
  is_published: boolean
  attempts_count?: number
  created_at?: string
}

// ==========================================
// Notification Types
// ==========================================

export type NotificationCategory =
  | 'AUTH'
  | 'USER'
  | 'SUBSCRIPTION'
  | 'VOCABULARY'
  | 'PRACTICE'
  | 'EXAM'
  | 'COURSE'
  | 'AI'
  | 'GAMIFICATION'
  | 'MARKETING'
  | 'SYSTEM'

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'

export interface AppNotification {
  _id: string
  title: string
  title_vi?: string
  content: string
  content_vi?: string
  category: NotificationCategory | string
  priority: NotificationPriority | string
  is_read: boolean
  is_pinned?: boolean
  action_url?: string
  created_at: string
}

// ==========================================
// AI & Media & Subscription Types
// ==========================================

export interface AiModelConfig {
  _id?: string
  name: string
  provider: string
  model_id: string
  is_active: boolean
  max_tokens: number
  temperature: number
}

export interface AiPromptTemplate {
  _id?: string
  key: string
  name: string
  category: string
  system_prompt: string
  user_prompt_template: string
  is_active: boolean
}

export interface StorageUsageReport {
  bucket_name: string
  total_files: number
  used_bytes: number
  used_mb: number
  quota_mb: number
  used_percentage: number
}

export interface SubscriptionPlan {
  _id?: string
  id?: string
  name: string
  slug: string
  tier: number
  price: number
  currency: string
  duration_days: number
  features: string[]
  is_active: boolean
  is_popular?: boolean
}
