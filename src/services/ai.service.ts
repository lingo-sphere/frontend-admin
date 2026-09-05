/**
 * @file ai.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ ai
 */

import { api } from '@/services/api.client'
import {
  type GenerateQuizItem,
  type TeacherGenerateQuizResponse,
  AiModelListSchema,
  type AiModelItem,
} from '@/schemas/ai.schema'
import { type QuizQuestionItem } from '@/schemas/course.schema'

export type { QuizQuestionItem, GenerateQuizItem, TeacherGenerateQuizResponse, AiModelItem }

export interface TeacherGenerateQuizPayload {
  content_or_topic: string
  question_count?: number
  cefr_level?: string
}

export const aiAdminService = {
  async generateQuizForTeacher(
    payloadOrTopic: TeacherGenerateQuizPayload | string,
    questionCount = 5,
    cefrLevel = 'B1'
  ): Promise<TeacherGenerateQuizResponse & { items: QuizQuestionItem[] }> {
    let topicStr = ''
    let count = questionCount
    let level = cefrLevel

    if (typeof payloadOrTopic === 'string') {
      topicStr = payloadOrTopic
    } else {
      topicStr = payloadOrTopic.content_or_topic
      count = payloadOrTopic.question_count ?? questionCount
      level = payloadOrTopic.cefr_level ?? cefrLevel
    }

    const res = await api.post<Record<string, unknown>>('/ai/teacher/generate-quiz', {
      content_or_topic: topicStr,
      question_count: count,
      cefr_level: level,
    })

    const rawQuestions = Array.isArray(res?.questions) ? res.questions : []
    const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }

    const formattedLegacy: GenerateQuizItem[] = []
    const formattedNormalized: QuizQuestionItem[] = []

    rawQuestions.forEach((q: Record<string, unknown>) => {
      let optionsList: string[] = []
      if (Array.isArray(q.options)) {
        optionsList = q.options.map(String)
      } else if (typeof q.options === 'object' && q.options !== null) {
        const optObj = q.options as Record<string, string>
        optionsList = [
          optObj.A || '',
          optObj.B || '',
          optObj.C || '',
          optObj.D || '',
        ].filter(Boolean)
      }

      if (optionsList.length < 4) {
        optionsList = [
          optionsList[0] || 'Lựa chọn A',
          optionsList[1] || 'Lựa chọn B',
          optionsList[2] || 'Lựa chọn C',
          optionsList[3] || 'Lựa chọn D',
        ]
      }

      const rawAnswer = String(q.correct_answer || 'A').toUpperCase().trim()
      const correctIdx = letterMap[rawAnswer] !== undefined ? letterMap[rawAnswer] : 0
      const explanation = String(q.explanation || q.explanation_vi || '')

      formattedLegacy.push({
        question_text: String(q.question_text || ''),
        options: optionsList,
        correct_index: correctIdx,
        correct_answer: rawAnswer,
        explanation_vi: explanation,
        explanation,
      })

      formattedNormalized.push({
        question_text: String(q.question_text || ''),
        options: optionsList,
        correct_answer: ['A', 'B', 'C', 'D'][correctIdx] || 'A',
        explanation,
      })
    })

    return {
      topic: topicStr,
      passage_summary: typeof res?.passage_summary === 'string' ? res.passage_summary : '',
      model_used: typeof res?.model_used === 'string' ? res.model_used : 'groq (qwen/qwen3.8-27b)',
      questions: formattedLegacy,
      items: formattedNormalized,
    }
  },

  async getAiModels(): Promise<Array<{ model_name: string; provider: string; is_active: boolean }>> {
    return api.get<Array<{ model_name: string; provider: string; is_active: boolean }>>('/ai/models', undefined, AiModelListSchema)
  },
}

export const aiService = aiAdminService
