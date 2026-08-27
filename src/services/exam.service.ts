import { api } from '@/services/api-client'

export interface ToeicExamItem {
  id: string
  title: string
  type: 'FULL_TEST' | 'MINI_TEST' | 'PRE_TEST' | 'POST_MINI_TEST' | 'CHALLENGE_TEST'
  duration_minutes: number
  total_questions: number
  total_attempts?: number
  avg_score?: number
  is_published: boolean
  created_at?: string
}

export interface CreateExamDto {
  title: string
  type: string
  duration_minutes: number
  description?: string
  is_published?: boolean
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
