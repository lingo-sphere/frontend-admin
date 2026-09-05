/**
 * @file progress.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ progress và quản lý bài nộp kỹ năng Speaking/Writing của học viên cho giáo viên chấm/sửa điểm
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { BetterStackMonitoringData, PostHogAnalyticsData } from '@/types/api.types'

export interface StudentModuleProgress {
  module_id: string
  title?: string
  order_index?: number
  status: string
  challenge_score?: number
  challenge_taken?: boolean
  is_passed_by_challenge?: boolean
  post_mini_score?: number
  best_score?: number
}

export interface StudentProgressItem {
  user_id: string
  full_name?: string
  email?: string
  avatar_url?: string
  status?: string
  course_id?: string
  course_title?: string
  progress_percentage: number
  completed_lessons: number
  total_lessons: number
  baseline_score?: number
  baseline_source?: string
  final_test_score?: number
  total_score_growth?: number
  modules_progress?: StudentModuleProgress[]
  last_accessed_at?: string
  created_at?: string
}

export interface CourseStudentsProgressResponse {
  course_id: string
  total_students: number
  completed_students: number
  average_progress_percentage: number
  students: StudentProgressItem[]
}

export interface SkillSubmissionItem {
  _id: string
  user_id: string
  user_name: string
  user_email?: string
  course_id: string
  course_title?: string
  module_id?: string
  test_type: string
  skill: 'SPEAKING' | 'WRITING' | 'LISTENING' | 'READING'
  audio_url?: string
  essay_text?: string
  whisper_transcript?: string
  ai_score: number
  ai_feedback?: {
    pronunciation_score?: number
    fluency_score?: number
    grammar_score?: number
    vocabulary_score?: number
    detailed_comment?: string
    improvement_tips?: string[]
  }
  teacher_score?: number
  teacher_feedback?: string
  teacher_id?: string
  teacher_name?: string
  is_teacher_reviewed: boolean
  final_score: number
  status: 'AI_GRADED' | 'TEACHER_REVIEWED'
  created_at?: string
}

export const progressService = {
  async getCourseStudentsProgress(courseId: string): Promise<CourseStudentsProgressResponse> {
    const res = await api.get<any>(API_CONFIG.ENDPOINTS.PROGRESS.STUDENTS(courseId))
    const payload = (res && res.data && (res.data.students || res.data.total_students !== undefined)) ? res.data : res

    if (payload && payload.students && Array.isArray(payload.students)) {
      return payload as CourseStudentsProgressResponse
    }
    if (Array.isArray(res)) {
      return {
        course_id: courseId,
        total_students: res.length,
        completed_students: 0,
        average_progress_percentage: 0,
        students: res,
      }
    }
    return {
      course_id: courseId,
      total_students: 0,
      completed_students: 0,
      average_progress_percentage: 0,
      students: [],
    }
  },

  async getGrowthChart(courseId: string): Promise<unknown> {
    return api.get(API_CONFIG.ENDPOINTS.PROGRESS.GROWTH_CHART(courseId))
  },

  async getMyProgress(): Promise<unknown[]> {
    return api.get<unknown[]>(API_CONFIG.ENDPOINTS.PROGRESS.MY_COURSES)
  },

  async getCourseSubmissions(courseId: string, moduleId?: string): Promise<SkillSubmissionItem[]> {
    const qs = moduleId ? `?moduleId=${moduleId}` : ''
    return api.get<SkillSubmissionItem[]>(`/progress/teacher/courses/${courseId}/submissions${qs}`)
  },

  async reviewSubmission(
    submissionId: string,
    data: { teacher_score: number; teacher_feedback?: string }
  ): Promise<SkillSubmissionItem> {
    return api.post<SkillSubmissionItem>(`/progress/teacher/submissions/${submissionId}/review`, data)
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
