import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'

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
}
