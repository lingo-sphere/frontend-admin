// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ progress trong Admin.

import { z } from 'zod'

export const StudentModuleProgressSchema = z.object({
  module_id: z.string(),
  title: z.string().optional(),
  order_index: z.number().optional(),
  status: z.string().optional(),
  challenge_score: z.number().optional(),
  challenge_taken: z.boolean().optional(),
  is_passed_by_challenge: z.boolean().optional(),
  post_mini_score: z.number().optional(),
  best_score: z.number().optional(),
}).passthrough()

export const LearnerStudyScheduleSchema = z.object({
  days_of_week: z.array(z.union([z.number(), z.string()])).default([]),
  reminder_time: z.string().default('19:30'),
  duration_minutes: z.number().default(45),
  is_active: z.boolean().default(true),
  consecutive_missed_sessions: z.number().default(0),
  last_reminded_at: z.string().optional(),
}).passthrough()

export const LearnerLockStateSchema = z.object({
  is_locked: z.boolean().default(false),
  locked_at: z.string().optional(),
  locked_chapter_order: z.number().optional(),
  retest_required_module_id: z.string().optional(),
  unlocked_at: z.string().optional(),
}).passthrough()

export const StudentProgressItemSchema = z.object({
  user_id: z.string(),
  full_name: z.string().optional(),
  email: z.string().optional(),
  avatar_url: z.string().optional(),
  status: z.string().optional(),
  course_id: z.string().optional(),
  course_title: z.string().optional(),
  progress_percentage: z.number(),
  completed_lessons: z.number(),
  total_lessons: z.number(),
  baseline_score: z.number().optional(),
  baseline_source: z.string().optional(),
  final_test_score: z.number().optional(),
  total_score_growth: z.number().nullable().optional(),
  baseline_scale: z.string().optional(),
  final_test_passed: z.boolean().optional(),
  measurement_summary: z.object({ internal_delta: z.number().nullable(), comparable: z.boolean(), baseline_internal: z.number().nullable(), latest_internal: z.number().nullable() }).passthrough().nullable().optional(),
  modules_progress: z.array(StudentModuleProgressSchema).optional(),
  schedule: LearnerStudyScheduleSchema.optional(),
  lock_state: LearnerLockStateSchema.optional(),
  last_video_watched_at: z.unknown().optional(),
  last_accessed_at: z.unknown().optional(),
  created_at: z.unknown().optional(),
}).passthrough()

export const CourseStudentsProgressResponseSchema = z.object({
  course_id: z.string(),
  total_students: z.number(),
  completed_students: z.number(),
  average_progress_percentage: z.number(),
  students: z.array(StudentProgressItemSchema),
}).passthrough()

export const AiSubmissionFeedbackSchema = z.object({
  pronunciation_score: z.number().nullable().optional(),
  fluency_score: z.number().nullable().optional(),
  grammar_score: z.number().optional(),
  vocabulary_score: z.number().optional(),
  overall_score: z.number().optional(),
  detailed_comment: z.string().optional(),
  improvement_tips: z.array(z.string()).default([]),
}).passthrough()

export const SkillSubmissionItemSchema = z.object({
  _id: z.string(),
  user_id: z.string(),
  user_name: z.string().default(''),
  user_email: z.string().optional(),
  course_id: z.string(),
  course_title: z.string().optional(),
  module_id: z.string().optional(),
  test_type: z.string().optional(),
  skill: z.enum(['SPEAKING', 'WRITING', 'LISTENING', 'READING']).or(z.string()),
  audio_url: z.string().optional(),
  essay_text: z.string().optional(),
  whisper_transcript: z.string().optional(),
  ai_score: z.number().nullable().default(null),
  ai_feedback: AiSubmissionFeedbackSchema.optional(),
  teacher_score: z.number().optional(),
  teacher_feedback: z.string().optional(),
  teacher_id: z.string().optional(),
  teacher_name: z.string().optional(),
  is_teacher_reviewed: z.boolean().default(false),
  final_score: z.number().nullable().default(null),
  status: z.string().default('SUBMITTED'),
  created_at: z.string().optional(),
}).passthrough()

export const SkillSubmissionListSchema = z.array(SkillSubmissionItemSchema)

export const CourseTestSessionSchema = z.object({
  _id: z.string(),
  user_id: z.string(),
  course_id: z.string(),
  module_id: z.string().nullish(),
  test_type: z.string(),
  status: z.string(),
  order_index: z.number().optional(),
  score: z.number().nullable().optional(),
  is_passed: z.boolean().nullable().optional(),
  passing_score: z.number().optional(),
  started_at: z.string(),
  submitted_at: z.string().nullish(),
  raw_questions: z.array(z.record(z.string(), z.unknown())).default([]),
  interim_answers: z.array(z.object({
    question_index: z.number(),
    selected_index: z.number().nullish(),
    selected_option: z.string().nullish(),
  }).passthrough()).default([]),
  result: z.record(z.string(), z.unknown()).nullish(),
}).passthrough()

export const CourseTestSessionListSchema = z.array(CourseTestSessionSchema)
export type CourseTestSession = z.infer<typeof CourseTestSessionSchema>

export const ServiceHealthItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  port: z.number().default(0),
  type: z.string().default(''),
  description: z.string().default(''),
  status: z.enum(['OPERATIONAL', 'DEGRADED', 'DOWN']).default('OPERATIONAL'),
  latency_ms: z.number().default(0),
  uptime_percentage: z.number().default(100),
  last_heartbeat: z.string().default(''),
  checked_at: z.string().default(''),
}).passthrough()

export const BetterStackIncidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['RESOLVED', 'INVESTIGATING', 'MONITORING']).default('RESOLVED'),
  impact: z.enum(['NONE', 'MINOR', 'MAJOR', 'CRITICAL']).default('NONE'),
  created_at: z.string(),
  resolved_at: z.string().optional(),
}).passthrough()

export const BetterStackLogItemSchema = z.object({
  timestamp: z.string(),
  level: z.enum(['INFO', 'WARN', 'ERROR', 'DEBUG']).default('INFO'),
  source: z.string().default(''),
  message: z.string(),
  method: z.string().optional(),
  path: z.string().optional(),
  target_service: z.string().optional(),
  correlation_id: z.string().optional(),
}).passthrough()

export const BetterStackMonitoringDataSchema = z.object({
  provider: z.string().default('BetterStack'),
  overall_status: z.enum(['ALL_SYSTEMS_OPERATIONAL', 'DEGRADED', 'OUTAGE']).default('ALL_SYSTEMS_OPERATIONAL'),
  uptime_percentage: z.number().default(100),
  average_latency_ms: z.number().default(0),
  monitored_services_count: z.number().default(0),
  healthy_services_count: z.number().default(0),
  incident_count_last_30d: z.number().default(0),
  total_logs_count: z.number().optional(),
  last_synced_at: z.string().default(''),
  status_page_url: z.string().default(''),
  services: z.array(ServiceHealthItemSchema).default([]),
  recent_incidents: z.array(BetterStackIncidentSchema).default([]),
  live_logs: z.array(BetterStackLogItemSchema).optional(),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }).optional(),
}).passthrough()

export const PostHogTopEventSchema = z.object({
  event_name: z.string(),
  count: z.number().default(0),
  label: z.string().default(''),
}).passthrough()

export const PostHogTopPageSchema = z.object({
  path: z.string(),
  views: z.number().default(0),
  unique_visitors: z.number().default(0),
}).passthrough()

export const PostHogSessionReplaySchema = z.object({
  session_id: z.string(),
  user_email: z.string(),
  duration_seconds: z.number().default(0),
  events_count: z.number().default(0),
  device: z.string().default(''),
  created_at: z.string(),
  replay_url: z.string().default(''),
}).passthrough()

export const PostHogLiveEventItemSchema = z.object({
  id: z.string(),
  event: z.string(),
  user_email: z.string(),
  properties: z.record(z.string(), z.unknown()).default({}),
  timestamp: z.string(),
}).passthrough()

export const PostHogAnalyticsDataSchema = z.object({
  provider: z.string().default('PostHog'),
  project_id: z.string().default(''),
  project_name: z.string().default(''),
  dashboard_url: z.string().default(''),
  session_replays_url: z.string().default(''),
  time_range: z.string().default(''),
  metrics: z.object({
    total_pageviews: z.number().default(0),
    unique_visitors: z.number().default(0),
    identified_users: z.number().default(0),
    total_session_replays: z.number().default(0),
    custom_learning_events: z.number().default(0),
    avg_session_duration_minutes: z.number().default(0),
    bounce_rate_percentage: z.number().default(0),
  }).default({
    total_pageviews: 0,
    unique_visitors: 0,
    identified_users: 0,
    total_session_replays: 0,
    custom_learning_events: 0,
    avg_session_duration_minutes: 0,
    bounce_rate_percentage: 0,
  }),
  top_events: z.array(PostHogTopEventSchema).default([]),
  top_pages: z.array(PostHogTopPageSchema).default([]),
  recent_replays: z.array(PostHogSessionReplaySchema).default([]),
  live_events: z.array(PostHogLiveEventItemSchema).default([]),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }).optional(),
}).passthrough()

export type StudentModuleProgress = z.infer<typeof StudentModuleProgressSchema>
export type LearnerStudySchedule = z.infer<typeof LearnerStudyScheduleSchema>
export type LearnerLockState = z.infer<typeof LearnerLockStateSchema>
export type StudentProgressItem = z.infer<typeof StudentProgressItemSchema>
export type CourseStudentsProgressResponse = z.infer<typeof CourseStudentsProgressResponseSchema>
export type SkillSubmissionItem = z.infer<typeof SkillSubmissionItemSchema>
export type ServiceHealthItem = z.infer<typeof ServiceHealthItemSchema>
export type BetterStackIncident = z.infer<typeof BetterStackIncidentSchema>
export type BetterStackLogItem = z.infer<typeof BetterStackLogItemSchema>
export type BetterStackMonitoringData = z.infer<typeof BetterStackMonitoringDataSchema>
export type PostHogTopEvent = z.infer<typeof PostHogTopEventSchema>
export type PostHogTopPage = z.infer<typeof PostHogTopPageSchema>
export type PostHogSessionReplay = z.infer<typeof PostHogSessionReplaySchema>
export type PostHogLiveEventItem = z.infer<typeof PostHogLiveEventItemSchema>
export type PostHogAnalyticsData = z.infer<typeof PostHogAnalyticsDataSchema>
