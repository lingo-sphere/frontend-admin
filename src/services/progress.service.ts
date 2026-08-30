import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { BetterStackMonitoringData, PostHogAnalyticsData } from '@/types/api.types'

export interface StudentProgressItem {
  user_id: string
  full_name?: string
  email?: string
  progress_percentage: number
  completed_lessons: number
  total_lessons: number
  last_studied_at?: string
}

export const progressService = {
  async getCourseStudentsProgress(courseId: string): Promise<StudentProgressItem[]> {
    return api.get<StudentProgressItem[]>(API_CONFIG.ENDPOINTS.PROGRESS.STUDENTS(courseId))
  },

  async getGrowthChart(courseId: string): Promise<unknown> {
    return api.get(API_CONFIG.ENDPOINTS.PROGRESS.GROWTH_CHART(courseId))
  },

  async getMyProgress(): Promise<unknown[]> {
    return api.get<unknown[]>(API_CONFIG.ENDPOINTS.PROGRESS.MY_COURSES)
  },

  async getBetterStackMonitoring(params?: {
    page?: number
    limit?: number
    search?: string
    level?: string
  }): Promise<BetterStackMonitoringData> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.search) query.set('search', params.search)
    if (params?.level) query.set('level', params.level)
    const qs = query.toString()
    const endpoint = qs
      ? `${API_CONFIG.ENDPOINTS.PROGRESS.MONITORING_BETTERSTACK}?${qs}`
      : API_CONFIG.ENDPOINTS.PROGRESS.MONITORING_BETTERSTACK
    return api.get<BetterStackMonitoringData>(endpoint)
  },

  async getPostHogAnalytics(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PostHogAnalyticsData> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    const endpoint = qs
      ? `${API_CONFIG.ENDPOINTS.PROGRESS.ANALYTICS_POSTHOG}?${qs}`
      : API_CONFIG.ENDPOINTS.PROGRESS.ANALYTICS_POSTHOG
    return api.get<PostHogAnalyticsData>(endpoint)
  },
}
