// Service xử lý các yêu cầu API quản lý đề thi TOEIC, bài test đầu vào và chi tiết kết quả cho quản trị viên.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  ToeicExamItemSchema,
  ToeicExamsResponseSchema,
  type ToeicExamItem,
  type CreateExamDto,
} from '@/features/exams/schemas/exam.schema'

export type { ToeicExamItem, CreateExamDto }

export interface PlacementAttemptItem {
  _id: string
  attempt_id: string
  user_id: string
  learner_name: string
  learner_email: string
  learner_avatar_url?: string
  learner_target_score?: number
  exam_id: string
  exam_title: string
  exam_code: string
  exam_type: string
  attempt_type: string
  total_scaled_score: number
  listening_scaled_score: number
  reading_scaled_score: number
  listening_raw_score: number
  reading_raw_score: number
  correct_questions: number
  incorrect_questions: number
  skipped_questions: number
  total_questions: number
  total_time_seconds: number
  started_at?: string
  submitted_at?: string
  created_at?: string
  status: string
}

export interface PlacementAttemptStats {
  total_attempts: number
  unique_learners_count: number
  avg_total_score: number
  avg_listening_score: number
  avg_reading_score: number
  highest_score: number
  lowest_score: number
}

export interface PaginatedPlacementAttempts {
  meta: {
    current: number
    pageSize: number
    pages: number
    total: number
  }
  result: PlacementAttemptItem[]
  stats: PlacementAttemptStats
}

export interface AdminAttemptQuestion {
  question_text_en?: string
  question_text_vi?: string
  options?: Array<{ key: string; text_en: string }>
  explanation_en?: string
  correct_option?: string
  image_url?: string
  audio_url?: string
}

export interface AdminAttemptAnswer {
  _id?: string
  attempt_id: string
  user_id?: string
  question_id: string | AdminAttemptQuestion
  part_number: number
  question_number: number
  selected_option?: string
  correct_option?: string
  is_correct: boolean
  answer_time_seconds?: number
}

export interface AdminAttemptPartAnalysis {
  _id?: string
  part_number: number
  section: 'LISTENING' | 'READING'
  total_questions: number
  correct_count: number
  incorrect_count: number
  skipped_count: number
  raw_score: number
  accuracy_percent: number
}

export interface AdminAttemptResultDetail {
  attempt: PlacementAttemptItem
  part_analysis: AdminAttemptPartAnalysis[]
  answers: AdminAttemptAnswer[]
  learner?: {
    user_id: string
    full_name?: string
    email?: string
    avatar_url?: string
    phone_number?: string
    target_toeic_score?: number
    placement_test_score?: number
    current_estimated_score?: number
  }
  exam?: {
    _id: string
    title: string
    code: string
    duration_minutes: number
    total_questions: number
  }
}

export const examAdminService = {
  async getExams(params?: Record<string, unknown>): Promise<ToeicExamItem[]> {
    try {
      const res = await api.get<ToeicExamItem[] | { items: ToeicExamItem[] }>(
        API_CONFIG.ENDPOINTS.EXAMS.LIST,
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
    return api.get<ToeicExamItem>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id), undefined, ToeicExamItemSchema)
  },

  async createExam(dto: Partial<CreateExamDto>): Promise<ToeicExamItem> {
    return api.post<ToeicExamItem>(API_CONFIG.ENDPOINTS.EXAMS.LIST, dto, ToeicExamItemSchema)
  },

  async updateExam(id: string, dto: Partial<CreateExamDto>): Promise<ToeicExamItem> {
    return api.put<ToeicExamItem>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id), dto, ToeicExamItemSchema)
  },

  async saveExamQuestions(examId: string, questions: CreateExamDto['questions'], audioUrl?: string): Promise<ToeicExamItem> {
    return this.updateExam(examId, {
      questions,
      total_questions: questions?.length || 0,
      ...(audioUrl ? { audio_url: audioUrl } : {}),
    })
  },

  async deleteExam(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  async getPlacementAttempts(params?: Record<string, unknown>): Promise<PaginatedPlacementAttempts> {
    return api.get<PaginatedPlacementAttempts>(
      API_CONFIG.ENDPOINTS.EXAMS.ADMIN_PLACEMENT_ATTEMPTS,
      params
    )
  },

  async getAdminAttemptResult(attemptId: string): Promise<AdminAttemptResultDetail> {
    return api.get<AdminAttemptResultDetail>(
      API_CONFIG.ENDPOINTS.EXAMS.ADMIN_ATTEMPT_RESULT(attemptId)
    )
  },

  async getAdminUserAttempts(userId: string): Promise<PlacementAttemptItem[]> {
    return api.get<PlacementAttemptItem[]>(
      API_CONFIG.ENDPOINTS.EXAMS.ADMIN_USER_ATTEMPTS(userId)
    )
  },
}

export const examService = examAdminService
