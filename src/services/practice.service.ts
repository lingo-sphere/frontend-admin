/**
 * @file practice.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ practice
 */

import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { PracticeSet, PracticeQuestion, ListeningExercise, SpeakingExercise, WritingExercise } from '@/types/api.types'

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
}
