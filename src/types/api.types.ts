/**
 * @file api.types.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho ứng dụng Quản trị Admin
 */

export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data: T
  correlationId?: string
  timestamp?: string
  path?: string
}

export interface PaginationMeta {
  current: number
  pageSize: number
  pages: number
  total: number
}

export interface PaginatedResult<T> {
  meta: PaginationMeta
  result: T[]
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  correlationId?: string
  timestamp?: string
  path?: string
}

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST'

export interface PermissionItem {
  _id: string
  method: string
  api_path: string
  module: string
  name: string
  description?: string | null
}

export interface AuthUser {
  user_id: string
  email: string
  role: UserRole | string
  role_id?: string | null
  full_name?: string | null
  avatar_url?: string | null
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
  role?: string | null
  avatar_url?: string | null
  phone_number?: string | null
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string | null
  date_of_birth?: string | null
  target_score?: number | null
  target_toeic_score?: number | null
  current_estimated_score?: number | null
  learning_goal_minutes_per_day?: number | null
  bio?: string | null
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | string
  is_premium: boolean
  current_plan_slug?: string | null
  total_xp?: number | null
  current_streak?: number | null
  level?: number | null
  gems?: number | null
  league?: string | null
  created_at?: string | null
  updated_at?: string | null
  last_login_at?: string | null
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

export type CourseCategory = 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS'
export type CourseApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT'

export interface QuizQuestionItem {
  id?: string
  question_text: string
  options: string[]
  correct_answer?: string | null
  explanation?: string | null
  media_url?: string | null
  audio_url?: string | null
  image_url?: string | null
  image_media_id?: string | null
  audio_media_id?: string | null
  skill_type?: string | null
  question_type?: string | null
  score_weight?: number | null
  part_number?: number | string | null
  part_name?: string | null
  order_index?: number | null
  prep_time_seconds?: number | null
  response_time_seconds?: number | null
  min_words?: number | null
}

export interface LessonQuestion {
  _id?: string
  id?: string
  question_text: string
  options: string[]
  correct_answer?: string | null
  explanation?: string | null
  media_url?: string | null
  audio_url?: string | null
  image_url?: string | null
  image_media_id?: string | null
  audio_media_id?: string | null
  skill_type?: string | null
  question_type?: string | null
  score_weight?: number | null
  part_number?: number | string | null
  part_name?: string | null
  order_index?: number | null
  prep_time_seconds?: number | null
  response_time_seconds?: number | null
  min_words?: number | null
}

export interface Lesson {
  _id: string
  id?: string
  module_id: string
  title: string
  order_index: number
  duration_seconds: number
  video_url?: string | null
  content_html?: string | null
  is_free_preview?: boolean
  status?: string
  questions?: LessonQuestion[]
  lesson_order?: number
  duration_minutes?: number | null
  content?: string | null
  is_preview?: boolean
  theory_file_url?: string | null
  theory_file_name?: string | null
}

export interface CourseModule {
  _id: string
  id?: string
  course_id: string
  title: string
  order_index: number
  description?: string | null
  is_free_preview?: boolean
  passing_score?: number | null
  test_questions?: QuizQuestionItem[]
  challenge_test_exam_id?: string | null
  challenge_passing_score?: number | null
  challenge_duration_minutes?: number | null
  challenge_questions?: QuizQuestionItem[]
  post_mini_test_exam_id?: string | null
  post_mini_passing_score?: number | null
  post_mini_duration_minutes?: number | null
  post_mini_questions?: QuizQuestionItem[]
  test_audio_url?: string | null
  challenge_audio_url?: string | null
  audio_url?: string | null
  theory_file_url?: string | null
  theory_file_name?: string | null
  lessons?: Lesson[]
  created_at?: string | null
  updated_at?: string | null
  module_order?: number
}

export interface Course {
  _id: string
  id?: string
  title: string
  slug?: string
  description: string
  category: CourseCategory | string
  target_score?: number | null
  price: number
  discount_price?: number | null
  thumbnail_url?: string | null
  document_url?: string | null
  document_name?: string | null
  author_id?: string | null
  author_name?: string | null
  author_email?: string | null
  author_avatar?: string | null
  author_title?: string | null
  author_bio?: string | null
  approval_status: CourseApprovalStatus | string
  is_published?: boolean
  pre_test_exam_id?: string | null
  final_test_exam_id?: string | null
  final_test_passing_score?: number | null
  final_test_duration_minutes?: number | null
  final_test_questions?: QuizQuestionItem[]
  final_test_audio_url?: string | null
  final_test_speaking_prompt?: string | null
  final_test_speaking_file_url?: string | null
  final_test_writing_prompt?: string | null
  final_test_writing_file_url?: string | null
  rating?: number | null
  students_count?: number | null
  is_bestseller?: boolean | null
  total_modules?: number | null
  total_lessons?: number | null
  skills?: string[]
  modules?: CourseModule[]
  curriculum?: CourseModule[]
  course?: Course
  created_at?: string | null
  updated_at?: string | null
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
  pronunciation?: string  // ✅ IPA pronunciation (backend field: p)
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
  pronunciation?: string  // ✅ IPA pronunciation (backend field: p)
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
  name_en?: string
  name_vi?: string
  name?: string
  slug: string
  description?: string
  icon_url?: string
  words_count?: number
  lexical_count?: number
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
  name: string
  name_vi?: string | null
  name_en?: string | null
  title?: string
  description?: string | null
  creator_id?: string | null
  creator_name?: string | null
  card_count?: number
  total_cards?: number
  visibility?: string
  is_public?: boolean
  is_system?: boolean
  rating?: number | null
  enrolled_count?: number | null
  tags?: string[]
  created_at?: string | null
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
  notification_category?: NotificationCategory | string
  priority: NotificationPriority | string
  is_read: boolean
  is_pinned?: boolean
  recipient_id?: string
  recipient_type?: string
  notification_type?: string
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


export interface SubscriptionPlan {
  _id?: string
  id?: string
  name?: string
  name_vi?: string | null
  name_en?: string | null
  slug: string
  plan_type?: 'FREE' | 'PREMIUM' | string
  tier: number
  price: number
  original_price?: number | null
  discount?: string | null
  currency: string
  duration_days: number
  billing_cycle?: string | null
  features: string[]
  is_active: boolean
  is_popular?: boolean
  price_monthly?: number | null
  price_yearly?: number | null
  badge?: string | null
  created_at?: string | null
}

export interface UserActivityLog {
  id: string
  userId?: string
  userName: string
  userEmail: string
  userAvatar?: string | null
  actionType: string
  actionNameVi: string
  actionNameEn: string
  detail: string
  scoreOrXP?: string | null
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
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
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
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
