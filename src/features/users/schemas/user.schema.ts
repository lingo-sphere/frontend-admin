// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ user và auth trong Admin.

import { z } from 'zod'

export const PermissionItemSchema = z.object({
  _id: z.string(),
  method: z.string(),
  api_path: z.string(),
  module: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
}).passthrough()

export const AuthUserSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  role: z.string(),
  role_id: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  permissions: z.array(PermissionItemSchema).optional(),
}).passthrough()

export const UserProfileSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  user_id: z.string(),
  full_name: z.string().default(''),
  email: z.string(),
  role: z.string().nullable().optional(),
  status: z.string().default('ACTIVE'),
  is_premium: z.boolean().default(false),
  avatar_url: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  target_score: z.number().nullable().optional(),
  target_toeic_score: z.number().nullable().optional(),
  current_estimated_score: z.number().nullable().optional(),
  learning_goal_minutes_per_day: z.number().nullable().optional(),
  current_plan_slug: z.string().nullable().optional(),
  total_xp: z.number().nullable().optional(),
  current_streak: z.number().nullable().optional(),
  level: z.number().nullable().optional(),
  gems: z.number().nullable().optional(),
  league: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  last_login_at: z.string().nullable().optional(),
}).passthrough()

export const PaginationMetaSchema = z.object({
  current: z.number().optional(),
  pageSize: z.number().optional(),
  total: z.number().optional(),
  pages: z.number().optional(),
}).passthrough()

export const PaginatedUserProfilesSchema = z.object({
  result: z.array(UserProfileSchema),
  meta: PaginationMetaSchema.optional(),
}).passthrough()

export const SubscriptionPlanSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  name_vi: z.string().nullable().optional(),
  name_en: z.string().nullable().optional(),
  slug: z.string(),
  plan_type: z.string().optional(),
  tier: z.number().default(1),
  price: z.number().default(0),
  original_price: z.number().nullable().optional(),
  discount: z.string().nullable().optional(),
  currency: z.string().default('VND'),
  duration_days: z.number().default(30),
  billing_cycle: z.string().nullable().optional(),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_popular: z.boolean().optional(),
  price_monthly: z.number().nullable().optional(),
  price_yearly: z.number().nullable().optional(),
  badge: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
}).passthrough()

export const SubscriptionPlanListSchema = z.array(SubscriptionPlanSchema)

export const UserActivityLogSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  userName: z.string(),
  userEmail: z.string(),
  userAvatar: z.string().nullable().optional(),
  actionType: z.string().default('ACTIVITY'),
  actionNameVi: z.string().default(''),
  actionNameEn: z.string().default(''),
  detail: z.string().default(''),
  scoreOrXP: z.string().nullable().optional(),
  platform: z.string().default('WEB'),
  timestamp: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
}).passthrough()

export const SystemAnalyticsOverviewSchema = z.object({
  overview: z.object({
    total_users: z.number().default(0),
    total_vip_users: z.number().default(0),
    active_users_today: z.number().default(0),
    active_subscriptions: z.number().default(0),
    total_system_xp: z.number().default(0),
    avg_user_streak: z.number().default(0),
    max_user_streak: z.number().default(0),
  }).passthrough(),
  recent_activities: z.array(UserActivityLogSchema).optional(),
  timestamp: z.union([z.string(), z.date()]).optional(),
}).passthrough()

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  access_token: z.string(),
  refresh_token: z.string().optional(),
}).passthrough()

export type PermissionItem = z.infer<typeof PermissionItemSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
export type PaginatedUserProfiles = z.infer<typeof PaginatedUserProfilesSchema>
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>
export type UserActivityLog = z.infer<typeof UserActivityLogSchema>
export type SystemAnalyticsOverview = z.infer<typeof SystemAnalyticsOverviewSchema>
