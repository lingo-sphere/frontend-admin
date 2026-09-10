/**
 * @file progress.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ progress và quản lý bài nộp kỹ năng Speaking/Writing của học viên cho giáo viên chấm/sửa điểm
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  type StudentModuleProgress,
  type StudentProgressItem,
  type CourseStudentsProgressResponse,
  type SkillSubmissionItem,
  type BetterStackMonitoringData,
  type PostHogAnalyticsData,
  type LearnerStudySchedule,
  type LearnerLockState,
  CourseStudentsProgressResponseSchema,
  SkillSubmissionListSchema,
  SkillSubmissionItemSchema,
  BetterStackMonitoringDataSchema,
  PostHogAnalyticsDataSchema,
} from '@/features/progress/schemas/progress.schema'

export type {
  StudentModuleProgress,
  StudentProgressItem,
  CourseStudentsProgressResponse,
  SkillSubmissionItem,
  BetterStackMonitoringData,
  PostHogAnalyticsData,
  LearnerStudySchedule,
  LearnerLockState,
}

export const progressService = {
  async getCourseStudentsProgress(courseId: string): Promise<CourseStudentsProgressResponse> {
    return api.get<CourseStudentsProgressResponse>(
      API_CONFIG.ENDPOINTS.PROGRESS.STUDENTS(courseId),
      undefined,
      CourseStudentsProgressResponseSchema
    )
  },

  async getGrowthChart(courseId: string): Promise<unknown> {
    return api.get(API_CONFIG.ENDPOINTS.PROGRESS.GROWTH_CHART(courseId))
  },

  async getMyProgress(): Promise<unknown[]> {
    return api.get<unknown[]>(API_CONFIG.ENDPOINTS.PROGRESS.MY_COURSES)
  },

  async getStudentCourseProgressDetail(courseId: string, userId: string): Promise<{
    course_progress: {
      user_id: string
      course_id: string
      progress_percentage: number
      completed_lessons_count: number
      total_lessons_count: number
      completed_modules_count: number
      total_modules_count: number
      baseline_score?: number
      baseline_source?: string
      final_test_score?: number
      total_score_growth?: number
      status?: string
    } | null
    modules_progress: StudentModuleProgress[]
    completed_lesson_ids: string[]
  }> {
    return api.get(`/progress/teacher/courses/${courseId}/students/${userId}/detail`)
  },

  async getCourseSubmissions(courseId: string, moduleId?: string, userId?: string): Promise<SkillSubmissionItem[]> {
    const params = new URLSearchParams()
    if (moduleId) params.append('moduleId', moduleId)
    if (userId) params.append('userId', userId)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return api.get<SkillSubmissionItem[]>(
      `/progress/teacher/courses/${courseId}/submissions${qs}`,
      undefined,
      SkillSubmissionListSchema
    )
  },

  async reviewSubmission(
    submissionId: string,
    data: { teacher_score: number; teacher_feedback?: string }
  ): Promise<SkillSubmissionItem> {
    return api.post<SkillSubmissionItem>(
      `/progress/teacher/submissions/${submissionId}/review`,
      data,
      SkillSubmissionItemSchema
    )
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
    return api.get<BetterStackMonitoringData>(endpoint, undefined, BetterStackMonitoringDataSchema)
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
    return api.get<PostHogAnalyticsData>(endpoint, undefined, PostHogAnalyticsDataSchema)
  },

  async manualUnlockChapter(courseId: string, userId: string): Promise<{ message: string; lock_state: LearnerLockState }> {
    return api.post(API_CONFIG.ENDPOINTS.PROGRESS.MANUAL_UNLOCK(courseId, userId), {})
  },
}
