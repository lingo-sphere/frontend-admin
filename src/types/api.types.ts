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

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'LEARNER' | 'GUEST'

export interface PermissionItem {
  _id: string
  method: string
  api_path: string
  module: string
  name: string
  description?: string
}

export interface AuthUser {
  user_id: string
  email: string
  role: UserRole | string
  role_id?: string
  full_name?: string
  avatar_url?: string
  permissions?: PermissionItem[]
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
  recent_activities?: UserActivityLog[]
  timestamp?: string | Date
}

export interface Permission {
  _id: string
  name: string
  code?: string
  api_path?: string
  method?: string
  module: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Role {
  _id: string
  name: string
  description?: string
  permissions: string[] | Permission[]
  is_active?: boolean
  is_system?: boolean
  created_at?: string
  updated_at?: string
}

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

export interface Word {
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
  bucket_name?: string
  total_files?: number
  used_bytes?: number
  used_mb?: number
  quota_mb?: number
  used_percentage?: number
  system_storage?: {
    used_bytes: number
    used_mb: number
    used_gb: number
    max_gb: number
    usage_percent: number
    total_files: number
    is_quota_exceeded: boolean
  }
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

export interface UserActivityLog {
  id: string
  userId?: string
  userName: string
  userEmail: string
  userAvatar?: string
  actionType: string
  actionNameVi: string
  actionNameEn: string
  detail: string
  scoreOrXP?: string
  platform: string
  timestamp: string | Date
}

export interface ServiceHealthItem {
  id: string
  name: string
  port: number
  type: string
  description: string
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN'
  latency_ms: number
  uptime_percentage: number
  last_heartbeat: string
  checked_at: string
}

export interface BetterStackIncident {
  id: string
  title: string
  status: 'RESOLVED' | 'INVESTIGATING' | 'MONITORING'
  impact: 'NONE' | 'MINOR' | 'MAJOR' | 'CRITICAL'
  created_at: string
  resolved_at?: string
}

export interface BetterStackLogItem {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  source: string
  message: string
  method?: string
  path?: string
  target_service?: string
  correlation_id?: string
}

export interface BetterStackMonitoringData {
  provider: string
  overall_status: 'ALL_SYSTEMS_OPERATIONAL' | 'DEGRADED' | 'OUTAGE'
  uptime_percentage: number
  average_latency_ms: number
  monitored_services_count: number
  healthy_services_count: number
  incident_count_last_30d: number
  total_logs_count?: number
  last_synced_at: string
  status_page_url: string
  services: ServiceHealthItem[]
  recent_incidents: BetterStackIncident[]
  live_logs?: BetterStackLogItem[]
}

export interface PostHogTopEvent {
  event_name: string
  count: number
  label: string
}

export interface PostHogTopPage {
  path: string
  views: number
  unique_visitors: number
}

export interface PostHogSessionReplay {
  session_id: string
  user_email: string
  duration_seconds: number
  events_count: number
  device: string
  created_at: string
  replay_url: string
}

export interface PostHogLiveEventItem {
  id: string
  event: string
  user_email: string
  properties: Record<string, unknown>
  timestamp: string
}

export interface PostHogAnalyticsData {
  provider: string
  project_id: string
  project_name: string
  dashboard_url: string
  session_replays_url: string
  time_range: string
  metrics: {
    total_pageviews: number
    unique_visitors: number
    identified_users: number
    total_session_replays: number
    custom_learning_events: number
    avg_session_duration_minutes: number
    bounce_rate_percentage: number
  }
  top_events: PostHogTopEvent[]
  top_pages: PostHogTopPage[]
  recent_replays: PostHogSessionReplay[]
  live_events: PostHogLiveEventItem[]
}
