// Service xử lý API nhập đề thi thông minh TOEIC bằng AI và quét bảng đáp án tự động cho trang quản trị.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'

export interface AiExtractedQuestion {
  id: string
  question_number: number
  part_number: number
  skill_type: 'LISTENING' | 'READING'
  question_type: string
  question_text: string
  options: Array<{ key: string; text: string }>
  correct_answer: string
  explanation: string
  media_url?: string
  image_url?: string
}

export interface AiImportExamPayload {
  title: string
  code?: string
  exam_series?: string
  release_year?: number
  duration_minutes?: number
  audio_url?: string
  audio_base64?: string
  audio_filename?: string
  key_lc_base64?: string
  key_rc_base64?: string
  questions?: AiExtractedQuestion[]
  is_published?: boolean
}

export interface AiImportResponse {
  success: boolean
  message: string
  exam_id?: string
  exam_title?: string
  exam_code?: string
  total_questions: number
  audio_url?: string
  questions?: AiExtractedQuestion[]
}

export interface AiExtractKeysPayload {
  key_lc_base64: string
  key_rc_base64: string
}

export interface LocalBatchImportPayload {
  folder_path: string
  exam_series?: string
  release_year?: number
  test_names?: string[]
}

export const toeicAiImportService = {
  async extractAnswerKeys(payload: AiExtractKeysPayload): Promise<Record<number, string>> {
    return api.post<Record<number, string>>(API_CONFIG.ENDPOINTS.EXAMS.AI_EXTRACT_KEYS, payload)
  },

  async previewAiExam(payload: AiImportExamPayload): Promise<AiImportResponse> {
    return api.post<AiImportResponse>(API_CONFIG.ENDPOINTS.EXAMS.AI_PREVIEW, payload)
  },

  async importAiExam(payload: AiImportExamPayload): Promise<AiImportResponse> {
    return api.post<AiImportResponse>(API_CONFIG.ENDPOINTS.EXAMS.AI_IMPORT, payload)
  },

  async importLocalBatch(payload: LocalBatchImportPayload): Promise<AiImportResponse[]> {
    return api.post<AiImportResponse[]>(API_CONFIG.ENDPOINTS.EXAMS.AI_LOCAL_BATCH, payload)
  },
}
