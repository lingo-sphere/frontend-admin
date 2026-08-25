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
  // Lấy danh sách người dùng hệ thống (Admin & Learners)
  async getAllUsers(params?: UserQueryParams): Promise<PaginatedResult<UserProfile>> {
    return api.get<PaginatedResult<UserProfile>>(API_CONFIG.ENDPOINTS.USERS.ADMIN_USERS, params as Record<string, unknown>)
  },

  // Cập nhật trạng thái người dùng (ACTIVE, BLOCKED, SUSPENDED)
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED', reason?: string): Promise<{ message: string; user_id: string; status: string }> {
    return api.patch<{ message: string; user_id: string; status: string }>(
      API_CONFIG.ENDPOINTS.USERS.UPDATE_STATUS(userId),
      { status, reason },
    )
  },

  // Thống kê phân tích tổng quan hệ thống
  async getSystemAnalytics(): Promise<SystemAnalyticsOverview> {
    return api.get<SystemAnalyticsOverview>(API_CONFIG.ENDPOINTS.USERS.ADMIN_ANALYTICS)
  },

  // Lấy hồ sơ tài khoản đang đăng nhập
  async getMyProfile(): Promise<UserProfile> {
    const res = await api.get<{ profile: UserProfile } | UserProfile>(API_CONFIG.ENDPOINTS.USERS.PROFILE)
    return (res as { profile: UserProfile })?.profile || (res as UserProfile)
  },

  // Lấy hồ sơ theo User ID
  async getProfileById(userId: string): Promise<UserProfile> {
    const res = await api.get<{ profile: UserProfile } | UserProfile>(API_CONFIG.ENDPOINTS.USERS.PROFILE_BY_ID(userId))
    return (res as { profile: UserProfile })?.profile || (res as UserProfile)
  },

  // Cập nhật hồ sơ tài khoản
  async updateMyProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return api.put<UserProfile>(API_CONFIG.ENDPOINTS.USERS.PROFILE, data)
  },

  // Danh sách gói cước Subscription
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return api.get<SubscriptionPlan[]>(API_CONFIG.ENDPOINTS.USERS.SUBSCRIPTION_PLANS)
  },

  // Tạo gói cước Subscription mới
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return api.post<SubscriptionPlan>(API_CONFIG.ENDPOINTS.USERS.SUBSCRIPTION_PLANS, plan)
  },
}
