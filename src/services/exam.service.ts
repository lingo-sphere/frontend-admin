import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { ToeicExam, ToeicPart } from '@/types/api.types'

export const examService = {

  async getAllExams(params?: { exam_type?: string; is_free?: boolean }): Promise<ToeicExam[]> {
    return api.get<ToeicExam[]>(API_CONFIG.ENDPOINTS.EXAMS.LIST, params as Record<string, unknown>)
  },

  async getExamById(id: string): Promise<ToeicExam> {
    return api.get<ToeicExam>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  async createExam(payload: Partial<ToeicExam>): Promise<ToeicExam> {
    return api.post<ToeicExam>(API_CONFIG.ENDPOINTS.EXAMS.LIST, payload)
  },

  async updateExam(id: string, payload: Partial<ToeicExam>): Promise<ToeicExam> {
    return api.put<ToeicExam>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id), payload)
  },

  async deleteExam(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  async getToeicParts(): Promise<ToeicPart[]> {
    return api.get<ToeicPart[]>(API_CONFIG.ENDPOINTS.EXAMS.PARTS)
  },

  async createToeicPart(payload: Partial<ToeicPart>): Promise<ToeicPart> {
    return api.post<ToeicPart>(API_CONFIG.ENDPOINTS.EXAMS.PARTS, payload)
  },

  async createToeicPassage(payload: Record<string, unknown>): Promise<unknown> {
    return api.post(API_CONFIG.ENDPOINTS.EXAMS.PASSAGES, payload)
  },

  async createToeicQuestion(payload: Record<string, unknown>): Promise<unknown> {
    return api.post(API_CONFIG.ENDPOINTS.EXAMS.QUESTIONS, payload)
  },

  async addQuestionsToExam(examId: string, questionIds: string[]): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.EXAMS.ADD_QUESTIONS(examId), { question_ids: questionIds })
  },
}
