import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { ToeicExam, ToeicPart } from '@/types/api.types'

export const examService = {
  // Lấy danh sách đề thi
  async getAllExams(params?: { exam_type?: string; is_free?: boolean }): Promise<ToeicExam[]> {
    return api.get<ToeicExam[]>(API_CONFIG.ENDPOINTS.EXAMS.LIST, params as Record<string, unknown>)
  },

  // Chi tiết đề thi
  async getExamById(id: string): Promise<ToeicExam> {
    return api.get<ToeicExam>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  // Tạo đề thi mới
  async createExam(payload: Partial<ToeicExam>): Promise<ToeicExam> {
    return api.post<ToeicExam>(API_CONFIG.ENDPOINTS.EXAMS.LIST, payload)
  },

  // Cập nhật đề thi
  async updateExam(id: string, payload: Partial<ToeicExam>): Promise<ToeicExam> {
    return api.put<ToeicExam>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id), payload)
  },

  // Xóa đề thi
  async deleteExam(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  // Danh sách TOEIC Parts
  async getToeicParts(): Promise<ToeicPart[]> {
    return api.get<ToeicPart[]>(API_CONFIG.ENDPOINTS.EXAMS.PARTS)
  },

  // Tạo TOEIC Part
  async createToeicPart(payload: Partial<ToeicPart>): Promise<ToeicPart> {
    return api.post<ToeicPart>(API_CONFIG.ENDPOINTS.EXAMS.PARTS, payload)
  },

  // Tạo đoạn văn Reading / Listening
  async createToeicPassage(payload: Record<string, unknown>): Promise<unknown> {
    return api.post(API_CONFIG.ENDPOINTS.EXAMS.PASSAGES, payload)
  },

  // Tạo câu hỏi đề thi
  async createToeicQuestion(payload: Record<string, unknown>): Promise<unknown> {
    return api.post(API_CONFIG.ENDPOINTS.EXAMS.QUESTIONS, payload)
  },

  // Gắn câu hỏi vào đề thi
  async addQuestionsToExam(examId: string, questionIds: string[]): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.EXAMS.ADD_QUESTIONS(examId), { question_ids: questionIds })
  },
}
