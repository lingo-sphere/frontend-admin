import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { AiModelConfig, AiPromptTemplate } from '@/types/api.types'

export interface GenerateAiTextPayload {
  prompt: string
  model?: string
  temperature?: number
  system_instruction?: string
}

export const aiService = {
  // Lấy danh sách AI Models
  async getAiModels(): Promise<AiModelConfig[]> {
    return api.get<AiModelConfig[]>(API_CONFIG.ENDPOINTS.AI.MODELS)
  },

  // Tạo AI Model mới
  async createAiModel(payload: Partial<AiModelConfig>): Promise<AiModelConfig> {
    return api.post<AiModelConfig>(API_CONFIG.ENDPOINTS.AI.MODELS, payload)
  },

  // Lấy danh sách AI Prompts
  async getAiPrompts(): Promise<AiPromptTemplate[]> {
    return api.get<AiPromptTemplate[]>(API_CONFIG.ENDPOINTS.AI.PROMPTS)
  },

  // Tạo AI Prompt mới
  async createAiPrompt(payload: Partial<AiPromptTemplate>): Promise<AiPromptTemplate> {
    return api.post<AiPromptTemplate>(API_CONFIG.ENDPOINTS.AI.PROMPTS, payload)
  },

  // Sinh nội dung bằng AI (Ollama / LLM)
  async generateAiText(payload: GenerateAiTextPayload): Promise<{ result: string; model_used: string }> {
    return api.post<{ result: string; model_used: string }>(API_CONFIG.ENDPOINTS.AI.GENERATE, payload)
  },

  // AI tự động sinh câu hỏi trắc nghiệm bài học cho giáo viên / admin
  async generateQuizForTeacher(topicOrText: string, numberOfQuestions: number = 5): Promise<unknown> {
    return api.post(API_CONFIG.ENDPOINTS.AI.TEACHER_GENERATE_QUIZ, {
      topic: topicOrText,
      number_of_questions: numberOfQuestions,
    })
  },
}
