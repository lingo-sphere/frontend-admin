/**
 * @file exam.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ exam
 */

import { api } from '@/services/api-client'

export interface ToeicExamItem {
  id?: string
  _id?: string
  title: string
  course_id?: string
  course_title?: string
  module_id?: string
  module_title?: string
  author_id?: string
  type?: 'FULL_TEST' | 'MINI_TEST' | 'PRE_TEST' | 'POST_MINI_TEST' | 'CHALLENGE_TEST' | 'DIAGNOSTIC_TEST' | string
  duration_minutes?: number
  total_questions?: number
  passing_score?: number
  total_attempts?: number
  avg_score?: number
  is_published?: boolean
  is_system_placement?: boolean
  skills_enabled?: 'LR' | 'ALL' | 'SW' | string
  placement_type?: '2SKILLS' | '4SKILLS' | string
  created_at?: string
}

export interface CreateExamDto {
  title: string
  course_id?: string
  course_title?: string
  module_id?: string
  module_title?: string
  author_id?: string
  type: string
  duration_minutes: number
  total_questions?: number
  passing_score?: number
  description?: string
  is_published?: boolean
  is_system_placement?: boolean
  skills_enabled?: 'LR' | 'ALL' | 'SW' | string
  placement_type?: '2SKILLS' | '4SKILLS' | string
}

export const examAdminService = {
  async getExams(params?: Record<string, unknown>): Promise<ToeicExamItem[]> {
    try {
      const res = await api.get<ToeicExamItem[] | { items: ToeicExamItem[] }>('/exams', params)
      if (Array.isArray(res)) return res
      if (res && 'items' in res && Array.isArray(res.items)) return res.items
      return []
    } catch {
      return []
    }
  },

  async getExamById(id: string): Promise<ToeicExamItem | null> {
    try {
      return await api.get<ToeicExamItem>(`/exams/${id}`)
    } catch {
      return null
    }
  },

  async createExam(dto: CreateExamDto): Promise<ToeicExamItem> {
    return api.post<ToeicExamItem>('/exams', dto)
  },

  async updateExam(id: string, dto: Partial<CreateExamDto>): Promise<ToeicExamItem> {
    return api.put<ToeicExamItem>(`/exams/${id}`, dto)
  },

  async deleteExam(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/exams/${id}`)
  },
}

export const examService = examAdminService
