// Service xử lý các yêu cầu API quản lý đề thi TOEIC và danh sách câu hỏi cho quản trị viên.

import { api } from '@/services/api.client'
import {
  ToeicExamItemSchema,
  ToeicExamsResponseSchema,
  type ToeicExamItem,
  type CreateExamDto,
} from '@/features/exams/schemas/exam.schema'

export type { ToeicExamItem, CreateExamDto }

export const examAdminService = {
  async getExams(params?: Record<string, unknown>): Promise<ToeicExamItem[]> {
    try {
      const res = await api.get<ToeicExamItem[] | { items: ToeicExamItem[] }>(
        '/exams',
        params,
        ToeicExamsResponseSchema
      )
      if (Array.isArray(res)) return res
      if (res && 'items' in res && Array.isArray(res.items)) return res.items
      return []
    } catch {
      return []
    }
  },

  async getAllExams(params?: Record<string, unknown>): Promise<ToeicExamItem[]> {
    return this.getExams(params)
  },

  async getExamById(id: string): Promise<ToeicExamItem> {
    return api.get<ToeicExamItem>(`/exams/${id}`, undefined, ToeicExamItemSchema)
  },

  async createExam(dto: Partial<CreateExamDto>): Promise<ToeicExamItem> {
    return api.post<ToeicExamItem>('/exams', dto, ToeicExamItemSchema)
  },

  async updateExam(id: string, dto: Partial<CreateExamDto>): Promise<ToeicExamItem> {
    return api.put<ToeicExamItem>(`/exams/${id}`, dto, ToeicExamItemSchema)
  },

  async saveExamQuestions(examId: string, questions: CreateExamDto['questions'], audioUrl?: string): Promise<ToeicExamItem> {
    return this.updateExam(examId, {
      questions,
      total_questions: questions?.length || 0,
      ...(audioUrl ? { audio_url: audioUrl } : {}),
    })
  },

  async deleteExam(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/exams/${id}`)
  },
}

export const examService = examAdminService
