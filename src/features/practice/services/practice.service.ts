// Dịch vụ API xử lý nghiệp vụ luyện tập và cấu hình ngữ cảnh trong hệ thống Quản trị.
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { PracticeSet, PracticeQuestion, ListeningExercise, SpeakingExercise, WritingExercise } from '@/types/api.types'

export interface PracticeContextTreeNode extends PracticeContext {
  children?: PracticeContextTreeNode[]
}

export interface PracticeContext {
  _id: string
  name: string
  name_en?: string
  name_vi?: string
  description?: string
  description_vi?: string
  code: string
  level: number
  parent_id?: string
  domains?: string[]
  cefr_level?: string
  target_level?: string
  tags?: string[]
  icon?: string
  is_selectable?: boolean
  sort_order?: number
  status?: string
  path?: string[]
  path_string?: string
  total_questions?: number
  total_exercises?: number
  created_at?: string
  updated_at?: string
}

export interface CreatePracticeContextPayload {
  code?: string
  name_en: string
  name_vi?: string
  description?: string
  description_vi?: string
  parent_id?: string
  domains?: string[]
  cefr_level?: string
  target_level?: string
  tags?: string[]
  icon?: string
  is_selectable?: boolean
  sort_order?: number
  status?: string
}

export type UpdatePracticeContextPayload = Partial<CreatePracticeContextPayload>

export const practiceService = {

  async getAllPracticeSets(): Promise<PracticeSet[]> {
    return api.get<PracticeSet[]>(API_CONFIG.ENDPOINTS.PRACTICE.SETS)
  },

  async getPracticeSetById(id: string): Promise<PracticeSet> {
    return api.get<PracticeSet>(API_CONFIG.ENDPOINTS.PRACTICE.SET_BY_ID(id))
  },

  async createPracticeSet(payload: Partial<PracticeSet>): Promise<PracticeSet> {
    return api.post<PracticeSet>(API_CONFIG.ENDPOINTS.PRACTICE.SETS, payload)
  },

  async getQuestionsBySetId(setId: string): Promise<PracticeQuestion[]> {
    return api.get<PracticeQuestion[]>(API_CONFIG.ENDPOINTS.PRACTICE.SET_QUESTIONS(setId))
  },

  async createPracticeQuestion(payload: Partial<PracticeQuestion>): Promise<PracticeQuestion> {
    return api.post<PracticeQuestion>(API_CONFIG.ENDPOINTS.PRACTICE.QUESTIONS, payload)
  },

  async getAllListeningExercises(): Promise<ListeningExercise[]> {
    return api.get<ListeningExercise[]>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING)
  },

  async getListeningExerciseById(id: string): Promise<ListeningExercise> {
    return api.get<ListeningExercise>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_BY_ID(id))
  },

  async createListeningExercise(payload: Partial<ListeningExercise>): Promise<ListeningExercise> {
    return api.post<ListeningExercise>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING, payload)
  },

  async getAllSpeakingExercises(): Promise<SpeakingExercise[]> {
    return api.get<SpeakingExercise[]>(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING)
  },

  async getSpeakingExerciseById(id: string): Promise<SpeakingExercise> {
    return api.get<SpeakingExercise>(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_BY_ID(id))
  },

  async createSpeakingExercise(payload: Partial<SpeakingExercise>): Promise<SpeakingExercise> {
    return api.post<SpeakingExercise>(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING, payload)
  },

  async getAllWritingExercises(): Promise<WritingExercise[]> {
    return api.get<WritingExercise[]>(API_CONFIG.ENDPOINTS.PRACTICE.WRITING)
  },

  async getWritingExerciseById(id: string): Promise<WritingExercise> {
    return api.get<WritingExercise>(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_BY_ID(id))
  },

  async createWritingExercise(payload: Partial<WritingExercise>): Promise<WritingExercise> {
    return api.post<WritingExercise>(API_CONFIG.ENDPOINTS.PRACTICE.WRITING, payload)
  },

  async getDailyJournalPrompt(): Promise<{ prompt: string; topic: string; tips: string[] }> {
    return api.get<{ prompt: string; topic: string; tips: string[] }>(API_CONFIG.ENDPOINTS.PRACTICE.JOURNAL_PROMPT)
  },

  async getContexts(params?: { status?: string; include_disabled?: boolean; level?: number; parent_id?: string }): Promise<PracticeContext[]> {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.include_disabled) query.append('include_disabled', 'true')
    if (params?.level !== undefined) query.append('level', String(params.level))
    if (params?.parent_id) query.append('parent_id', params.parent_id)
    const qs = query.toString()
    return api.get<PracticeContext[]>(`${API_CONFIG.ENDPOINTS.PRACTICE.CONTEXTS}${qs ? '?' + qs : ''}`)
  },

  async getContextsByLevel(level: number): Promise<PracticeContext[]> {
    return api.get<PracticeContext[]>(API_CONFIG.ENDPOINTS.PRACTICE.CONTEXTS_BY_LEVEL(level))
  },

  async getContextTree(): Promise<PracticeContextTreeNode[]> {
    return api.get<PracticeContextTreeNode[]>(API_CONFIG.ENDPOINTS.PRACTICE.CONTEXTS_TREE)
  },

  async createContext(payload: CreatePracticeContextPayload): Promise<PracticeContext> {
    return api.post<PracticeContext>(API_CONFIG.ENDPOINTS.PRACTICE.CONTEXTS, payload)
  },

  async updateContext(id: string, payload: UpdatePracticeContextPayload): Promise<PracticeContext> {
    return api.put<PracticeContext>(API_CONFIG.ENDPOINTS.PRACTICE.CONTEXT_BY_ID(id), payload)
  },

  async deleteContext(id: string): Promise<{ message: string; id: string }> {
    return api.delete<{ message: string; id: string }>(API_CONFIG.ENDPOINTS.PRACTICE.CONTEXT_BY_ID(id))
  },

  async reorderContexts(items: { id: string; sort_order: number }[]): Promise<{ success: boolean; count: number }> {
    return api.put<{ success: boolean; count: number }>(API_CONFIG.ENDPOINTS.PRACTICE.CONTEXTS_REORDER, { items })
  },
}
