import { api } from '@/services/api-client'

export interface GenerateQuizItem {
  question_text: string
  options: string[]
  correct_index: number
  explanation_vi: string
}

export interface TeacherGenerateQuizResponse {
  topic: string
  questions: GenerateQuizItem[]
  model_used: string
}

export const aiAdminService = {
  async generateQuizForTeacher(topic: string, questionCount = 5, difficulty = 'MEDIUM'): Promise<TeacherGenerateQuizResponse> {
    return api.post<TeacherGenerateQuizResponse>('/ai/teacher/generate-quiz', {
      topic,
      question_count: questionCount,
      difficulty,
    })
  },

  async getAiModels(): Promise<Array<{ model_name: string; provider: string; is_active: boolean }>> {
    try {
      return await api.get<Array<{ model_name: string; provider: string; is_active: boolean }>>('/ai/models')
    } catch {
      return [
        { model_name: 'qwen/qwen3.8-27b', provider: 'GROQ_CLOUD', is_active: true },
        { model_name: 'gemini-3.1-flash-lite', provider: 'GOOGLE_GEMINI', is_active: true },
      ]
    }
  },
}
