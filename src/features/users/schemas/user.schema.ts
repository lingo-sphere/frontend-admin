/**
 * @file user.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ user và auth
 */

import { z } from 'zod'

export const PermissionItemSchema = z.object({
  _id: z.string(),
  method: z.string(),
  api_path: z.string(),
  module: z.string(),
  name: z.string(),
  description: z.string().optional(),
}).passthrough()

export const AuthUserSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  role: z.string(),
  role_id: z.string().optional(),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  permissions: z.array(PermissionItemSchema).optional(),
}).passthrough()

export const UserProfileSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  user_id: z.string(),
  full_name: z.string(),
  email: z.string(),
  role: z.string().optional(),
  status: z.enum(['ACTIVE', 'BLOCKED', 'SUSPENDED']).default('ACTIVE'),
  is_premium: z.boolean().default(false),
  avatar_url: z.string().optional(),
  phone_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bio: z.string().optional(),
  target_toeic_score: z.number().optional(),
  current_estimated_score: z.number().optional(),
  learning_goal_minutes_per_day: z.number().optional(),
  current_plan_slug: z.string().optional(),
  total_xp: z.number().optional(),
  current_streak: z.number().optional(),
  level: z.number().optional(),
  gems: z.number().optional(),
  league: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  last_login_at: z.string().optional(),
})

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
  name_vi: z.string().optional(),
  name_en: z.string().optional(),
  slug: z.string(),
  plan_type: z.enum(['FREE', 'PREMIUM']).optional(),
  tier: z.number().default(1),
  price: z.number().default(0),
  original_price: z.number().optional(),
  discount: z.string().optional(),
  currency: z.string().default('VND'),
  duration_days: z.number().default(30),
  billing_cycle: z.string().optional(),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_popular: z.boolean().optional(),
  price_monthly: z.number().optional(),
  price_yearly: z.number().optional(),
  badge: z.string().optional(),
  created_at: z.string().optional(),
})

export const SubscriptionPlanListSchema = z.array(SubscriptionPlanSchema)

export const UserActivityLogSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  userName: z.string(),
  userEmail: z.string(),
  userAvatar: z.string().optional(),
  actionType: z.string().default('ACTIVITY'),
  actionNameVi: z.string().default(''),
  actionNameEn: z.string().default(''),
  detail: z.string().default(''),
  scoreOrXP: z.string().optional(),
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
