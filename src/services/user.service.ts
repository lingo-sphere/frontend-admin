/**
 * @file user.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ user
 */

import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { PaginatedResult, SystemAnalyticsOverview, UserProfile, SubscriptionPlan } from '@/types/api.types'

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  plan?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const userService = {

  async getAllUsers(params?: UserQueryParams): Promise<PaginatedResult<UserProfile>> {
    return api.get<PaginatedResult<UserProfile>>(API_CONFIG.ENDPOINTS.USERS.ADMIN_USERS, params as Record<string, unknown>)
  },

  async createAdminUser(data: { email: string; password?: string; full_name: string; role: string; status?: string }): Promise<UserProfile> {
    return api.post<UserProfile>(API_CONFIG.ENDPOINTS.USERS.CREATE_ADMIN_USER, data)
  },

  async updateAdminUser(userId: string, data: Partial<{ email: string; password?: string; full_name: string; role: string; status?: string }>): Promise<UserProfile> {
    return api.post<UserProfile>(API_CONFIG.ENDPOINTS.USERS.UPDATE_ADMIN_USER(userId), data)
  },

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED', reason?: string): Promise<{ message: string; user_id: string; status: string }> {
    return api.patch<{ message: string; user_id: string; status: string }>(
      API_CONFIG.ENDPOINTS.USERS.UPDATE_STATUS(userId),
      { status, reason },
    )
  },

  async getSystemAnalytics(): Promise<SystemAnalyticsOverview> {
    return api.get<SystemAnalyticsOverview>(API_CONFIG.ENDPOINTS.USERS.ADMIN_ANALYTICS)
  },

  async getMyProfile(): Promise<UserProfile> {
    const res = await api.get<{ profile: UserProfile } | UserProfile>(API_CONFIG.ENDPOINTS.USERS.PROFILE)
    return (res as { profile: UserProfile })?.profile || (res as UserProfile)
  },

  async getProfileById(userId: string): Promise<UserProfile> {
    const res = await api.get<{ profile: UserProfile } | UserProfile>(API_CONFIG.ENDPOINTS.USERS.PROFILE_BY_ID(userId))
    return (res as { profile: UserProfile })?.profile || (res as UserProfile)
  },

  async updateMyProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return api.put<UserProfile>(API_CONFIG.ENDPOINTS.USERS.PROFILE, data)
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return api.get<SubscriptionPlan[]>(API_CONFIG.ENDPOINTS.USERS.SUBSCRIPTION_PLANS)
  },

  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return api.post<SubscriptionPlan>(API_CONFIG.ENDPOINTS.USERS.SUBSCRIPTION_PLANS, plan)
  },

  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return api.put<SubscriptionPlan>(API_CONFIG.ENDPOINTS.USERS.SUBSCRIPTION_PLAN_BY_ID(id), plan)
  },
}
