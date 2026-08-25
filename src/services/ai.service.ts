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

  async getAiModels(): Promise<AiModelConfig[]> {
    return api.get<AiModelConfig[]>(API_CONFIG.ENDPOINTS.AI.MODELS)
  },

  async createAiModel(payload: Partial<AiModelConfig>): Promise<AiModelConfig> {
    return api.post<AiModelConfig>(API_CONFIG.ENDPOINTS.AI.MODELS, payload)
  },

  async getAiPrompts(): Promise<AiPromptTemplate[]> {
    return api.get<AiPromptTemplate[]>(API_CONFIG.ENDPOINTS.AI.PROMPTS)
  },

  async createAiPrompt(payload: Partial<AiPromptTemplate>): Promise<AiPromptTemplate> {
    return api.post<AiPromptTemplate>(API_CONFIG.ENDPOINTS.AI.PROMPTS, payload)
  },

  async generateAiText(payload: GenerateAiTextPayload): Promise<{ result: string; model_used: string }> {
    return api.post<{ result: string; model_used: string }>(API_CONFIG.ENDPOINTS.AI.GENERATE, payload)
  },

  async generateQuizForTeacher(topicOrText: string, numberOfQuestions: number = 5): Promise<unknown> {
    return api.post(API_CONFIG.ENDPOINTS.AI.TEACHER_GENERATE_QUIZ, {
      topic: topicOrText,
      number_of_questions: numberOfQuestions,
    })
  },
}
