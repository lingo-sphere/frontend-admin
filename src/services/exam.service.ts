/**
 * @file exam.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ exam
 */

import { api } from '@/services/api.client'
import {
  ToeicExamItemSchema,
  ToeicExamsResponseSchema,
  type ToeicExamItem,
  type CreateExamDto,
} from '@/schemas/exam.schema'

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

  async getExamById(id: string): Promise<ToeicExamItem | null> {
    try {
      return await api.get<ToeicExamItem>(`/exams/${id}`, undefined, ToeicExamItemSchema)
    } catch {
      return null
    }
  },

  async createExam(dto: CreateExamDto): Promise<ToeicExamItem> {
    return api.post<ToeicExamItem>('/exams', dto, ToeicExamItemSchema)
  },

  async updateExam(id: string, dto: Partial<CreateExamDto>): Promise<ToeicExamItem> {
    return api.put<ToeicExamItem>(`/exams/${id}`, dto, ToeicExamItemSchema)
  },

  async saveExamQuestions(examId: string, questions: any[], audioUrl?: string): Promise<ToeicExamItem> {
    return this.updateExam(examId, {
      questions,
      total_questions: questions.length,
      ...(audioUrl ? { audio_url: audioUrl } : {}),
    } as any)
  },

  async deleteExam(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/exams/${id}`)
  },
}

export const examService = examAdminService
